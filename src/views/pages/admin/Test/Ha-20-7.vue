<!-- file khách hàng nhiều địa chỉ -->
<template>
  <Sidebar v-model:visible="isVisible" position="right" class="payment-toolbar"
    :style="{ width: '550px', maxWidth: '100%' }" :dismissable="false" @hide="$emit('close')">
    <div class="p-4">
      <h3 class="text-xl font-semibold mb-4">{{ invoice.orderCode }}</h3>

      <!-- Chọn khách hàng -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Khách hàng</label>
        <div class="flex items-center gap-2">
          <InputText v-model="selectedCustomerName" placeholder="Chọn khách hàng" class="flex-1" :disabled="true"
            @click="showDialog = true" />
          <Button icon="pi pi-plus" text severity="secondary" @click="showDialog = true" />
        </div>
      </div>

      <CustomerDialog v-model="showDialog" @selected="handleCustomerSelect" />

      <!-- Thông tin khách hàng -->
      <div v-if="selectedCustomer" class="mb-4 bg-gray-50 rounded-lg p-5 shadow-sm">
        <div class="space-y-4">
          <!-- Họ tên & SĐT -->
          <label class="block text-sm text-gray-600 mb-3">Thông Tin Khách Hàng</label>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">Họ tên</label>
              <InputText v-model="selectedCustomer.username" class="w-full bg-gray-100" :disabled="true"
                placeholder="Họ tên" />
            </div>
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">Số điện thoại</label>
              <InputText v-model="selectedCustomer.phoneNumber" class="w-full bg-gray-100" :disabled="true"
                placeholder="Số điện thoại" />
            </div>
          </div>

          <!-- Email -->
          <!-- <div>
          <label class="block text-sm text-gray-600 mb-1">Email</label>
          <InputText
            v-model="selectedCustomer.email"
            class="w-full bg-gray-100"
            :disabled="true"
            placeholder="Email"
          />
        </div> -->

          <!-- Địa chỉ giao hàng -->
          <AddressSelectDialog v-model:visible="showAddressDialog" :addresses="selectedCustomer?.addresses || []"
            :customer-id="selectedCustomer.id" @select="handleAddressSelect" @submitAddress="handleAddressSubmit"
            :key="addressDialogKey" @cancel="showAddressDialog = false" 
             @deleteAddress="refreshSelectedCustomer"/>


          <div>
            <label class="block text-sm text-gray-600 mb-2">Địa chỉ giao hàng</label>

            <!-- Địa chỉ giao hàng (cải tiến) -->
            <div class="bg-white p-3 rounded border mb-3">
              <div class="mb-2">
                <strong>{{ selectedAddress?.receiverName }}</strong> - {{ selectedAddress?.receiverPhone }}
              </div>

              <div class="text-sm text-gray-700 leading-relaxed">
                {{ fullAddress }}
              </div>
              <div v-if="!invoice.isPos && selectedCustomer?.addresses?.length > 1" class="mt-3">
                <Button label="Chọn địa chỉ giao hàng khác" icon="pi pi-map-marker" outlined class="w-full"
                  @click="showAddressDialog = true" />
              </div>
            </div>



            <!-- <div class="mb-3">
            <InputText
                v-model="selectedCustomer.addressWard"
                class="w-full bg-gray-100"
                :disabled="true"
                placeholder="Phường/Xã"
              />
          </div>

          <div class="mb-3">
            <InputText
                v-model="selectedCustomer.addressDistrict"
                class="w-full bg-gray-100"
                :disabled="true"
                placeholder="Quận/Huyện"
              />
          </div>

          <div class="mb-3">
            <InputText
              v-model="selectedCustomer.addressProvince"
              class="w-full bg-gray-100"
              :disabled="true"
              placeholder="Tỉnh/Thành phố"
            />
          </div>

          <div class="mb-3">
              <InputText
              v-model="selectedCustomer.addressZipcode"
              class="w-full bg-gray-100"
              :disabled="true"
              placeholder="Mã bưu chính"
            />
          </div> -->

            <!-- Phường / Quận
            <div class="flex gap-4 mb-3">
              <div class="flex-1">
                <label class="block text-sm text-gray-600 mb-2">Phường / Quận</label>
                <InputText :value="selectedAddress?.ward" class="w-full bg-gray-100" :disabled="true"
                  placeholder="Phường/Xã" />
              </div>
              <div class="flex-1">
                <label class="block text-sm text-gray-600 mb-2">Quận/Huyện</label>
                <InputText :value="selectedAddress?.district" class="w-full bg-gray-100" :disabled="true"
                  placeholder="Quận/Huyện" />
              </div>
            </div> -->

            <!-- Tỉnh / Mã bưu chính
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm text-gray-600 mb-2">Tỉnh/Thành phố</label>
                <InputText :value="selectedAddress?.province" class="w-full bg-gray-100" :disabled="true"
                  placeholder="Tỉnh/Thành phố" />
              </div>
              <div class="flex-1">
                <label class="block text-sm text-gray-600 mb-2">Mã Code</label>
                <InputText :value="selectedAddress?.zipcode" class="w-full bg-gray-100" :disabled="true"
                  placeholder="Mã bưu chính" />
              </div>
            </div> -->
          </div>
        </div>
      </div>


      <!-- Thông tin vận chuyển (nếu không phải POS) -->
      <div v-if="!invoice.isPos" class="mb-4">
        <label class="block mb-1 font-medium">Nhà vận chuyển</label>
        <Dropdown v-model="invoice.carrierId" :options="carriers" optionLabel="name" optionValue="id"
          placeholder="Chọn nhà vận chuyển" class="w-full" />
      </div>

      <div v-if="!invoice.isPos" class="mb-4">
        <label class="block mb-1 font-medium">Ngày giao dự kiến</label>
        <Calendar v-model="invoice.estimatedDeliveryDate" showTime hourFormat="24" class="w-full" />
      </div>

      <!-- Tính tiền -->
      <div class="mb-4">
        <div class="flex justify-between mb-2 items-center">
          <span class="label">Tổng tiền hàng:</span>
          <span class="value font-medium">{{ formatCurrency(invoice.orderTotal).replace('₫', 'đ') }}</span>
        </div>
        <div class="flex justify-between mb-2 items-center">
          <span class="label">Mã giảm giá:</span>
          <MultiSelect v-model="invoice.couponUsageIds" :options="couponUsage" optionLabel="couponCode" optionValue="id"
            placeholder="Chọn mã giảm giá" :maxSelectedLabels="3" class="value w-full md:w-80"
            @change="$emit('update-total')" />
        </div>
        <div v-if="invoice.couponUsageIds && invoice.couponUsageIds.length > 0"
          class="text-sm text-gray-500 mb-2 ml-[140px]">
          <span v-for="couponId in invoice.couponUsageIds" :key="couponId">
            Mã {{ getCouponById(couponId)?.couponCode }} giảm {{
              formatCurrency(getCouponById(couponId)?.couponDiscountAmount || 0).replace('₫', 'đ') }}
          </span>
        </div>
        <div class="flex justify-between mb-2 items-center">
          <span class="label">Số tiền giảm:</span>
          <span class="value font-medium">{{ formatCurrency(invoice.discount || 0).replace('₫', 'đ') }}</span>
        </div>
        <div class="flex justify-between mb-2 items-center font-semibold">
          <span class="label">Khách cần trả:</span>
          <span class="value kct">{{ formatCurrency(calculateFinalTotal()).replace('₫', 'đ') }}</span>
        </div>
        <div class="flex justify-between mb-2 items-center">
          <span class="label">Khách thanh toán:</span>
          <InputNumber v-model="invoice.paidAmount" @input="handlePaidAmountChange" class="value w-full md:w-80"
            :min="0" :useGrouping="true" placeholder="Nhập số tiền" />
        </div>
        <div v-if="changeAmount !== null && changeAmount >= 0"
          class="flex justify-between mb-2 items-center text-green-600">
          <span class="label">Tiền thừa:</span>
          <span class="value">{{ formatCurrency(changeAmount).replace('₫', 'đ') }}</span>
        </div>
      </div>

      <!-- Phương thức thanh toán -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Phương thức thanh toán</label>
        <Dropdown v-model="invoice.paymentMethodId" :options="paymentMethods" optionLabel="name" optionValue="id"
          placeholder="Chọn phương thức" class="w-full" @change="updatePaymentMethod" />
      </div>

      <!-- Ghi chú -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Ghi chú</label>
        <Textarea v-model="invoice.notes" class="w-full" rows="4" />
      </div>

      <!-- Nút điều khiển -->
      <div class="flex justify-end gap-2">
        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
        <Button label="Hoàn tất" icon="pi pi-check" @click="$emit('complete-payment')" />
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Sidebar from 'primevue/sidebar';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import type { CustomerResponse } from '../../../../model/admin/customer';
import type { PaymentMethodResponse } from '../../../../model/admin/paymentMethod';
import type { CouponUsageResponse } from '../../../../model/admin/couponUsage';
import type { CarrierResponse } from '../../../../model/admin/carrier';
import { CouponUsageService } from '../../../../service/admin/CouponUsageService';
import CustomerDialog from './CustomerDialog.vue';
import AddressSelectDialog from './AddressSelectDialog.vue';
import type { AddressResponse } from '../../../../model/admin/address';
import { AddressService } from '../../../../service/admin/AddressService';
import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';
import provincesData from '../../../../assets/data/vietnam_provinces.json';

