<template>
  <div class="p-4">
    <div class="card mb-4">
      <div v-if="order">
        <div class="custom-timeline">
          <div
            v-for="(step, index) in filteredSteps"
            :key="index"
            class="timeline-step"
            :class="{
              completed: index < activeStepIndex,
              active: index === activeStepIndex
            }"
          >
            <div class="circle">
              <i :class="step.icon"></i>
            </div>
            <div class="step-label">
              <div class="label">{{ step.label }}</div>
              <div v-if="index === activeStepIndex" class="current-text">Trạng thái hiện tại</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <Button 
        v-if="order?.orderStatus === OrderStatus.PENDING"
        :label="order?.isPos ? 'Xác nhận hoàn thành' : 'Xác nhận đóng gói'"
        class="p-button-success" 
        @click="openConfirmDialog(order?.isPos ? OrderStatus.COMPLETED : OrderStatus.SHIPPED)" 
        :disabled="loading"
      />
      <Button 
        v-if="order?.orderStatus === OrderStatus.SHIPPED"
        label="Xác nhận hoàn thành" 
        class="p-button-success" 
        @click="openConfirmDialog(OrderStatus.COMPLETED)" 
        :disabled="loading"
      />
      <Button 
        v-if="order?.orderStatus === OrderStatus.PENDING"
        label="Huỷ Đơn" 
        class="p-button-danger" 
        @click="openConfirmDialog(OrderStatus.CANCELLED)" 
        style="margin-left: 20px;" 
        :disabled="loading"
      />
    </div>

    <div class="grid grid-cols-2 gap-4 items-stretch" style="margin-left: 3px;">
  <!-- Card Đơn Hàng -->
  <div class="card h-full" style="width: 45%;">
    <h3 class="mb-2 font-semibold text-lg">Đơn Hàng</h3>
    <div class="space-y-1 text-gray-700">
      <p><strong>Mã đơn hàng:</strong> {{ order?.orderCode }}</p>
      <p><strong>Trạng thái:</strong> {{ order?.orderStatus }}</p>
      <p><strong>Loại đơn:</strong> {{ order?.isPos ? "Tại quầy" : "Ship" }}</p>
      <p><strong>Tổng tiền:</strong> {{ order?.orderTotal?.toLocaleString("vi-VN") }} đ</p>
    </div>
  </div>

  <!-- Card Vận chuyển -->
  <div class="card h-full" style="width: 52%;">
    <h3 class="mb-2 font-semibold text-lg">🚚 Vận chuyển</h3>
    <div v-if="order?.shipments && order.shipments.length > 0" class="space-y-1 text-gray-700">
      <p><strong>Trạng thái:</strong> {{ order?.shipments[0].shipmentStatus }}</p>
      <p><strong>Đơn vị vận chuyển:</strong> {{ order?.shipments[0].carrierName }}</p>
      <p><strong>Mã theo dõi:</strong> {{ order?.shipments[0].trackingNumber }}</p>
      <p><strong>Dự kiến giao:</strong> {{ order?.shipments[0].estimatedDeliveryDate }}</p>
    </div>
    <div v-else class="text-gray-500 italic">Không có thông tin vận chuyển</div>
  </div>
</div>

<div class="card mb-4">
  <h3 class="mb-2 font-semibold text-lg">👤 Thông tin khách hàng</h3>
  <DataTable :value="customerInfo" class="p-datatable-gridlines p-datatable-sm" responsiveLayout="scroll">
    <Column field="label" header="Thông tin" />
    <Column field="value" header="Giá trị" />
  </DataTable>

  <Button 
    label="Cập nhật thông tin khách hàng" 
    icon="pi pi-money-bill" 
    class="p-button-info" 
    @click="openPaymentDialog" 
    style="margin-top: 10px;" 
  />
</div>

