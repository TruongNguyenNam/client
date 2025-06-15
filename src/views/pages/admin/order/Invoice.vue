<template>
  <div class="layout-container">
    <InvoiceHeader 
      :currentIsPos="currentIsPos"
      @set-invoice-type="setInvoiceType"
      @add-invoice="addInvoiceTab"
    />
  
    <ProductList
      :products="filteredProducts"
      :selectedInvoice="selectedInvoice"
      @add-product="addProductToActiveInvoice"
    />
  
    <CartSection
      v-if="invoiceTabs.length > 0 && activeTabIndex >= 0"
      :invoiceTabs="invoiceTabs"
      v-model:activeTabIndex="activeTabIndex"
      @open-payment="openPaymentToolbar"
      @remove-tab="removeTab"
      @remove-item="removeItem"
      @increment-quantity="incrementQuantity"
      @decrement-quantity="decrementQuantity"
    />
  
    <PaymentToolbar
      v-if="selectedInvoice"
      :invoice="selectedInvoice"
      :customers="customers"
      :paymentMethods="paymentMethods"
      :couponUsage="couponUsage"
      :carriers="carriers" 
      :changeAmount="changeAmount"
      @update-total="updateTotal"
      @update-change="updateChange"
      @close="closePaymentToolbar"
      @complete-payment="completePayment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import type { ProductResponse } from '../../../../model/admin/product';
import type { OrderResponse, CreateInvoiceRequest, OrderRequest } from '../../../../model/admin/order';
import type { CustomerResponse } from '../../../../model/admin/customer';
import type { CouponUsageResponse } from '../../../../model/admin/couponUsage';
import type { PaymentMethodResponse } from '../../../../model/admin/paymentMethod';
import type { ShipmentResponse } from '../../../../model/admin/shipment';
import type { CarrierResponse } from '../../../../model/admin/carrier';
import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import { OrderService } from '../../../../service/admin/OrderService';
import { PaymentMethodService } from '../../../../service/admin/PaymentMethodService';
import { ShipmentService } from '../../../../service/admin/ShipmentService';
import { CouponUsageService } from '../../../../service/admin/CouponUsageService';
import { CarrierService } from '../../../../service/admin/CarrierService';
import InvoiceHeader from './InvoiceHeader.vue';
import ProductList from './ProductList.vue';
import CartSection from './CartSection.vue';
import PaymentToolbar from './PaymentToolbar.vue';