const provinceOptions = provincesData.data;

const props = defineProps<{
  invoice: {
    orderCode: string;
    userId: number | null;
    customerName: string;
    phoneNumber: string;
    email: string;
    addressStreet: string;
    addressWard: string;
    addressDistrict: string;
    addressProvince: string;
    addressCity: string;
    addressZipcode: string;
    isPos: boolean;
    carrierId: number | null;
    estimatedDeliveryDate: Date | null;
    orderTotal: number;
    discount: number;
    couponUsageIds: number[];
    paidAmount: number | null;
    paymentMethodId: number | null;
    paymentMethod: string;
    notes: string;
    receiverName: string;
    receiverPhone: string;

  };
  customers: CustomerResponse[];
  paymentMethods: PaymentMethodResponse[];
  couponUsage: CouponUsageResponse[];
  carriers: CarrierResponse[];
  changeAmount: number | null;
}>();

const showAddressDialog = ref(false);


const handleAddressSelect = (address: AddressResponse) => {
  selectedAddressId.value = address.id;
  props.invoice.addressStreet = address.street;
  props.invoice.addressWard = address.ward;
  props.invoice.addressDistrict = address.district;
  props.invoice.addressProvince = address.province;
  props.invoice.addressCity = address.city || '';
  props.invoice.addressZipcode = address.zipcode || '';
  props.invoice.receiverName = address.receiverName;
  props.invoice.receiverPhone = address.receiverPhone;

};