<div class="card mb-4">
  <h3>💳 Thông tin thanh toán</h3>
  <DataTable :value="paymentInfo" class="p-datatable-gridlines p-datatable-sm" responsiveLayout="scroll">
    <Column field="key" header="Thông tin" />
    <Column field="value" header="Giá trị">
      <template #body="{ data }: DataTablePaymentSlotProps">
        {{ data.value }}
      </template>
    </Column>
  </DataTable>
  <Button 
    label="Cập nhật thanh toán" 
    icon="pi pi-money-bill" 
    class="p-button-info" 
    @click="openPaymentDialog" 
    style="margin-top: 10px;" 
  />
</div>

<div class="card mb-4">
  <h3>Sản phẩm của đơn hàng</h3>
  <DataTable :value="orderItems" class="p-datatable-gridlines" responsiveLayout="scroll">
    <Column field="productName" header="Tên sản phẩm" />
    <Column header="Hình ảnh">
      <template #body="{ data, index }: DataTableSlotProps">
        <img :src="data.productImage" alt="Hình ảnh sản phẩm" class="w-10 h-10 rounded-full" style="width: 100px; height: 100px;" />
      </template>
    </Column>
    <Column header="Số lượng">
      <template #body="{ data, index }: DataTableSlotProps">
        <div class="flex align-items-center gap-2">
          <Button icon="pi pi-minus" rounded text @click="decreaseQuantity(index)" />
          <span>{{ data.quantity }}</span>
          <Button icon="pi pi-plus" rounded text @click="increaseQuantity(index)" />
        </div>
      </template>
    </Column>
    <Column header="Giá sản phẩm">
      <template #body="{ data }: DataTableSlotProps">
        {{ data.unitPrice.toLocaleString('vi-VN') }} đ
      </template>
    </Column>
    <Column header="Thành tiền">
      <template #body="{ data }: DataTableSlotProps">
        {{ (data.quantity * data.unitPrice).toLocaleString('vi-VN') }} đ
      </template>
    </Column>
    <Column header="Hành động">
      <template #body="{ index }: DataTableSlotProps">
        <Button label="Xoá" severity="danger" @click="removeItem(index)" style="margin-left: 40px;" />
      </template>
    </Column>
  </DataTable>

  <div class="card mb-4 justify-content-between" style="display: flex; justify-content: flex-end;">
    <Button 
      label="Thêm sản phẩm" 
      icon="pi pi-plus" 
      class="p-button-primary" 
      style="margin-top: 5px; margin-bottom: 10px; border-radius: 5px;" 
      @click="showProductDialog = true" 
    />
  </div>

  <Dialog v-model:visible="showProductDialog" modal header="Chọn sản phẩm" :style="{ width: '80vw' }">
    <ListProduct @select="handleAddProduct" />
  </Dialog>

  <Dialog v-model:visible="showPaymentDialog" modal header="Cập nhật thanh toán" :style="{ width: '50vw', zIndex: 1000 }">
    <div v-if="loadingPaymentMethods">
      <p>Đang tải phương thức thanh toán...</p>
    </div>
    <div v-else-if="!paymentMethods || paymentMethods.length === 0">
      <p>Không có phương thức thanh toán nào khả dụng.</p>
    </div>
    <div v-else class="p-field">
      <label for="paymentMethod">Phương thức thanh toán</label>
      <Dropdown
        id="paymentMethod"
        v-model="tempPayment.paymentMethodId"
        :options="paymentMethods"
        option-label="name"
        option-value="id"
        class="w-full"
        placeholder="Chọn phương thức thanh toán"
      />
    </div>
    <div class="p-field">
      <label for="additionalAmount">Số tiền cần thêm ({{ paymentShortage.toLocaleString('vi-VN') }} đ)</label>
      <InputNumber
        id="additionalAmount"
        v-model="tempPayment.additionalAmount"
        mode="currency"
        currency="VND"
        locale="vi-VN"
        class="w-full"
        :min="0"
      />
    </div>
    <div class="flex justify-content-end gap-2">
      <Button label="Hủy" class="p-button-text" @click="showPaymentDialog = false" />
      <Button 
        label="Lưu" 
        class="p-button-primary" 
        @click="savePayment" 
        :disabled="loadingPaymentMethods || !paymentMethods || paymentMethods.length === 0" 
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showConfirmDialog" modal :header="confirmHeader" :style="{ width: '50vw' }">
    <div class="p-field">
      <p>{{ confirmMessage }}</p>
      <label for="notes">Ghi chú (tùy chọn)</label>
      <InputText
        id="notes"
        v-model="confirmNotes"
        class="w-full"
        placeholder="Nhập ghi chú (nếu có)"
      />
    </div>
    <div class="flex justify-content-end gap-2">
      <Button label="Hủy" class="p-button-text" @click="showConfirmDialog = false" />
      <Button 
        label="Xác nhận" 
        class="p-button-primary" 
        @click="updateOrderStatus" 
        :loading="loading"
      />
    </div>
  </Dialog>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, getCurrentInstance } from 'vue';
