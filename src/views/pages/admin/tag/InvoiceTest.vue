<template>
    <div class="layout-container">
      <h2 class="text-2xl font-bold mb-4">Tạo Hoá Đơn</h2>
  
      <div class="flex gap-2 mb-4">
        <Button label="Bán thường" @click="setInvoiceType(true)" :class="currentIsPos ? 'p-button-primary' : 'p-button-outlined'" icon="pi pi-shopping-cart" />
        <Button label="Giao hàng" @click="setInvoiceType(false)" :class="!currentIsPos ? 'p-button-primary' : 'p-button-outlined'" icon="pi pi-truck" />
        <Button label="Tạo hoá đơn" @click="addInvoiceTab" icon="pi pi-plus" class="p-button-success" />
      </div>
  
      <!-- Danh sách sản phẩm -->
      <div class="product-section">
        <h3 class="text-xl font-bold mb-3">Danh sách Sản phẩm</h3>
        <div class="search-box mb-4">
          <InputText v-model="searchQuery" placeholder="Tìm sản phẩm" class="w-full" />
        </div>
        
        <div class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" 
              class="product-card" 
              @click="addProductToActiveInvoice(product)">
            <img :src="product.image" alt="Product Image" class="product-image" />
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ formatCurrency(product.price).replace('₫', 'đ') }}</div>
            <div class="product-stock" :class="{ 'out-of-stock': product.stock_quantity === 0 }">
              {{ product.stock_quantity === 0 ? 'Hết hàng' : `Còn hàng: ${product.stock_quantity}` }}
            </div>
          </div>
        </div>
      </div>
  
      <!-- Giỏ hàng và thanh toán -->
      <div class="cart-section" v-if="invoiceTabs.length > 0 && activeTabIndex >= 0">
        <TabView v-model:activeIndex="activeTabIndex">
          <TabPanel v-for="(invoice, index) in invoiceTabs" :key="invoice.id" :header="`HĐ${index + 1}`">
            <template #header>
              <span class="flex items-center">
                HĐ{{ index + 1 }}
                <Button icon="pi pi-times" class="ml-2 p-button-text p-button-danger p-0" @click.stop="removeTab(index)" />
              </span>
            </template>
  
            <!-- Cart items -->
            <div v-if="invoice.items.length > 0" class="cart-items">
              <div v-for="(item, itemIndex) in invoice.items" :key="itemIndex" class="cart-item">
                <div class="cart-item-number">{{ itemIndex + 1 }}</div>
                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm mr-2" @click="removeItem(invoice, itemIndex)" />
                <div class="cart-item-info">
                  <div class="cart-item-sku">{{ item.sku || 'NAM00' + (itemIndex + 1) }}</div>
                  <div class="cart-item-name">{{ item.name }}</div>
                </div>
                <div class="cart-item-quantity">
                  <Button icon="pi pi-minus" class="p-button-text p-button-sm" @click="decrementQuantity(invoice, itemIndex)" />
                  <input type="text" v-model="item.quantity" class="quantity-input" @change="recalculateTotal(invoice)" />
                  <Button icon="pi pi-plus" class="p-button-text p-button-sm" @click="incrementQuantity(invoice, itemIndex)" />
                </div>
                <div class="cart-item-price">{{ formatCurrency(item.price).replace('₫', 'đ') }}</div>
                <div class="cart-item-total">{{ formatCurrency(item.price * item.quantity).replace('₫', 'đ') }}</div>
              </div>
            </div>
            <div v-else class="empty-cart">
              <i class="pi pi-shopping-cart empty-cart-icon"></i>
              <p>Chưa có sản phẩm nào. Vui lòng thêm sản phẩm.</p>
            </div>
  
            <!-- Cart footer -->
            <div class="cart-footer">
              <div class="cart-notes">
                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" />
                <span>Ghi chú đơn hàng</span>
              </div>
              <div class="cart-total">
                <span>Tổng tiền hàng:</span>
                <span class="cart-total-amount">{{ formatCurrency(invoice.orderTotal).replace('₫', 'đ') }}</span>
              </div>
            </div>
  
            <!-- Payment button -->
            <div class="payment-button-container">
              <Button label="THANH TOÁN" icon="pi pi-check-circle" 
                class="payment-button" 
                @click="() => openPaymentModal(invoice)"
                :disabled="invoice.items.length === 0" />
            </div>
          </TabPanel>
        </TabView>
      </div>
  
      <!-- Payment Modal -->
      <Dialog v-model:visible="showPaymentModal" modal header="Thanh toán hoá đơn" :style="{ width: '500px' }">
        <div v-if="selectedInvoice" class="p-4">
          <h3 class="text-xl font-bold mb-4">{{ selectedInvoice.orderCode }}</h3>
          
          <!-- Thông tin khách hàng -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
            <Dropdown v-model="selectedInvoice.userId" :options="customers" optionLabel="name" optionValue="id" 
              placeholder="Chọn khách hàng (khách vãng lai nếu để trống)" class="w-full" @change="fetchAddresses" />
            <InputText v-if="!selectedInvoice.userId" v-model="selectedInvoice.customerName" 
              placeholder="Nhập tên khách (khách vãng lai)" class="w-full mt-2" />
          </div>
          
          <!-- Địa chỉ và vận chuyển (nếu ship) -->
          <div v-if="!selectedInvoice.isPos" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
            <Dropdown v-model="selectedInvoice.addressId" :options="addresses" optionLabel="streetAddress" 
              optionValue="id" placeholder="Chọn địa chỉ" class="w-full" />
            <InputText v-if="!selectedInvoice.addressId" v-model="selectedInvoice.shippingAddress" 
              placeholder="Nhập địa chỉ mới" class="w-full mt-2" />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Nhà vận chuyển</label>
            <InputText v-model="selectedInvoice.carrier" placeholder="Nhà vận chuyển (VD: GHN)" class="w-full" />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Ngày giao dự kiến</label>
            <InputText v-model="selectedInvoice.estimatedDeliveryDate" type="datetime-local" class="w-full" />
          </div>
          
          <!-- Tính tiền -->
          <div class="space-y-3 border-t border-b py-4">
            <div class="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>{{ formatCurrency(selectedInvoice.orderTotal).replace('₫', 'đ') }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Giảm giá:</span>
              <InputNumber v-model="selectedInvoice.discount" @input="updateTotal" 
                mode="currency" currency="VND" :minFractionDigits="0" class="w-32" />
            </div>
            <div class="flex justify-between">
              <span>Mã giảm giá:</span>
              <Dropdown v-model="selectedInvoice.couponId" :options="coupons" optionLabel="code" 
                optionValue="id" placeholder="Chọn mã" class="w-32" @change="updateTotal" />
            </div>
            <div class="flex justify-between font-semibold">
              <span>Khách cần trả:</span>
              <span>{{ formatCurrency(calculateFinalTotal()).replace('₫', 'đ') }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Khách thanh toán:</span>
              <InputNumber v-model="selectedInvoice.paidAmount" @input="updateChange" 
                mode="currency" currency="VND" :minFractionDigits="0" class="w-32" />
            </div>
            <div class="flex justify-between" v-if="changeAmount > 0">
              <span>Tiền thừa:</span>
              <span class="text-green-600">{{ formatCurrency(changeAmount).replace('₫', 'đ') }}</span>
            </div>
          </div>
          
          <!-- Phương thức thanh toán -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="method in paymentMethods" :key="method.id" class="flex items-center">
                <RadioButton v-model="selectedInvoice.paymentMethod" :inputId="method.name" 
                  :name="method.name" :value="method.name" />
                <label :for="method.name" class="ml-2">{{ method.name }}</label>
              </div>
            </div>
          </div>
          
          <!-- Ghi chú -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <Textarea v-model="selectedInvoice.notes" rows="3" class="w-full" placeholder="Ghi chú đơn hàng" />
          </div>
        </div>
        
        <template #footer>
          <Button label="Huỷ" icon="pi pi-times" @click="closePaymentModal" class="p-button-text" />
          <Button label="Hoàn tất thanh toán" icon="pi pi-check" @click="completePayment" class="p-button-success" />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Textarea from 'primevue/textarea';
  import RadioButton from 'primevue/radiobutton';
  import Dropdown from 'primevue/dropdown';
  import { useToast } from 'primevue/usetoast';
  
  const toast = useToast();
  let invoiceCounter = 1;
  const activeTabIndex = ref(0);
  const invoiceTabs = ref<any[]>([]);
  const currentIsPos = ref(true);
  const showPaymentModal = ref(false);
  const selectedInvoice = ref<any | null>(null);
  const searchQuery = ref('');
  const changeAmount = ref(0);
  
  // Dữ liệu giả
  const customers = ref([
    { id: 1, name: "Nguyễn Văn An", phone_number: "0905123456" },
    { id: 2, name: "Trần Thị Bình", phone_number: "0916123456" },
    { id: 3, name: "Lê Minh Châu", phone_number: "0927123456" }
  ]);
  
  const addressesData = {
    1: [
      { id: 1, streetAddress: "123 Đường Láng", city: "Hà Nội", state: "Hà Nội", country: "Việt Nam", zipCode: "100000" },
      { id: 2, streetAddress: "456 Nguyễn Trãi", city: "Hà Nội", state: "Hà Nội", country: "Việt Nam", zipCode: "100001" }
    ],
    2: [
      { id: 3, streetAddress: "789 Lê Lợi", city: "TP.HCM", state: "TP.HCM", country: "Việt Nam", zipCode: "700000" }
    ],
    3: [
      { id: 4, streetAddress: "101 Trần Phú", city: "Đà Nẵng", state: "Đà Nẵng", country: "Việt Nam", zipCode: "550000" }
    ]
  };
  
  const paymentMethods = ref([
    { id: 1, name: "Tiền mặt" },
    { id: 2, name: "Chuyển khoản" },
    { id: 3, name: "Thẻ" },
    { id: 4, name: "Ví" }
  ]);
  
  const coupons = ref([
    { id: 1, code: "GIAM500K", discountAmount: 500000 },
    { id: 2, code: "SALE10", discountAmount: 300000 }
  ]);
  
  const products = ref([
    { id: 1, name: "Áo vest nam màu xanh lá", price: 3899000, stock_quantity: 10, image: "https://via.placeholder.com/150", sku: "NAM001" },
    { id: 2, name: "Áo vest nam màu kem", price: 3699000, stock_quantity: 5, image: "https://via.placeholder.com/150", sku: "NAM002" },
    { id: 3, name: "Áo vest nam màu xanh", price: 3699000, stock_quantity: 0, image: "https://via.placeholder.com/150", sku: "NAM003" },
    { id: 4, name: "Áo sơ mi nam màu hồng", price: 699500, stock_quantity: 15, image: "https://via.placeholder.com/150", sku: "NAM004" },
    { id: 5, name: "Áo sơ mi nam màu sóc", price: 719200, stock_quantity: 20, image: "https://via.placeholder.com/150", sku: "NAM005" },
    { id: 6, name: "Cà vạt nam động giá 95K", price: 95000, stock_quantity: 30, image: "https://via.placeholder.com/150", sku: "NAM006" }
  ]);
  
  // Comment lại phần gọi API thực tế
  // onMounted(async () => {
  //   try {
  //     const customersResponse = await fetch('/api/users');
  //     customers.value = await customersResponse.json();
  //     const productsResponse = await fetch('/api/products');
  //     products.value = await productsResponse.json();
  //     const paymentMethodsResponse = await fetch('/api/payment-methods');
  //     paymentMethods.value = await paymentMethodsResponse.json();
  //     const couponsResponse = await fetch('/api/coupons');
  //     coupons.value = await couponsResponse.json();
  //   } catch (error) {
  //     toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu', life: 3000 });
  //   }
  // });
  
  // Lọc sản phẩm theo tìm kiếm
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value;
    return products.value.filter(product =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  });
  
  // Chọn loại hóa đơn (POS/Ship)
  const setInvoiceType = (isPos: boolean) => {
    currentIsPos.value = isPos;
  };
  
  // Tạo hóa đơn mới (giả lập API POST /api/orders)
  const addInvoiceTab = async () => {
    try {
      // Giả lập phản hồi từ POST /api/orders
      const newInvoice = {
        id: Date.now(),
        orderCode: `NAM${new Date().getFullYear()}${String(invoiceCounter++).padStart(4, '0')}`,
        userId: null,
        orderStatus: 'PENDING',
        orderTotal: 0.0,
        isPos: currentIsPos.value,
        deleted: false,
        orderDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
      };
      
      newInvoice.items = [];
      newInvoice.orderTotal = 0;
      newInvoice.customerName = '';
      newInvoice.discount = 0;
      newInvoice.paidAmount = 0;
      newInvoice.paymentMethod = paymentMethods.value[0]?.name || 'Tiền mặt';
      newInvoice.paymentMethodId = paymentMethods.value[0]?.id || 1;
      newInvoice.notes = '';
      newInvoice.isPos = currentIsPos.value;
      newInvoice.userId = null;
      newInvoice.addressId = null;
      newInvoice.carrier = 'GHN';
      newInvoice.estimatedDeliveryDate = null;
      newInvoice.couponId = null;
  
      invoiceTabs.value.push(newInvoice);
      activeTabIndex.value = invoiceTabs.value.length - 1;
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo hóa đơn', life: 3000 });
    }
  };
  
  // Xóa tab hóa đơn
  const removeTab = (index: number) => {
    invoiceTabs.value.splice(index, 1);
    if (activeTabIndex.value >= invoiceTabs.value.length) {
      activeTabIndex.value = Math.max(0, invoiceTabs.value.length - 1);
    }
  };
  
  // Thêm sản phẩm vào giỏ hàng
  const addProductToActiveInvoice = (product: any) => {
    if (invoiceTabs.value.length === 0) {
      toast.add({ severity: 'warn', summary: 'Chưa có đơn hàng', detail: 'Vui lòng tạo đơn hàng trước', life: 3000 });
      return;
    }
    
    if (product.stock_quantity === 0) {
      toast.add({ severity: 'error', summary: 'Hết hàng', detail: `${product.name} hiện đã hết hàng`, life: 3000 });
      return;
    }
  
    const activeInvoice = invoiceTabs.value[activeTabIndex.value];
    const existingItem = activeInvoice.items.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      activeInvoice.items.push({ ...product, quantity: 1, price: product.price });
    }
    
    recalculateTotal(activeInvoice);
  };
  
  // Tăng số lượng sản phẩm
  const incrementQuantity = (invoice: any, index: number) => {
    const product = products.value.find(p => p.id === invoice.items[index].id);
    if (invoice.items[index].quantity >= product.stock_quantity) {
      toast.add({ severity: 'warn', summary: 'Hết hàng', detail: 'Không thể thêm số lượng, đã đạt giới hạn tồn kho', life: 3000 });
      return;
    }
    invoice.items[index].quantity += 1;
    recalculateTotal(invoice);
  };
  
  // Giảm số lượng sản phẩm
  const decrementQuantity = (invoice: any, index: number) => {
    if (invoice.items[index].quantity > 1) {
      invoice.items[index].quantity -= 1;
      recalculateTotal(invoice);
    } else {
      removeItem(invoice, index);
    }
  };
  
  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (invoice: any, index: number) => {
    invoice.items.splice(index, 1);
    recalculateTotal(invoice);
  };
  
  // Tính lại tổng tiền
  const recalculateTotal = (invoice: any) => {
    invoice.orderTotal = invoice.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
  };
  
  // Mở modal thanh toán
  const openPaymentModal = (invoice: any) => {
    selectedInvoice.value = { ...invoice };
    selectedInvoice.value.paidAmount = calculateFinalTotal();
    updateChange();
    fetchAddresses();
    showPaymentModal.value = true;
  };
  
  // Đóng modal thanh toán
  const closePaymentModal = () => {
    showPaymentModal.value = false;
    selectedInvoice.value = null;
    addresses.value = [];
  };
  
  // Lấy danh sách địa chỉ (giả lập API GET /api/addresses)
  const addresses = ref<any[]>([]);
  const fetchAddresses = async () => {
    if (!selectedInvoice.value || !selectedInvoice.value.userId) {
      addresses.value = [];
      return;
    }
    try {
      addresses.value = addressesData[selectedInvoice.value.userId] || [];
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải địa chỉ', life: 3000 });
    }
  };
  
  // Tính tổng tiền cuối cùng
  const calculateFinalTotal = () => {
    if (!selectedInvoice.value) return 0;
    const couponDiscount = selectedInvoice.value.couponId 
      ? coupons.value.find(c => c.id === selectedInvoice.value.couponId)?.discountAmount || 0 
      : 0;
    return selectedInvoice.value.orderTotal - (selectedInvoice.value.discount || 0) - couponDiscount;
  };
  
  // Cập nhật giảm giá
  const updateTotal = () => {
    if (selectedInvoice.value.discount < 0) {
      selectedInvoice.value.discount = 0;
    }
    selectedInvoice.value.paidAmount = calculateFinalTotal();
    updateChange();
  };
  
  // Cập nhật tiền thừa
  const updateChange = () => {
    if (!selectedInvoice.value) return;
    const finalTotal = calculateFinalTotal();
    const paid = selectedInvoice.value.paidAmount || 0;
    changeAmount.value = paid > finalTotal ? paid - finalTotal : 0;
  };
  
  // Ánh xạ paymentMethod sang paymentMethodId
  watch(() => selectedInvoice.value?.paymentMethod, (newValue) => {
    if (selectedInvoice.value) {
      const method = paymentMethods.value.find(m => m.name === newValue);
      selectedInvoice.value.paymentMethodId = method?.id || 1;
    }
  });
  
  // Hoàn tất thanh toán (giả lập API POST /api/orders/{orderCode}/details)
  const completePayment = async () => {
    if (!selectedInvoice.value) return;
  
    if (selectedInvoice.value.items.length === 0) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng thêm sản phẩm', life: 3000 });
      return;
    }
  
    if (!selectedInvoice.value.isPos && (!selectedInvoice.value.userId || !selectedInvoice.value.addressId)) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn khách hàng và địa chỉ giao hàng', life: 3000 });
      return;
    }
  
    const finalTotal = calculateFinalTotal();
    if (!selectedInvoice.value.paidAmount || selectedInvoice.value.paidAmount < finalTotal) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Số tiền khách thanh toán phải lớn hơn hoặc bằng số tiền cần trả', life: 3000 });
      return;
    }
  
    // Giả lập payload gửi đến backend
    const payload = {
      orderCode: selectedInvoice.value.orderCode,
      userId: selectedInvoice.value.userId || null,
      items: selectedInvoice.value.items.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      payment: {
        paymentMethodId: selectedInvoice.value.paymentMethodId || 1,
        amount: finalTotal,
      },
      isPos: selectedInvoice.value.isPos,
      addressId: selectedInvoice.value.isPos ? null : selectedInvoice.value.addressId,
      shipment: selectedInvoice.value.isPos ? null : {
        carrier: selectedInvoice.value.carrier || 'GHN',
        estimatedDeliveryDate: selectedInvoice.value.estimatedDeliveryDate,
      },
      couponId: selectedInvoice.value.couponId || null,
    };
  
    try {
      // Giả lập gọi API
      console.log("Payload gửi đến backend:", payload);
  
      // Giả lập phản hồi thành công từ POST /api/orders/{orderCode}/details
      const result = { ...selectedInvoice.value, orderStatus: 'COMPLETED' };
  
      // Giả lập cập nhật tồn kho
      selectedInvoice.value.items.forEach((item: any) => {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          product.stock_quantity -= item.quantity;
        }
      });
  
      selectedInvoice.value.orderStatus = 'COMPLETED';
      toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã thanh toán ${formatCurrency(finalTotal).replace('₫', 'đ')}. Tiền thừa: ${formatCurrency(changeAmount.value).replace('₫', 'đ')}`, life: 5000 });
  
      // Xóa tab đã thanh toán
      const index = invoiceTabs.value.findIndex(tab => tab.orderCode === selectedInvoice.value.orderCode);
      if (index !== -1) removeTab(index);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Thanh toán thất bại', life: 3000 });
    }
  
    showPaymentModal.value = false;
    selectedInvoice.value = null;
  };
  
  // Định dạng tiền tệ
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
  
  /* Product section - Fixed on the right */
  .product-section {
    position: fixed;
    right: 0;
    top: 95px;
    width: 30%;
    height: 100vh;
    background-color: #f8f8f8;
    padding: 20px;
    overflow-y: auto;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  
  .search-box {
    padding: 10px 0;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px;
    padding-bottom: 60px;
  }
  
  .product-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .product-image {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
  
  .product-name {
    padding: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .product-price {
    padding: 0 8px 8px;
    font-size: 14px;
    font-weight: 600;
    color: #e53935;
  }
  
  .product-stock {
    padding: 4px 8px;
    font-size: 12px;
    color: #4caf50;
    background-color: #f1f8e9;
    border-top: 1px solid #e8f5e9;
  }
  
  .out-of-stock {
    color: #f44336;
    background-color: #ffebee;
    border-top: 1px solid #ffcdd2;
  }
  
  /* Cart section - Left side */
  .cart-section {
    width: 58%;
    margin-right: 40%;
    padding-right: 20px;
  }
  
  .cart-items {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-top: 16px;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .cart-item-number {
    width: 24px;
    text-align: center;
    font-weight: 500;
    color: #757575;
  }
  
  .cart-item-info {
    flex-grow: 1;
    margin-right: 8px;
  }
  
  .cart-item-sku {
    font-size: 12px;
    color: #757575;
  }
  
  .cart-item-name {
    font-weight: 500;
  }
  
  .cart-item-quantity {
    display: flex;
    align-items: center;
    margin: 0 16px;
  }
  
  .quantity-input {
    width: 40px;
    text-align: center;
    border: none;
    background: transparent;
    font-weight: 500;
  }
  
  .cart-item-price, .cart-item-total {
    width: 120px;
    text-align: right;
    font-weight: 500;
  }
  
  .cart-item-total {
    font-weight: 600;
  }
  
  .empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #9e9e9e;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-top: 16px;
  }
  
  .empty-cart-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.4;
  }
  
  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px 0;
  }
  
  .cart-notes {
    display: flex;
    align-items: center;
    color: #757575;
  }
  
  .cart-total {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .cart-total-amount {
    font-size: 18px;
    font-weight: 600;
    color: #e53935;
  }
  
  .payment-button-container {
    margin-top: 16px;
  }
  
  .payment-button {
    width: 100%;
    background-color: #4caf50;
    border-color: #4caf50;
    color: white;
    padding: 12px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .payment-button:hover {
    background-color: #43a047;
    border-color: #43a047;
  }
  
  /* Responsive */
  @media (max-width: 992px) {
    .product-section {
      position: static;
      width: 100%;
      height: auto;
      box-shadow: none;
    }
    
    .cart-section {
      width: 100%;
      margin-right: 0;
      padding-right: 0;
    }
  }
  </style> 