const showDialog = ref(false);
const emit = defineEmits<{
  (e: 'update-total'): void;
  (e: 'update-change'): void;
  (e: 'close'): void;
  (e: 'complete-payment'): void;
}>();

const fullAddress = computed(() => {
  if (!selectedAddress.value) return '';
  const addr = selectedAddress.value;
  return [
    addr.street,
    addr.ward,
    addr.district,
    addr.province,
    addr.city,
    addr.zipcode
  ].filter(Boolean).join(', ');
});

// id của địa chỉ được chọn
const selectedAddressId = ref<number | null>(null);

const handleAddressSubmit = async (submittedData: any) => {
  if (!selectedCustomer.value) return;
  const province = provinceOptions.find(p => p.level1_id === submittedData.province);
  const district = province?.level2s.find(d => d.level2_id === submittedData.district);
  const ward = district?.level3s.find(w => w.level3_id === submittedData.ward);

  const finalAddress = {
    ...submittedData,
    province: province?.name || '',
    district: district?.name || '',
    ward: ward?.name || '',
    country: 'Việt Nam'
  };

  try {
    if (submittedData.id) {
      // Cập nhật địa chỉ
      const resAdd = await AddressService.updateAddressForCustomer(selectedCustomer.value.id, submittedData.id, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã cập nhật địa chỉ thành công.',
        life: 3000
      });
      if (resAdd.data?.id) {
        selectedAddressId.value = resAdd.data.id;
        await refreshSelectedCustomer(); // Đồng bộ lại dữ liệu
        addressDialogKey.value++; // Reset dialog nếu cần
      }
      selectedAddressId.value = submittedData.id; // Cập nhật lại địa chỉ đang chọn
    } else {
      // Thêm mới địa chỉ
      const resAdd = await CustomerService.addAddressForCustomer(selectedCustomer.value.id, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã thêm địa chỉ mới cho khách hàng.',
        life: 3000
      });
      // Sau khi thêm xong, lấy ID địa chỉ vừa thêm nếu API trả về
      const newAddressId = resAdd.data?.id;
      if (resAdd.data?.id) {
        selectedAddressId.value = resAdd.data.id;
        await refreshSelectedCustomer(); // Đồng bộ lại dữ liệu
        addressDialogKey.value++; // Reset dialog nếu cần
      }
    }

  } catch (error) {
    console.error('Lỗi xử lý địa chỉ:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xử lý địa chỉ', life: 3000 });
  }
};

