<template>
  <div class="payment-toolbar">
    <div class="p-4">
      <h3 class="text-xl font-semibold mb-4">{{ invoice.orderCode }}</h3>

      <!-- Chọn khách hàng -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Khách hàng</label>
        <Dropdown
          v-model="selectedCustomerId"
          :options="customers"
          optionLabel="username"
          optionValue="id"
          placeholder="Chọn khách hàng"
          class="w-full"
        />
      </div>

      <!-- Thông tin khách hàng -->
      <div v-if="selectedCustomer" class="mb-4 bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">Họ tên</div>
            <div class="font-medium">{{ selectedCustomer.username }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Số điện thoại</div>
            <div class="font-medium">{{ selectedCustomer.phoneNumber }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Email</div>
            <div class="font-medium">{{ selectedCustomer.email }}</div>
          </div>
        </div>
        <div class="border-t pt-3">
          <div class="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</div>
          <div class="font-medium">{{ selectedCustomer.addressStreet }}</div>
          <div>
            <span v-if="selectedCustomer.addressWard">{{ selectedCustomer.addressWard }}, </span>
            <span v-if="selectedCustomer.addressDistrict">{{ selectedCustomer.addressDistrict }}, </span>
            <span v-if="selectedCustomer.addressProvince">{{ selectedCustomer.addressProvince }}</span>
          </div>
          <div v-if="selectedCustomer.addressZipcode" class="text-sm">
            Mã bưu chính: {{ selectedCustomer.addressZipcode }}
          </div>
        </div>
      </div>

      <!-- Thông tin vận chuyển (nếu không phải POS) -->
      <div v-if="!invoice.isPos" class="mb-4">
        <label class="block mb-1 font-medium">Nhà vận chuyển</label>
        <Dropdown
          v-model="invoice.carrier"
          :options="shipments"
          optionLabel="carrier"
          optionValue="carrier"
          placeholder="Chọn nhà vận chuyển"
          class="w-full"
        />
      </div>
      <div v-if="!invoice.isPos" class="mb-4">
        <label class="block mb-1 font-medium">Ngày giao dự kiến</label>
        <Calendar v-model="invoice.estimatedDeliveryDate" showTime hourFormat="24" class="w-full" />
      </div>

      <!-- Tính tiền -->
      <div class="mb-4">
        <div class="flex justify-between mb-2">
          <span>Tổng tiền hàng</span>
          <span class="font-medium">{{ formatCurrency(invoice.orderTotal).replace('₫', 'đ') }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span>Mã giảm giá</span>
          <Dropdown
            v-model="invoice.couponId"
            :options="coupons"
            optionLabel="code"
            optionValue="id"
            placeholder="Chọn mã giảm giá"
            class="w-32"
            @change="$emit('update-total')"
          />
        </div>
        <div v-if="invoice.couponId" class="text-sm text-gray-500 mb-2">
          Mã {{ selectedCoupon?.code }} giảm {{ formatCurrency(invoice.discount).replace('₫', 'đ') }}
        </div>
        <div class="flex justify-between mb-2">
          <span>Số tiền giảm</span>
          <InputNumber
            v-model="invoice.discount"
            :min="0"
            :max="invoice.orderTotal"
            @input="$emit('update-total')"
            class="w-32"
            placeholder="Nhập số tiền giảm"
          />
        </div>
        <div class="flex justify-between mb-2 font-semibold">
          <span>Khách cần trả</span>
          <span>{{ formatCurrency(calculateFinalTotal()).replace('₫', 'đ') }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span>Khách thanh toán</span>
          <InputNumber v-model="invoice.paidAmount" @input="$emit('update-change')" class="w-32" />
        </div>
        <div v-if="changeAmount > 0" class="flex justify-between mb-2 text-green-600">
          <span>Tiền thừa</span>
          <span>{{ formatCurrency(changeAmount).replace('₫', 'đ') }}</span>
        </div>
      </div>

      <!-- Phương thức thanh toán -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Phương thức thanh toán</label>
        <Dropdown
          v-model="invoice.paymentMethodId"
          :options="paymentMethods"
          optionLabel="name"
          optionValue="id"
          placeholder="Chọn phương thức"
          class="w-full"
          @change="updatePaymentMethod"
        />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import type { CustomerResponse } from '../../../../model/customer';
import type { PaymentMethodResponse } from '../../../../model/paymentMethod';
import type { CouponResponse } from '../../../../model/coupon';
import type { ShipmentResponse } from '../../../../model/shipment';

// Props
const props = defineProps<{
  invoice: any;
  customers: CustomerResponse[];
  paymentMethods: PaymentMethodResponse[];
  coupons: CouponResponse[];
  shipments: ShipmentResponse[];
  changeAmount: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update-total'): void;
  (e: 'update-change'): void;
  (e: 'close'): void;
  (e: 'complete-payment'): void;
}>();

// State
const selectedCustomerId = ref<number | null>(props.invoice.userId);
const toast = useToast();

// Computed
const selectedCustomer = computed(() => {
  return props.customers.find(c => c.id === selectedCustomerId.value) || null;
});

const selectedCoupon = computed(() => {
  return props.coupons.find(c => c.id === props.invoice.couponId) || null;
});

// Methods
const onCustomerSelect = () => {
  if (!selectedCustomer.value) {
    props.invoice.userId = null;
    props.invoice.customerName = '';
    props.invoice.phoneNumber = '';
    props.invoice.email = '';
    if (!props.invoice.isPos) {
      props.invoice.addressStreet = '';
      props.invoice.addressWard = '';
      props.invoice.addressDistrict = '';
      props.invoice.addressProvince = '';
      props.invoice.addressCity = '';
      props.invoice.addressZipcode = '';
    }
    return;
  }
  props.invoice.userId = selectedCustomer.value.id;
  props.invoice.customerName = selectedCustomer.value.username;
  props.invoice.phoneNumber = selectedCustomer.value.phoneNumber;
  props.invoice.email = selectedCustomer.value.email;
  if (!props.invoice.isPos) {
    props.invoice.addressStreet = selectedCustomer.value.addressStreet;
    props.invoice.addressWard = selectedCustomer.value.addressWard;
    props.invoice.addressDistrict = selectedCustomer.value.addressDistrict;
    props.invoice.addressProvince = selectedCustomer.value.addressProvince;
    props.invoice.addressCity = selectedCustomer.value.addressCity;
    props.invoice.addressZipcode = selectedCustomer.value.addressZipcode;
  }
};

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

// Watch
watch(selectedCustomerId, () => {
  onCustomerSelect();
}, { immediate: true });

watch(() => props.invoice.paymentMethodId, () => {
  updatePaymentMethod();
}, { immediate: true });

watch(() => props.invoice.couponId, (newCouponId) => {
  const coupon = props.coupons.find(c => c.id === newCouponId);
  if (coupon) {
    // Kiểm tra điều kiện mã giảm giá (VD: minOrderValue)
    if (props.invoice.orderTotal < (coupon.discountAmount || 0)) {
      props.invoice.discount = 0;
      props.invoice.couponId = null;
      toast.add({ 
        severity: 'warn', 
        summary: 'Mã không hợp lệ', 
        detail: `Đơn hàng cần tối thiểu ${formatCurrency(coupon.discountAmount || 0).replace('₫', 'đ')} để áp dụng mã này`, 
        life: 3000 
      });
    } else {
      props.invoice.discount = coupon.discountAmount;
    }
  } else {
    props.invoice.discount = 0;
  }
  emit('update-total');
}, { immediate: true });
</script>

<style scoped>
.payment-toolbar {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 101;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 992px) {
  .payment-toolbar {
    position: static;
    box-shadow: none;
    height: auto;
  }
}
</style>