// Các biến state
const listProduct = ref<ProductResponse[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const toast = useToast();
const activeTabIndex = ref(0);
const invoiceTabs = ref<any[]>([]);
const currentIsPos = ref(true);
const selectedInvoice = ref<any | null>(null);
const searchQuery = ref('');
const customers = ref<CustomerResponse[]>([]);
const paymentMethods = ref<PaymentMethodResponse[]>([]);
const couponUsage = ref<CouponUsageResponse[]>([]);
const shipments = ref<ShipmentResponse[]>([]);
const carriers = ref<CarrierResponse[]>([]);
const changeAmount = ref(0);
const invoiceTimeouts = ref<{ [key: string]: number }>({}); // Lưu trữ timeout cho mỗi hóa đơn

// Lưu invoiceTabs vào localStorage
const saveInvoicesToStorage = () => {
  localStorage.setItem('invoiceTabs', JSON.stringify(invoiceTabs.value));
};

// Khôi phục invoiceTabs từ localStorage
const loadInvoicesFromStorage = () => {
  const storedInvoices = localStorage.getItem('invoiceTabs');
  if (storedInvoices) {
    invoiceTabs.value = JSON.parse(storedInvoices);
    // Khôi phục timeout cho các hóa đơn hiện có
    invoiceTabs.value.forEach(invoice => {
      const timeElapsed = Date.now() - new Date(invoice.createdAt).getTime();
      const timeRemaining = 300000 - timeElapsed; // 5 phút = 300000ms
      if (timeRemaining > 0) {
        startAutoRemoveTimer(invoice, timeRemaining);
      } else {
        removeTabByOrderCode(invoice.orderCode);
      }
    });
  }
};

// Bắt đầu đếm ngược 5 phút để xóa hóa đơn
const startAutoRemoveTimer = (invoice: any, duration: number = 300000) => {
  if (invoiceTimeouts.value[invoice.orderCode]) {
    clearTimeout(invoiceTimeouts.value[invoice.orderCode]); // Xóa timeout cũ nếu có
  }
  invoiceTimeouts.value[invoice.orderCode] = setTimeout(() => {
    removeTabByOrderCode(invoice.orderCode);
  }, duration) as any;
};

// Xóa tab theo orderCode
const removeTabByOrderCode = (orderCode: string) => {
  const index = invoiceTabs.value.findIndex(tab => tab.orderCode === orderCode);
  if (index !== -1) {
    invoiceTabs.value.splice(index, 1);
    saveInvoicesToStorage();
    if (activeTabIndex.value >= invoiceTabs.value.length) {
      activeTabIndex.value = Math.max(0, invoiceTabs.value.length - 1);
    }
    delete invoiceTimeouts.value[orderCode];
    toast.add({
      severity: 'info',
      summary: 'Hóa đơn tự động xóa',
      detail: `Hóa đơn ${orderCode} đã tự động bị xóa sau 5 phút`,
      life: 3000
    });
  }
};

// Reset timer khi có tương tác
const resetTimerOnInteraction = (invoice: any) => {
  if (invoiceTimeouts.value[invoice.orderCode]) {
    clearTimeout(invoiceTimeouts.value[invoice.orderCode]);
    startAutoRemoveTimer(invoice);
  }
};

// Load dữ liệu sản phẩm
const getAllChildProduct = async () => {
  loading.value = true;
  try {
    const response = await ProductService.getAllChildProducts();
    if (response && response.data) {
      listProduct.value = response.data;
      totalRecords.value = response.data.length;
    } else {
      listProduct.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    listProduct.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

const getAllCustomers = async () => {
  loading.value = true;
  try {
    const response = await CustomerService.getAllUsers();
    if (response && response.data) {
      customers.value = response.data;
      console.log("Lấy thành công danh sách khách hàng:", customers.value);
    } else {
      customers.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error);
    customers.value = [];
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải danh sách khách hàng', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

// Load danh sách phương thức thanh toán
const getAllPaymentMethods = async () => {
  loading.value = true;
  try {
    const response = await PaymentMethodService.getAllPaymentMethod();
    if (response && response.data) {
      paymentMethods.value = response.data;
      console.log("Lấy thành công danh sách phương thức thanh toán:", paymentMethods.value);
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phương thức thanh toán:", error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải danh sách phương thức thanh toán', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

// Load danh sách mã giảm giá
const getAllCouponUsage = async (customerId: number) => {
  loading.value = true;
  try {
    const response = await CouponUsageService.getAllCouponUsage(customerId);
    if (response && response.data) {
      couponUsage.value = response.data;
      console.log("Lấy thành công danh sách mã giảm giá ban đầu:", couponUsage.value);
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải danh sách mã giảm giá', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

// Load danh sách đơn vị vận chuyển
const getAllCarriers = async () => {
  loading.value = true;
  try {
    const response = await CarrierService.getAllCarriers();
    if (response && response.data) {
      carriers.value = response.data;
      console.log("Lấy thành công danh sách đơn vị vận chuyển:", carriers.value);
    } else {
      carriers.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn vị vận chuyển:", error);
    carriers.value = [];
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải danh sách đơn vị vận chuyển', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

// Load danh sách vận chuyển
const getAllShipments = async () => {
  loading.value = true;
  try {
    const response = await ShipmentService.getAllshipment();
    if (response && response.data) {
      shipments.value = response.data;
      console.log("Lấy thành công danh sách vận chuyển:", shipments.value);
    } else {
      shipments.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vận chuyển:", error);
    shipments.value = [];
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải danh sách vận chuyển', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

// Gọi tất cả API khi component được mount
onMounted(async () => {
  try {
    loading.value = true;
    await Promise.all([
      getAllChildProduct(),
      getAllCustomers(),
      getAllPaymentMethods(),
      getAllCouponUsage(1),
      getAllCarriers(),
      getAllShipments()
    ]);
    loadInvoicesFromStorage(); // Khôi phục hóa đơn từ localStorage
    console.log("Tải dữ liệu thành công");
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
});

// Dọn dẹp timeout khi component bị hủy
onUnmounted(() => {
  Object.keys(invoiceTimeouts.value).forEach(orderCode => {
    clearTimeout(invoiceTimeouts.value[orderCode]);
  });
});

// Lọc sản phẩm
const filteredProducts = computed(() => {
  if (!searchQuery.value) return listProduct.value;
  return listProduct.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

// Các method chính
const setInvoiceType = (isPos: boolean) => {
  currentIsPos.value = isPos;
};

const addInvoiceTab = async () => {
  try {
    loading.value = true;
    const createInvoiceRequest: CreateInvoiceRequest = {
      isPos: currentIsPos.value
    };
    const response = await OrderService.createOrder(createInvoiceRequest);
    if (response && response.data) {
      const orderData = response.data;
      const newInvoice = {
        id: orderData.id,
        orderCode: orderData.orderCode,
        userId: null,
        orderStatus: orderData.orderStatus,
        orderTotal: orderData.orderTotal || 0,
        isPos: orderData.isPos,
        deleted: orderData.deleted,
        orderDate: orderData.orderDate,
        createdDate: orderData.createdDate,
        createdAt: new Date().toISOString(), // Thêm thời gian tạo để theo dõi
        items: [],
        customerName: '',
        discount: 0,
        paidAmount: 0, 
        paymentMethod: paymentMethods.value[0]?.name || 'Tiền mặt',
        paymentMethodId: paymentMethods.value[0]?.id || 1,
        notes: '',
        carrierId: carriers.value[0]?.id || null,
        estimatedDeliveryDate: null,
        couponUsageIds: [] 
      };
      invoiceTabs.value.push(newInvoice);
      activeTabIndex.value = invoiceTabs.value.length - 1;
      saveInvoicesToStorage(); // Lưu vào localStorage
      startAutoRemoveTimer(newInvoice); // Bắt đầu đếm ngược 5 phút
      toast.add({ 
        severity: 'success', 
        summary: 'Thành công', 
        detail: `Đã tạo hóa đơn ${newInvoice.orderCode}`, 
        life: 3000 
      });
    }
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tạo hóa đơn. Vui lòng thử lại sau.', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

const removeTab = (index: number) => {
  const orderCode = invoiceTabs.value[index].orderCode;
  invoiceTabs.value.splice(index, 1);
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  if (activeTabIndex.value >= invoiceTabs.value.length) {
    activeTabIndex.value = Math.max(0, invoiceTabs.value.length - 1);
  }
  clearTimeout(invoiceTimeouts.value[orderCode]); // Xóa timeout
  delete invoiceTimeouts.value[orderCode];
};

const addProductToActiveInvoice = (product: any) => {
  if (invoiceTabs.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Chưa có đơn hàng', detail: 'Vui lòng tạo đơn hàng trước', life: 3000 });
    return;
  }
  const stockQuantity = product?.stockQuantity ?? 0;
  if (stockQuantity === 0) {
    toast.add({ severity: 'error', summary: 'Hết hàng', detail: `${product.name} hiện đã hết hàng`, life: 3000 });
    return;
  }
  const activeInvoice = invoiceTabs.value[activeTabIndex.value];
  const existingItem = activeInvoice.items.find((item: any) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    activeInvoice.items.push({ 
      ...product, 
      quantity: 1, 
      price: product.price || 0 
    });
  }
  recalculateTotal(activeInvoice);
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  resetTimerOnInteraction(activeInvoice); // Reset timer khi có tương tác
};

const incrementQuantity = (invoice: any, index: number) => {
  const product = listProduct.value.find((p: any) => p.id === invoice.items[index].id);
  const stockQuantity = product?.stockQuantity ?? 0;
  if (product && invoice.items[index].quantity >= stockQuantity) {
    toast.add({ severity: 'warn', summary: 'Hết hàng', detail: 'Không thể thêm số lượng, đã đạt giới hạn tồn kho', life: 3000 });
    return;
  }
  invoice.items[index].quantity += 1;
  recalculateTotal(invoice);
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  resetTimerOnInteraction(invoice); // Reset timer khi có tương tác
};

const decrementQuantity = (invoice: any, index: number) => {
  if (invoice.items[index].quantity > 1) {
    invoice.items[index].quantity -= 1;
    recalculateTotal(invoice);
  } else {
    removeItem(invoice, index);
  }
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  resetTimerOnInteraction(invoice); // Reset timer khi có tương tác
};

const removeItem = (invoice: any, index: number) => {
  invoice.items.splice(index, 1);
  recalculateTotal(invoice);
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  resetTimerOnInteraction(invoice); // Reset timer khi có tương tác
};

const recalculateTotal = (invoice: any) => {
  invoice.orderTotal = invoice.items.reduce(
    (sum: number, item: any) => sum + ((item.price || 0) * item.quantity),
    0
  );
};

const openPaymentToolbar = (invoice: any) => {
  selectedInvoice.value = { ...invoice };
  selectedInvoice.value.paidAmount = 0; // Khởi tạo paidAmount ban đầu
  updateChange();
  resetTimerOnInteraction(invoice); // Reset timer khi mở thanh toán
};

const closePaymentToolbar = () => {
  if (selectedInvoice.value) {
    resetTimerOnInteraction(selectedInvoice.value); // Reset timer khi đóng thanh toán
  }
  selectedInvoice.value = null;
};

const calculateFinalTotal = () => {
  if (!selectedInvoice.value) return 0;
  return selectedInvoice.value.orderTotal - (selectedInvoice.value.discount || 0);
};

const updateTotal = () => {
  if (!selectedInvoice.value) return;
  if (selectedInvoice.value.discount < 0) {
    selectedInvoice.value.discount = 0;
  }
  updateChange();
  saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
  resetTimerOnInteraction(selectedInvoice.value); // Reset timer khi cập nhật tổng
};

const updateChange = () => {
  if (!selectedInvoice.value) return;
  const finalTotal = calculateFinalTotal();
  const paid = selectedInvoice.value.paidAmount || 0;
  changeAmount.value = paid > finalTotal ? paid - finalTotal : 0;
};

watch(() => selectedInvoice.value?.paymentMethod, (newValue) => {
  if (selectedInvoice.value) {
    const method = paymentMethods.value.find(m => m.name === newValue);
    selectedInvoice.value.paymentMethodId = method?.id || 1;
    saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
    resetTimerOnInteraction(selectedInvoice.value); // Reset timer khi thay đổi phương thức thanh toán
  }
});

const completePayment = async () => {
  if (!selectedInvoice.value) return;
  if (selectedInvoice.value.items.length === 0) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng thêm sản phẩm', life: 3000 });
    return;
  }
  if (!selectedInvoice.value.isPos && !selectedInvoice.value.userId) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn khách hàng', life: 3000 });
    return;
  }
  if (!selectedInvoice.value.isPos && !selectedInvoice.value.carrierId) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn nhà vận chuyển', life: 3000 });
    return;
  }
  const finalTotal = calculateFinalTotal();
  if (!selectedInvoice.value.paidAmount || selectedInvoice.value.paidAmount < finalTotal) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Số tiền khách thanh toán phải lớn hơn hoặc bằng số tiền cần trả', life: 3000 });
    return;
  }
  const customer = selectedInvoice.value.userId ? 
    customers.value.find(c => c.id === selectedInvoice.value.userId) : null;
  const payload: OrderRequest = {
    orderCode: selectedInvoice.value.orderCode,
    userId: selectedInvoice.value.userId || undefined,
    notes : selectedInvoice.value.notes,
    items: selectedInvoice.value.items.map((item: any) => ({
      productId: item.id,
      quantity: item.quantity
    })),
    payment: {
      paymentMethodId: selectedInvoice.value.paymentMethodId || 1,
      amount: selectedInvoice.value.paidAmount || 0
    },
    couponUsageIds: selectedInvoice.value.couponUsageIds || undefined
  };
  if (!selectedInvoice.value.isPos && customer) {
    const orderItemIds = selectedInvoice.value.items.map((item: any) => item.id);
    payload.shipments = [{
      carrierId: selectedInvoice.value.carrierId || undefined,
      estimatedDeliveryDate: selectedInvoice.value.estimatedDeliveryDate 
        ? new Date(selectedInvoice.value.estimatedDeliveryDate).toISOString() 
        : new Date().toISOString(),
      orderItemIds: orderItemIds
    }];
  }
  try {
    console.log("Payload gửi đến backend:", payload);
    const response = await OrderService.addProductToOrder(
      selectedInvoice.value.orderCode, 
      payload
    );
    if (response && response.data) {
      selectedInvoice.value.items.forEach((item: any) => {
        const product = listProduct.value.find((p: any) => p.id === item.id);
        if (product) {
          product.stockQuantity = (product.stockQuantity ?? 0) - item.quantity;
        }
      });
      selectedInvoice.value.orderStatus = 'COMPLETED';
      toast.add({ 
        severity: 'success', 
        summary: 'Thành công', 
        detail: `Đã thanh toán ${formatCurrency(finalTotal).replace('₫', 'đ')}. Tiền thừa: ${formatCurrency(changeAmount.value).replace('₫', 'đ')}`,
        life: 5000 
      });
      const orderCode = selectedInvoice.value.orderCode;
      setTimeout(() => {
        closePaymentToolbar();
      }, 300);
      const index = invoiceTabs.value.findIndex(tab => tab.orderCode === orderCode);
      if (index !== -1) {
        invoiceTabs.value.splice(index, 1);
        saveInvoicesToStorage(); // Lưu thay đổi vào localStorage
        if (activeTabIndex.value >= invoiceTabs.value.length) {
          activeTabIndex.value = Math.max(0, invoiceTabs.value.length - 1);
        }
        clearTimeout(invoiceTimeouts.value[orderCode]); // Xóa timeout khi thanh toán hoàn tất
        delete invoiceTimeouts.value[orderCode];
      }
      return;
    }
  } catch (error) {
    console.error("Lỗi khi thanh toán đơn hàng:", error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Thanh toán thất bại', life: 3000 });
  }
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
</script>

<style scoped>
.layout-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

@media (max-width: 992px) {
  .layout-container {
    flex-direction: column;
  }
}
</style>