const addressDialogKey = ref(0);

// đồng bộ lại thông tin khách hàng
const refreshSelectedCustomer = async () => {
  if (!selectedCustomer.value) return;
  try {
    const res = await CustomerService.getCustomerById(selectedCustomer.value.id);
    if (res.data) {
      Object.assign(selectedCustomer.value, res.data); // Cập nhật lại toàn bộ
    }
  } catch (error) {
    console.error('Lỗi đồng bộ khách hàng:', error);
    toast.add({ severity: 'error', summary: 'Không thể đồng bộ khách hàng', life: 3000 });
  }
};


const selectedCustomerId = ref<number | null>(props.invoice.userId);
const selectedCustomerName = ref<string>(props.invoice.customerName || '');
const toast = useToast();
const isVisible = ref(true);
const localCouponUsage = ref<CouponUsageResponse[]>([]);

const selectedCustomer = computed(() => {
  return props.customers.find(c => c.id === selectedCustomerId.value) || null;
});

const getCouponById = (id: number) => {
  return props.couponUsage.find(c => c.id === id) || null;
};

const fetchCouponUsage = async () => {
  if (selectedCustomerId.value) {
    try {
      const response = await CouponUsageService.getAllCouponUsage(selectedCustomerId.value);
      if (response && response.data) {
        localCouponUsage.value = response.data;
        props.couponUsage.splice(0, props.couponUsage.length, ...localCouponUsage.value);
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách mã giảm giá',
        life: 3000
      });
    }
  } else {
    localCouponUsage.value = [];
    props.couponUsage.splice(0, props.couponUsage.length);
  }
};

// lấy điạ chỉ mặc định hoặc đầu tiên
const selectedAddress = computed(() => {
  if (!selectedCustomer.value?.addresses) return null;
  return selectedCustomer.value.addresses.find(a => a.id === selectedAddressId.value)
    || selectedCustomer.value.addresses[0];
});