import type { OrderResponse, OrderItemResponse } from '../../../../model/admin/order';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { OrderService } from '../../../../service/admin/OrderService';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import type { ProductResponse } from '../../../../model/admin/product';
import ListProduct from './ListProduct.vue';
import { CarrierService } from '../../../../service/admin/CarrierService';
import type { CarrierResponse } from '../../../../model/admin/carrier';
import { PaymentMethodService } from '../../../../service/admin/PaymentMethodService';
import type { PaymentMethodResponse } from '../../../../model/admin/paymentMethod';
import { OrderStatus } from '../../../../service/admin/OrderService';
import type { UpdateOrderStatusRequest } from '../../../../service/admin/OrderService';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Thêm renderKey để kiểm soát render
const renderKey = ref(0);

const route = useRoute();
const order = ref<OrderResponse | undefined>(undefined);
const toast = useToast();
const products = ref<ProductResponse[]>([]);
const orderItems = ref<(OrderItemResponse & { productImage?: string })[]>([]);
const showProductDialog = ref(false);
const showPaymentDialog = ref(false);
const showConfirmDialog = ref(false);
const confirmHeader = ref('');
const confirmMessage = ref('');
const confirmNotes = ref('');
const newStatus = ref<OrderStatus | null>(null);
const carriers = ref<CarrierResponse[]>([]);
const paymentMethods = ref<PaymentMethodResponse[]>([]);
const loading = ref(false);
const loadingPaymentMethods = ref(true);
const paymentShortage = ref(0);
const tempPayment = ref({
  paymentMethodId: 0,
  additionalAmount: 0
});

interface UpdateOrderRequest {
  id?: number;
  orderCode?: string;
  notes?: string | undefined;
  userId?: number;
  items?: OrderItemRequest[];
  payment?: PaymentRequest;
  couponUsageIds?: number[];
  shipments?: ShipmentRequest[];
}

interface OrderItemRequest {
  productId: number;
  quantity: number;
}

interface PaymentRequest {
  paymentMethodId: number;
  amount: number;
}

interface ShipmentRequest {
  carrierId?: number;
  shippingCost: number;
  estimatedDeliveryDate: string;
}

// Định nghĩa kiểu cho slotProps của DataTable
interface DataTableSlotProps {
  data: OrderItemResponse & { productImage?: string };
  index: number;
}

// Định nghĩa kiểu cho slotProps của DataTable thanh toán
interface DataTablePaymentSlotProps {
  data: { key: string; value: string };
  index: number;
}

// Dữ liệu cho bảng thông tin thanh toán
const paymentInfo = computed(() => {
  const payment = order.value?.payment;
  
  if (!payment) return [
    { key: 'Phương thức thanh toán', value: 'Chưa xác định' },
    { key: 'Số tiền thanh toán', value: '0 đ' },
    { key: 'Trạng thái', value: 'Chưa thanh toán' },
    { key: 'Ngày thanh toán', value: 'Chưa thanh toán' }
  ];

  return [
    { key: 'Phương thức thanh toán', value: payment.paymentMethodName || 'Chưa xác định' },
    { key: 'Số tiền thanh toán', value: payment.amount ? payment.amount.toLocaleString('vi-VN') + ' đ' : '0 đ' },
    { key: 'Trạng thái', value: payment.paymentStatus || 'Chưa thanh toán' },
    { key: 'Ngày thanh toán', value: payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('vi-VN') : 'Chưa thanh toán' }
  ];
});

