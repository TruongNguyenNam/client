```vue
<template>
  <div class="p-4">
    <div class="card mb-4">
      <div v-if="order">
        <div class="custom-timeline">
          <div v-for="(step, index) in filteredSteps" :key="index" class="timeline-step" :class="{
            completed: index < activeStepIndex,
            active: index === activeStepIndex
          }">
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
      <Button v-if="order?.orderStatus === OrderStatus.PENDING"
        :label="order?.isPos ? 'Xác nhận hoàn thành' : 'Xác nhận đóng gói'" class="p-button-success"
        @click="openConfirmDialog(order?.isPos ? OrderStatus.COMPLETED : OrderStatus.SHIPPED)" :disabled="loading" />
      <Button v-if="order?.orderStatus === OrderStatus.SHIPPED" label="Xác nhận hoàn thành" class="p-button-success"
        @click="openConfirmDialog(OrderStatus.COMPLETED)" :disabled="loading" />
      <Button v-if="order?.orderStatus === OrderStatus.PENDING" label="Huỷ Đơn" class="p-button-danger"
        @click="openConfirmDialog(OrderStatus.CANCELLED)" style="margin-left: 20px;" :disabled="loading" />
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
          <p><strong>Ngày tạo:</strong> {{ formatDate(order?.orderDate) }}</p>
          <p><strong>Người tạo:</strong> {{ authStore.userInfo?.username }}</p>
        </div>
      </div>

      <!-- Card Vận chuyển -->
      <!-- <div class="card h-full" style="width: 52%;">
        <h3 class="mb-2 font-semibold text-lg">🚚 Vận chuyển</h3>
        <div v-if="order?.shipments && order.shipments.length > 0" class="space-y-1 text-gray-700">
          <p><strong>Trạng thái:</strong> {{ order?.shipments[0].shipmentStatus }}</p>
          <p><strong>Đơn vị vận chuyển:</strong> {{ order?.shipments[0].carrierName }}</p>
          <p><strong>Mã theo dõi:</strong> {{ order?.shipments[0].trackingNumber }}</p>
          <p><strong>Dự kiến giao:</strong> {{ order?.shipments[0].estimatedDeliveryDate }}</p>
        </div>
        <div v-else class="text-gray-500 italic">Không có thông tin vận chuyển</div>
      </div> -->

       <div class="card h-full" style="width: 52%;">
        <h3 class="mb-2 font-semibold text-lg">🚚 Vận chuyển</h3>
        <div v-if="order?.shipments && order.shipments.length > 0" class="space-y-1 text-gray-700">
          <p><strong>Trạng thái:</strong> {{ getShipmentStatusLabel(order?.shipments[0].shipmentStatus) }}</p>
          <p><strong>Đơn vị vận chuyển:</strong> {{ order?.shipments[0].carrierName }}</p>
          <p><strong>Mã theo dõi:</strong> {{ order?.shipments[0].trackingNumber }}</p>
          <p><strong>Dự kiến giao:</strong> {{ order?.shipments[0].estimatedDeliveryDate }}</p>
          <!-- <p><strong>Ngày giao:</strong> {{ order?.shipments[0].shipmentDate }}</p> -->
        </div>
        <div v-else class="text-gray-500 italic">Không có thông tin vận chuyển</div>
            </div> 
        </div>

    <div class="card mb-4">
      <h3>👤 Thông tin khách hàng</h3>
      <p><strong>Người đặt:</strong>
        <span v-if="order?.address?.username">{{ order.address.username }}</span>
        <span v-else>Vãng lai</span>

      </p>
      <p><strong>Email:</strong> {{ order?.address?.email }}</p>
      <p><strong>Người nhận:</strong> {{ order?.address?.receiverName }}</p>
      <p><strong>SĐT Người nhận:</strong> {{ order?.address?.receiverPhone }}</p>
      <p><strong>Ngày đặt:</strong> {{ formatDate(order?.orderDate) }}</p>

      <!-- <strong>Địa chỉ:</strong>
      <div class="address-list">
        <div class="address-card">
          <div class="address-info">
            <p>
              <strong>
                <i class="pi pi-user mr-2"></i>{{ order?.address?.receiverName }}</strong> - {{
                  order?.address?.receiverPhone }} <br>
              <i class="pi pi-map-marker mr-2"></i>{{ order?.address?.addressStreet }}, {{ order?.address?.addressWard
              }}, {{ order?.address?.addressDistrict }},{{ order?.address?.addressProvince }}
            </p>
          </div>
        </div>
      </div> -->

      <p><strong>Địa chỉ:</strong>
        {{ [
          order?.address?.addressStreet,
          order?.address?.addressWard,
          order?.address?.addressDistrict,
          order?.address?.addressCity,
          order?.address?.addressProvince
        ].filter(Boolean).join(', ') || 'Chưa có thông tin' }}
      </p>

      <Button v-if="order?.orderStatus === OrderStatus.PENDING" label="Chỉnh sửa địa chỉ" icon="pi pi-pencil" class="p-button-info" 
        @click="openAddressDialog" style="margin-top: 10px;" :disabled="loading" />

      <!-- <Button v-if="order?.orderStatus !== OrderStatus.SHIPPED" label="Chỉnh sửa địa chỉ" icon="pi pi-pencil"
        class="p-button-info" @click="openAddressDialog" style="margin-top: 10px;" :disabled="loading" /> -->

    </div>

    <div class="card mb-4">
      <h3>💳 Thông tin thanh toán</h3>
      <p><strong>Phương thức:</strong> {{ order?.payment?.paymentMethodName }}</p>
      <p><strong>Số tiền:</strong> {{ order?.payment?.amount.toLocaleString('vi-VN') }} đ</p>
      <p><strong>Ngày thanh toán:</strong> {{ formatDate(order?.payment?.paymentDate) }}</p>

      <Button v-if="order?.orderStatus === OrderStatus.PENDING" label="Cập nhật thanh toán" icon="pi pi-money-bill" class="p-button-info" @click="openPaymentDialog"
        style="margin-top: 10px;" :disabled="loading" />

        <!-- <Button v-if="order?.orderStatus !== OrderStatus.SHIPPED" label="Cập nhật thanh toán" icon="pi pi-money-bill"
          class="p-button-info" @click="openPaymentDialog" style="margin-top: 10px;" /> -->
    </div>

    <!-- <div class="card mb-4" v-if="order?.shipments && order.shipments.length > 0">
      <h3>🚚 Vận chuyển</h3>
      <p><strong>Trạng thái:</strong> {{ getShipmentStatusLabel(order?.shipments[0].shipmentStatus) }}</p>
      <p><strong>Ngày giao:</strong> {{ order?.shipments[0].shipmentDate }}</p>
      <p><strong>Đơn vị vận chuyển:</strong> {{ order?.shipments[0].carrierName }}</p>
      <p><strong>Mã theo dõi:</strong> {{ order?.shipments[0].trackingNumber }}</p>
      <p><strong>Dự kiến giao:</strong> {{ order?.shipments[0].estimatedDeliveryDate }}</p>
    </div> -->

  

    <div class="card mb-4">
      <DataTable :value="orderItems" class="p-datatable-gridlines" responsiveLayout="scroll">
        <Column field="productName" header="Tên sản phẩm" />
        <Column header="Hình ảnh">
          <template #body="slotProps">
            <img :src="slotProps.data.productImage" alt="Hình ảnh sản phẩm" class="w-10 h-10 rounded-full"
              style="width: 100px; height: 100px;" />
          </template>
        </Column>
        <Column header="Số lượng">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <Button icon="pi pi-minus" rounded text @click="decreaseQuantity(slotProps.index)" :disabled="order?.orderStatus !== OrderStatus.PENDING || loading" />
              <span>{{ slotProps.data.quantity }}</span>
              <Button icon="pi pi-plus" rounded text @click="increaseQuantity(slotProps.index)" :disabled="order?.orderStatus !== OrderStatus.PENDING || loading" />
            </div>
          </template>
        </Column>
        <Column header="Giá sản phẩm">
          <template #body="slotProps">
            {{ slotProps.data.unitPrice.toLocaleString('vi-VN') }} đ
          </template>
        </Column>
        <Column header="Thành tiền">
          <template #body="slotProps">
            {{ (slotProps.data.quantity * slotProps.data.unitPrice).toLocaleString('vi-VN') }} đ
          </template>
        </Column>
        <Column header="Hành động">
          <template #body="slotProps">
            <Button label="Xoá" severity="danger" @click="removeItem(slotProps.index)" style="margin-left: 40px;" :disabled="order?.orderStatus !== OrderStatus.PENDING || loading" />
          </template>
        </Column>
      </DataTable>

      <div class="card mb-4 justify-content-between" style="display: flex; justify-content: flex-end;">

        <Button v-if="order?.orderStatus === OrderStatus.PENDING" label="Thêm sản phẩm" icon="pi pi-plus" class="p-button-primary"
          style="margin-top: 5px; margin-bottom: 10px; border-radius: 5px;" @click="showProductDialog = true" :disabled="loading" />

        <!-- <Button v-if="order?.orderStatus !== OrderStatus.SHIPPED" label="Thêm sản phẩm" icon="pi pi-plus"
          class="p-button-primary" style="margin-top: 5px; margin-bottom: 10px; border-radius: 5px;"
          @click="showProductDialog = true" /> -->
      </div>
    </div>

    <Dialog v-model:visible="showAddressDialog" modal header="Cập nhật địa chỉ" :style="{ width: '50vw' }">
      <div class="p-field">
        <label for="receiverName">Tên người nhận</label>
        <InputText id="receiverName" v-model="tempAddress.receiverName" class="w-full" />
      </div>
      <div class="p-field">
        <label for="receiverPhone">Số điện thoại</label>
        <InputText id="receiverPhone" v-model="tempAddress.receiverPhone" class="w-full" />
      </div>
      <div class="p-field">
        <label for="email">Email</label>
        <InputText id="email" v-model="tempAddress.email" disabled class="w-full" />
      </div>
      <div class="p-field">
        <label for="province">Tỉnh/Thành phố</label>
        <Dropdown id="province" v-model="selectedProvince" :options="provinceOptions" option-label="name"
          option-value="name" @change="updateDistricts" class="w-full" placeholder="Chọn Tỉnh/Thành phố" />
      </div>
      <div class="p-field">
        <label for="district">Quận/Huyện</label>
        <Dropdown id="district" v-model="selectedDistrict" :options="districtOptions" option-label="name"
          option-value="name" @change="updateWards" class="w-full" placeholder="Chọn Quận/Huyện"
          :disabled="!selectedProvince" />
      </div>
      <div class="p-field">
        <label for="ward">Phường/Xã</label>
        <Dropdown id="ward" v-model="tempAddress.addressWard" :options="wardOptions" option-label="name"
          option-value="name" class="w-full" placeholder="Chọn Phường/Xã" :disabled="!selectedDistrict" />
      </div>
      <div class="p-field">
        <label for="street">Đường</label>
        <InputText id="street" v-model="tempAddress.addressStreet" class="w-full" />
      </div>
      <div class="p-field">
        <label for="zipcode">Mã bưu điện</label>
        <InputText id="zipcode" v-model="tempAddress.addressZipcode" class="w-full" />
      </div>
      <div class="flex justify-content-end gap-2">
        <Button label="Hủy" class="p-button-text" @click="showAddressDialog = false" />
        <Button label="Lưu" class="p-button-primary" @click="saveAddress" :loading="loading" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showProductDialog" modal header="Chọn sản phẩm" :style="{ width: '80vw' }">
      <ListProduct @select="handleAddProduct" />
    </Dialog>

    <Dialog v-model:visible="showPaymentDialog" modal header="Cập nhật thanh toán"
      :style="{ width: '50vw', zIndex: 1000 }">
      <div v-if="loadingPaymentMethods">
        <p>Đang tải phương thức thanh toán...</p>
      </div>
      <div v-else-if="!paymentMethods || paymentMethods.length === 0">
        <p>Không có phương thức thanh toán nào khả dụng.</p>
      </div>
      <div v-else class="p-field">
        <label for="paymentMethod">Phương thức thanh toán</label>
        <Dropdown id="paymentMethod" v-model="tempPayment.paymentMethodId" :options="paymentMethods" option-label="name"
          option-value="id" class="w-full" placeholder="Chọn phương thức thanh toán" />
      </div>
      <div class="p-field">
        <label for="additionalAmount">Số tiền cần thêm ({{ paymentShortage.toLocaleString('vi-VN') }} đ)</label>
        <InputNumber id="additionalAmount" v-model="tempPayment.additionalAmount" mode="currency" currency="VND"
          locale="vi-VN" class="w-full" :min="0" />
      </div>
      <div class="flex justify-content-end gap-2">
        <Button label="Hủy" class="p-button-text" @click="showPaymentDialog = false" />
        <Button label="Lưu" class="p-button-primary" @click="savePayment"
          :disabled="loadingPaymentMethods || !paymentMethods || paymentMethods.length === 0" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showConfirmDialog" modal :header="confirmHeader" :style="{ width: '50vw' }">
      <div class="p-field">
        <p>{{ confirmMessage }}</p>
        <label for="notes">Ghi chú (tùy chọn)</label>
        <InputText id="notes" v-model="confirmNotes" class="w-full" placeholder="Nhập ghi chú (nếu có)" />
      </div>
      <div class="flex justify-content-end gap-2">
        <Button label="Hủy" class="p-button-text" @click="showConfirmDialog = false" />
        <Button label="Xác nhận" class="p-button-primary" @click="updateOrderStatus" :loading="loading" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, getCurrentInstance } from 'vue';
import type { OrderResponse, OrderItemResponse, AddressResponse } from '../../../../model/admin/order';
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
import { AddressService } from '../../../../service/admin/AddressService';
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import { useAuthStore } from '../../../../stores/auth';

// Thêm renderKey để kiểm soát render
const renderKey = ref(0);
const authStore =  useAuthStore();
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

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


const shipmentStatusLabels = {
  PENDING: 'Chờ xác nhận',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao hàng',
  RETURNED: 'Trả hàng',
  CANCELED: 'Hủy'
};

const getShipmentStatusLabel = (status: string): string => {
  return shipmentStatusLabels[status as keyof typeof shipmentStatusLabels] || 'Không xác định';
};

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

export interface AddressRequest {
  street: string;
  ward: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  district: string;
  province: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

// Biến reactive
const showAddressDialog = ref(false);
const tempAddress = ref<AddressResponse>({
  id: 0,
  email: '',
  userId: 0,
  username: '',
  phoneNumber: '',
  role: '',
  addressStreet: '',
  addressWard: '',
  addressCity: '',
  addressState: '',
  addressCountry: 'Vietnam',
  addressZipcode: '',
  addressDistrict: '',
  addressProvince: '',
  receiverName: '',
  receiverPhone: '',
  isDefault: false,
  isActive: true
});

const selectedProvince = ref<string>('');
const selectedDistrict = ref<string>('');
const provinceOptions = ref(provincesData.data);
const districtOptions = ref<any[]>([]);
const wardOptions = ref<any[]>([]);

const openAddressDialog = () => {
  if (!order.value?.address) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không có thông tin địa chỉ để chỉnh sửa',
      life: 3000
    });
    return;
  }

  // Sao chép dữ liệu địa chỉ hiện tại vào tempAddress
  tempAddress.value = { ...order.value.address };
  console.log('Order Address:', tempAddress.value); // Debug: Log address data

  // Normalize and set selectedProvince
  const normalizeName = (name: string) => name.replace(/^(Tỉnh|Thành phố|Quận|Huyện|Xã|Phường)\s+/i, '').trim();
  const provinceName = normalizeName(tempAddress.value.addressProvince || '');
  const province = provinceOptions.value.find(p => normalizeName(p.name) === provinceName);
  selectedProvince.value = province ? province.name : tempAddress.value.addressProvince || '';
  console.log('Normalized Province:', provinceName, 'Found Province:', province); // Debug

  // Populate districtOptions
  updateDistricts();

  // Set selectedDistrict, use a fallback if addressDistrict is empty
  const districtName = normalizeName(tempAddress.value.addressDistrict || '');
  const district = districtOptions.value.find(d => normalizeName(d.name) === districtName);
  selectedDistrict.value = district ? district.name : '';
  if (!selectedDistrict.value && districtOptions.value.length > 0) {
    selectedDistrict.value = districtOptions.value[0].name; // Default to first district if none found
  }
  console.log('Normalized District:', districtName, 'Found District:', district, 'Selected District:', selectedDistrict.value); // Debug

  // Populate wardOptions
  updateWards();

  // Set ward, with fallback if not found
  const wardName = normalizeName(tempAddress.value.addressWard || '');
  const ward = wardOptions.value.find(w => normalizeName(w.name) === wardName);
  tempAddress.value.addressWard = ward ? ward.name : tempAddress.value.addressWard || '';
  if (!tempAddress.value.addressWard && wardOptions.value.length > 0) {
    tempAddress.value.addressWard = wardOptions.value[0].name; // Default to first ward if none found
  }
  console.log('Normalized Ward:', wardName, 'Found Ward:', ward, 'Selected Ward:', tempAddress.value.addressWard); // Debug

  showAddressDialog.value = true;
};

const updateDistricts = () => {
  const province = provinceOptions.value.find(p => p.name === selectedProvince.value);
  if (province && province.level2s) {
    districtOptions.value = province.level2s;
    selectedDistrict.value = ''; // Reset Quận/Huyện
    wardOptions.value = []; // Reset Phường/Xã
    tempAddress.value.addressDistrict = '';
    tempAddress.value.addressWard = '';
    console.log('District Options for Province', selectedProvince.value, ':', districtOptions.value); // Debug
  } else {
    districtOptions.value = [];
    wardOptions.value = [];
    console.warn('No districts found for province:', selectedProvince.value);
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: `Không tìm thấy Quận/Huyện cho ${selectedProvince.value}`,
      life: 3000
    });
  }
};

const updateWards = () => {
  const district = districtOptions.value.find(d => d.name === selectedDistrict.value);
  if (district && district.level3s) {
    wardOptions.value = district.level3s;
    tempAddress.value.addressWard = ''; // Reset Phường/Xã
    console.log('Ward Options for District', selectedDistrict.value, ':', wardOptions.value); // Debug
  } else {
    wardOptions.value = [];
    console.warn('No wards found for district:', selectedDistrict.value);
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: `Không tìm thấy Phường/Xã cho ${selectedDistrict.value}`,
      life: 3000
    });
  }
};

// Lưu địa chỉ đã chỉnh sửa
const saveAddress = async () => {
  tempAddress.value.addressProvince = selectedProvince.value;
  tempAddress.value.addressDistrict = selectedDistrict.value;
  if (!order.value || !tempAddress.value.id || !tempAddress.value.userId) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Thông tin đơn hàng hoặc địa chỉ không hợp lệ',
      life: 3000
    });
    return;
  }

  loading.value = true;
  try {
    const addressRequest: AddressRequest = {
      street: tempAddress.value.addressStreet,
      ward: tempAddress.value.addressWard,
      city: tempAddress.value.addressCity,
      state: tempAddress.value.addressState,
      country: tempAddress.value.addressCountry,
      zipcode: tempAddress.value.addressZipcode,
      district: tempAddress.value.addressDistrict,
      province: tempAddress.value.addressProvince,
      receiverName: tempAddress.value.receiverName,
      receiverPhone: tempAddress.value.receiverPhone,
      isDefault: tempAddress.value.isDefault
    };

    const response = await AddressService.updateAddressForCustomer(
      tempAddress.value.userId,
      tempAddress.value.id,
      addressRequest
    );

    if (response.data) {
      // Cập nhật lại order.address với dữ liệu mới
      order.value.address = { ...tempAddress.value };
      showAddressDialog.value = false;
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật địa chỉ thành công',
        life: 3000
      });
      renderKey.value += 1; // Tăng renderKey để cập nhật giao diện
    }
  } catch (error: any) {
    console.error('Lỗi khi cập nhật địa chỉ:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.message || 'Cập nhật địa chỉ thất bại',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

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
    console.log('Fetched Order Details - Status:', order.value.orderStatus);
    console.log("order", order.value);
    // Cập nhật renderKey khi order thay đổi
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

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-default {
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  font-size: 0.85rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  margin-top: 4px;
}
</style>
```