// Xử lý khi khách hàng được chọn từ CustomerDialog
const handleCustomerSelect = (customer: CustomerResponse) => {
  selectedCustomerId.value = customer.id;
  selectedCustomerName.value = customer.username;
  showDialog.value = false;

  props.invoice.userId = customer.id;
  props.invoice.customerName = customer.username;
  props.invoice.phoneNumber = customer.phoneNumber;
  props.invoice.email = customer.email;

  if (!props.invoice.isPos) {
    // Nếu là đơn giao hàng, cho phép chọn địa chỉ cụ thể
    // Giả sử bạn có dialog hoặc dropdown chọn địa chỉ ở đây
    // (hoặc đơn giản chọn địa chỉ mặc định trong danh sách)
    const defaultAddress = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id;

      props.invoice.addressStreet = defaultAddress.street;
      props.invoice.addressWard = defaultAddress.ward;
      props.invoice.addressDistrict = defaultAddress.district;
      props.invoice.addressProvince = defaultAddress.province;
      props.invoice.addressCity = defaultAddress.city || '';
      props.invoice.addressZipcode = defaultAddress.zipcode || '';
      props.invoice.receiverName = defaultAddress.receiverName;
      props.invoice.receiverPhone = defaultAddress.receiverPhone;
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Chưa có địa chỉ',
        detail: 'Khách hàng chưa có địa chỉ giao hàng',
        life: 3000
      });
    }

  } else {
    // Đơn tại cửa hàng, không cần nhập địa chỉ
    props.invoice.addressStreet = '';
    props.invoice.addressWard = '';
    props.invoice.addressDistrict = '';
    props.invoice.addressProvince = '';
    props.invoice.addressCity = '';
    props.invoice.addressZipcode = '';
  }
  fetchCouponUsage();
};

watch(selectedAddressId, (newId) => {
  const addr = selectedCustomer.value?.addresses.find(a => a.id === newId);
  if (addr) {
    props.invoice.addressStreet = addr.street;
    props.invoice.addressWard = addr.ward;
    props.invoice.addressDistrict = addr.district;
    props.invoice.addressProvince = addr.province;
    props.invoice.addressCity = addr.city || '';
    props.invoice.addressZipcode = addr.zipcode || '';
  }
});


const updatePaymentMethod = () => {
  const method = props.paymentMethods.find(m => m.id === props.invoice.paymentMethodId);
  props.invoice.paymentMethod = method?.name || 'Tiền mặt';
  emit('update-total');
};

const calculateFinalTotal = () => {
  return props.invoice.orderTotal - (props.invoice.discount || 0);
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const handlePaidAmountChange = () => {
  emit('update-change');
};

watch(selectedCustomerId, async () => {
  if (selectedCustomerId.value) {
    await fetchCouponUsage();
  }
}, { immediate: true });

watch(() => props.invoice.paymentMethodId, () => {
  updatePaymentMethod();
}, { immediate: true });

watch(() => props.invoice.couponUsageIds, (newCouponIds) => {
  const coupons = props.couponUsage.filter(c => newCouponIds?.includes(c.id));
  if (coupons.length > 0) {
    props.invoice.discount = coupons.reduce((sum, coupon) => sum + (coupon.couponDiscountAmount || 0), 0);
    if (props.invoice.orderTotal < props.invoice.discount) {
      props.invoice.discount = 0;
      props.invoice.couponUsageIds = [];
      toast.add({
        severity: 'warn',
        summary: 'Mã không hợp lệ',
        detail: `Đơn hàng cần tối thiểu ${formatCurrency(props.invoice.discount).replace('₫', 'đ')} để áp dụng mã này`,
        life: 3000
      });
    }
  } else {
    props.invoice.discount = 0;
  }
  emit('update-total');
}, { immediate: true });

watch(() => props.invoice.paidAmount, () => {
  handlePaidAmountChange();
}, { immediate: true });
</script>

<style scoped>
.label {
  width: 140px;
  text-align: left;
  font-size: 1rem;
}

.value {
  flex: 1;
  text-align: right;
}

.flex {
  display: flex;
  align-items: center;
}

.mb-2 {

  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.kct {
  color: #1e90ff;
  /* Màu xanh cho "Khách cần trả" để nổi bật */
}

/* Tùy chỉnh InputText để trông đẹp hơn */
:deep(.p-inputtext) {
  cursor: pointer;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ced4da;
}

:deep(.p-inputtext:disabled) {
  opacity: 1;
  color: #495057;
  background-color: #f1f5f9;
}

:deep(.p-inputtext:focus) {
  border-color: #4dabf7;
  box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
}
</style>