// Dữ liệu cho bảng thông tin khách hàng
const customerInfo = computed(() => {
  const address = order.value?.address;
  if (!address) return [
    { label: 'Người nhận', value: 'Chưa xác định' },
    { label: 'SĐT', value: 'Chưa xác định' },
    { label: 'Email', value: 'Chưa xác định' },
    { label: 'Địa chỉ', value: 'Chưa xác định' }
  ];

  return [
    { label: 'Người nhận', value: address.username || 'Chưa xác định' },
    { label: 'SĐT', value: address.phoneNumber || 'Chưa xác định' },
    { label: 'Email', value: address.email || 'Chưa xác định' },
    { label: 'Địa chỉ', value: `${address.addressStreet || ''}, ${address.addressDistrict || ''}, ${address.addressCity || ''}, ${address.addressProvince || ''}`.trim() || 'Chưa xác định' }
  ];
});

const steps = [
  { label: 'Chờ xác nhận', value: OrderStatus.PENDING, icon: 'pi pi-clock' },
  { label: 'Đang giao', value: OrderStatus.SHIPPED, icon: 'pi pi-truck' },
  { label: 'Hoàn thành', value: OrderStatus.COMPLETED, icon: 'pi pi-check-circle' },
  { label: 'Đã huỷ', value: OrderStatus.CANCELLED, icon: 'pi pi-times-circle' },
  { label: 'Trả hàng', value: OrderStatus.RETURNED, icon: 'pi pi-refresh' }
];

// Lọc steps dựa trên isPos
const filteredSteps = computed(() => {
  if (order.value?.isPos) {
    return steps.filter(step => step.value !== OrderStatus.SHIPPED);
  }
  return steps;
});

const activeStepIndex = computed(() => {
  const currentStatus = order.value?.orderStatus;
  if (!currentStatus) {
    console.log('No status, defaulting to 0 (Chờ xác nhận)');
    return 0;
  }
  const index = filteredSteps.value.findIndex(step => step.value === currentStatus);
  console.log('Computed Active Step - Current Status:', currentStatus, 'Index:', index);
  return index >= 0 ? index : 0;
});

const getProducts = async () => {
  const response = await ProductService.getAllChildProducts();
  if (response && response.data) {
    products.value = response.data;
  } else {
    products.value = [];
  }
};

const getAllCarriers = async () => {
  loading.value = true;
  try {
    const response = await CarrierService.getAllCarriers();
    if (response && response.data) {
      carriers.value = response.data;
    } else {
      carriers.value = [];
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn vị vận chuyển:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách đơn vị vận chuyển', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const getAllPaymentMethods = async () => {
  loadingPaymentMethods.value = true;
  try {
    const response = await PaymentMethodService.getAllPaymentMethod();
    paymentMethods.value = response?.data || [];
    if (paymentMethods.value.length > 0 && !paymentMethods.value.some(pm => pm.id === tempPayment.value.paymentMethodId)) {
      tempPayment.value.paymentMethodId = paymentMethods.value[0].id;
    } else {
      tempPayment.value.paymentMethodId = paymentMethods.value[0]?.id || 0;
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phương thức thanh toán:', error);
    paymentMethods.value = [];
    tempPayment.value.paymentMethodId = 0;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách phương thức thanh toán',
      life: 3000
    });
  } finally {
    loadingPaymentMethods.value = false;
  }
};

const getOrderDetails = async () => {
  const id = route.params.id;
  const response = await OrderService.getOrderById(Number(id));
  if (response.data) {
    order.value = response.data;
    tempPayment.value.paymentMethodId = order.value.payment?.paymentMethodId || 0;
    console.log('Fetched Order Details - Payment:', order.value.payment); // Log để debug
    renderKey.value += 1;
  } else {
    order.value = undefined;
    console.log('No order data fetched');
  }
};

const syncOrderItems = () => {
  orderItems.value = order.value?.items.map(item => ({
    ...item,
    productImage: products.value.find(p => p.id === item.productId)?.imageUrl[0] || ''
  })) || [];
};

const calculateTotal = () => {
  return orderItems.value.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
};

const checkPaymentSufficiency = () => {
  const newTotal = calculateTotal();
  const currentPayment = order.value?.payment?.amount || 0;
  paymentShortage.value = Math.max(0, newTotal - currentPayment);
  const isSufficient = paymentShortage.value === 0;
  console.log('Payment Check - Total:', newTotal, 'Paid:', currentPayment, 'Shortage:', paymentShortage.value, 'Sufficient:', isSufficient);
  if (!isSufficient) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu tiền',
      detail: `Số tiền thiếu: ${paymentShortage.value.toLocaleString('vi-VN')} đ. Vui lòng cập nhật thanh toán.`,
      life: 5000
    });
  }
  return isSufficient;
};

const openPaymentDialog = () => {
  if (loadingPaymentMethods.value) {
    toast.add({ severity: 'warn', summary: 'Đang tải', detail: 'Vui lòng đợi danh sách phương thức thanh toán được tải.', life: 3000 });
    return;
  }
  if (!paymentMethods.value || paymentMethods.value.length === 0) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không có phương thức thanh toán nào khả dụng.', life: 3000 });
    return;
  }
  checkPaymentSufficiency();
  showPaymentDialog.value = true;
};

const checkAndUpdateOrderItems = async () => {
  if (!checkPaymentSufficiency()) {
    showPaymentDialog.value = true;
    return;
  }
  await updateOrderItems();
};

const savePayment = async () => {
  if (tempPayment.value.additionalAmount < paymentShortage.value) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Số tiền thêm phải ít nhất ${paymentShortage.value.toLocaleString('vi-VN')} đ`,
      life: 3000
    });
    return;
  }
  if (!paymentMethods.value.some(pm => pm.id === tempPayment.value.paymentMethodId)) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Phương thức thanh toán không hợp lệ',
      life: 3000
    });
    return;
  }
  showPaymentDialog.value = false;
  await updateOrderItems();
};

const updateOrderItems = async () => {
  if (!order.value) return;

  const newTotal = calculateTotal();
  const additionalAmount = tempPayment.value.additionalAmount || 0;
  const orderRequest: UpdateOrderRequest = {
    orderCode: order.value.orderCode,
    userId: order.value.address?.userId || 0,
    notes: order.value.notes || undefined,
    items: orderItems.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    payment: {
      paymentMethodId: tempPayment.value.paymentMethodId || order.value.payment?.paymentMethodId || 1,
      amount: (order.value.payment?.amount || 0) + additionalAmount
    },
    shipments: order.value?.shipments && !order.value.isPos
      ? order.value.shipments.map(s => ({
          carrierId: s.carrierId,
          shippingCost: s.shippingCost,
          estimatedDeliveryDate: s.estimatedDeliveryDate
        }))
      : []
  };

  try {
    const response = await OrderService.updateOrder(order.value.orderCode!, orderRequest);
    if (response.data) {
      order.value = { ...response.data };
      syncOrderItems();
      tempPayment.value.additionalAmount = 0;
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật đơn hàng thành công', life: 3000 });
      await getOrderDetails();
      renderKey.value += 1;
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Cập nhật đơn hàng thất bại', life: 3000 });
  }
};

const increaseQuantity = async (index: number) => {
  if (orderItems.value[index]) {
    orderItems.value[index].quantity++;
    await checkAndUpdateOrderItems();
  }
};

const decreaseQuantity = async (index: number) => {
  if (orderItems.value[index] && orderItems.value[index].quantity > 1) {
    orderItems.value[index].quantity--;
    await checkAndUpdateOrderItems();
  }
};

const removeItem = async (index: number) => {
  if (orderItems.value[index]) {
    orderItems.value.splice(index, 1);
    await checkAndUpdateOrderItems();
  }
};

const handleAddProduct = async (product: ProductResponse) => {
  const existingItem = orderItems.value.find(item => item.productId === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    orderItems.value.push({
      id: 0,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price || 0,
      productImage: product.imageUrl[0] || ''
    });
  }
  showProductDialog.value = false;
  await checkAndUpdateOrderItems();
};

const openConfirmDialog = (status: OrderStatus) => {
  if (!order.value) {
    console.log('Order is undefined, cannot proceed');
    return;
  }
  const isSufficient = checkPaymentSufficiency();
  console.log('Open Confirm Dialog - Status:', status, 'Payment Sufficient:', isSufficient);
  if (!isSufficient) {
    showPaymentDialog.value = true;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng cập nhật thanh toán trước khi thay đổi trạng thái đơn hàng',
      life: 3000
    });
    return;
  }
  newStatus.value = status;
  confirmHeader.value = status === OrderStatus.COMPLETED ? 'Xác nhận hoàn thành' : status === OrderStatus.SHIPPED ? 'Xác nhận đóng gói' : 'Hủy đơn hàng';
  confirmMessage.value = status === OrderStatus.COMPLETED 
    ? 'Bạn có chắc chắn muốn xác nhận đơn hàng này đã được giao thành công?'
    : status === OrderStatus.SHIPPED 
      ? 'Bạn có chắc chắn muốn xác nhận đóng gói và chuyển giao đơn hàng này?'
      : 'Bạn có chắc chắn muốn hủy đơn hàng này?';
  showConfirmDialog.value = true;
};

const updateOrderStatus = async () => {
  if (!order.value || !newStatus.value) {
    console.log('Invalid state - order or newStatus is null', { order: order.value, newStatus: newStatus.value });
    return;
  }

  loading.value = true;
  try {
    const statusRequest: UpdateOrderStatusRequest = {
      newStatus: newStatus.value,
      nodes: confirmNotes.value.trim() || ''
    };
    console.log('Sending Status Request:', statusRequest, 'Order Code:', order.value.orderCode);
    const response = await OrderService.updateOrderStatus(order.value.orderCode!, statusRequest);
    if (response.data) {
      order.value = { ...response.data };
      syncOrderItems();
      console.log('API Response - New Status:', response.data.orderStatus);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Cập nhật trạng thái đơn hàng sang ${newStatus.value === OrderStatus.COMPLETED ? 'Hoàn thành' : newStatus.value === OrderStatus.SHIPPED ? 'Đang giao' : 'Đã hủy'} thành công`,
        life: 3000
      });
      showConfirmDialog.value = false;
      await getOrderDetails();
      renderKey.value += 1;
      const instance = getCurrentInstance();
      if (instance) instance.proxy?.$forceUpdate();
    } else {
      console.log('No data in response');
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error.response?.data || error.message);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại',
      life: 3000
    });
  } finally {
    loading.value = false;
    newStatus.value = null;
    confirmNotes.value = '';
  }
};

onMounted(async () => {
  await getOrderDetails();
  await getProducts();
  await getAllCarriers();
  await getAllPaymentMethods();
  syncOrderItems();
});

watch(order, (newOrder) => {
  syncOrderItems();
  console.log('Order changed, new status:', newOrder?.orderStatus);
  renderKey.value += 1;
}, { deep: true });
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}
.p-field label {
  display: block;
  margin-bottom: 0.5rem;
}

.custom-timeline {
  display: flex;
  flex-direction: row;
  gap: 30px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.timeline-step {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #4b5e7e;
  position: relative;
  flex: 1;
}

.timeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22px;
  left: 56px;
  width: calc(100% - 60px);
  height: 4px;
  background-color: #e0e0e0;
  z-index: 0;
}

.timeline-step.completed:not(:last-child)::after {
  background-color: #2a8bf2;
}

.timeline-step.active:not(:last-child)::after {
  background-color: #00c853;
}

.timeline-step .circle {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  border: 3px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: #fff;
  transition: all 0.3s ease;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-step.completed .circle {
  background-color: #2a8bf2;
  border-color: #2a8bf2;
  color: white;
  box-shadow: 0 4px 8px rgba(42, 139, 242, 0.3);
}

.timeline-step.active .circle {
  background-color: #00c853;
  border-color: #00c853;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 200, 83, 0.3);
  transform: scale(1.1);
}

.step-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.step-label .label {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2d3748;
}

.step-label .current-text {
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
}
</style>