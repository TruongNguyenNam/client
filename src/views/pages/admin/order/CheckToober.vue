<template>
  <Sidebar v-model:visible="isVisible" position="right" class="payment-toolbar"
    :style="{ width: '550px', maxWidth: '100%' }" :dismissable="false" @hide="$emit('close')">
    <div class="p-4">
      <h3 class="text-xl font-semibold mb-4">{{ invoice.orderCode }}</h3>

      <!-- Chọn khách hàng -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Khách hàng <span class="text-red-600">*</span></label>
        <div class="flex items-center gap-2">
          <InputText v-model="selectedCustomerName" placeholder="Chọn khách hàng" class="flex-1" :disabled="true"
            @click="showDialog = true" :class="{ 'p-invalid': !selectedCustomer && showCustomerError }" />
          <Button icon="pi pi-plus" text severity="secondary" @click="showDialog = true" />
          <Button 
            icon="pi pi-user-minus" 
            text 
            severity="warning" 
            @click="handleCustomerSelect(null)" 
            v-if="selectedCustomer"
          />
        </div>
        <div v-if="!selectedCustomer && showCustomerError" class="text-red-600 text-sm mt-1">
          Vui lòng chọn khách hàng cho đơn ship.
        </div>
      </div>

      <CustomerDialog v-model="showDialog" @selected="handleCustomerSelect" />

      <!-- Thông tin khách hàng -->
      <div v-if="selectedCustomer" class="mb-4 bg-gray-50 rounded-lg p-5 shadow-sm">
        <div class="space-y-4">
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

          <AddressSelectDialog v-model:visible="showAddressDialog" :addresses="selectedCustomer?.addresses || []"
            :customer-id="selectedCustomer.id" @select="handleAddressSelect" @submitAddress="handleAddressSubmit"
            :key="addressDialogKey" @cancel="showAddressDialog = false" @deleteAddress="refreshSelectedCustomer" />

          <div>
            <label class="block text-sm text-gray-600 mb-2">Địa chỉ giao hàng</label>
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
              <div v-else-if="!invoice.isPos" class="mt-3">
                <Button label="Thêm địa chỉ giao hàng" icon="pi pi-plus" class="w-full"
                  @click="showAddressDialog = true" />
              </div>
            </div>
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
        <label class="block mb-1 font-medium">Phí vận chuyển <span class="text-red-600">*</span></label>
        <InputNumber 
          v-model="invoice.shippingCost" 
          @input="handleShippingCostChange" 
          class="w-full" 
          :min="0" 
          :max="50000"
          :useGrouping="true" 
          placeholder="Nhập phí vận chuyển" 
          :class="{ 'p-invalid': showShippingCostError && (invoice.shippingCost === null || invoice.shippingCost < 0) }"
        />
        <div v-if="!invoice.isPos && showShippingCostError && (invoice.shippingCost === null || invoice.shippingCost < 0)" 
          class="text-red-600 text-sm mt-1">
          Vui lòng nhập phí vận chuyển hợp lệ.
        </div>
        <div v-if="!invoice.isPos && invoice.shippingCost !== null && invoice.shippingCost > 50000" 
          class="text-red-600 text-sm mt-1">
          Phí vận chuyển không được vượt quá 50,000đ.
        </div>
      </div>

      <div v-if="!invoice.isPos" class="mb-4">
        <label class="block mb-1 font-medium">Ngày giao dự kiến</label>
        <Calendar v-model="invoice.estimatedDeliveryDate" showTime hourFormat="24" class="w-full" 
          :minDate="minDeliveryDate" :class="{ 'p-invalid': showDeliveryDateError && isPastDate }" />
        <div v-if="showDeliveryDateError && isPastDate" class="text-red-600 text-sm mt-1">
          Ngày giao dự kiến không được là ngày trong quá khứ.
        </div>
      </div>

      <!-- Tính tiền -->
      <div class="mb-4">
        <div class="flex justify-between mb-2 items-center">
          <span class="label">Tổng tiền hàng:</span>
          <span class="value font-medium">{{ formatCurrency(invoice.orderTotal).replace('₫', 'đ') }}</span>
        </div>
        <div v-if="!invoice.isPos" class="flex justify-between mb-2 items-center">
          <span class="label">Phí vận chuyển:</span>
          <span class="value font-medium">{{ formatCurrency(invoice.shippingCost || 0).replace('₫', 'đ') }}</span>
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

        <div class="mb-4">
          <label class="block mb-1 font-medium">Phương thức thanh toán</label>
          <Dropdown v-model="invoice.paymentMethodId" :options="paymentMethods" optionLabel="name" optionValue="id"
            placeholder="Chọn phương thức" class="w-full" @change="updatePaymentMethod" />
        </div>

        <div v-if="invoice.paymentMethodId === 1" class="flex justify-between mb-2 items-center">
          <span class="label">Khách thanh toán:</span>
          <InputNumber 
            v-model="invoice.paidAmount" 
            @input="handlePaidAmountChange" 
            class="value w-full md:w-80"
            :min="0" 
            :max="50000000" 
            :useGrouping="true" 
            placeholder="Nhập số tiền" 
            :class="{ 'p-invalid': showPaidAmountError && (invoice.paidAmount === null || invoice.paidAmount < calculateFinalTotal()) }"
          />
        </div>
        <div v-if="invoice.paymentMethodId === 1 && showPaidAmountError && (invoice.paidAmount === null || invoice.paidAmount < calculateFinalTotal())" 
          class="text-red-600 text-sm mt-1">
          Vui lòng nhập số tiền thanh toán đủ hoặc lớn hơn số tiền cần trả.
        </div>
        <div v-if="invoice.paymentMethodId === 1 && invoice.paidAmount !== null && invoice.paidAmount > 50000000" 
          class="text-red-600 text-sm mt-1">
          Số tiền khách thanh toán không được vượt quá 50,000,000đ.
        </div>

        <div v-if="invoice.paymentMethodId === 1 && changeAmount !== null && changeAmount >= 0"
          class="flex justify-between mb-2 items-center text-green-600">
          <span class="label">Tiền thừa:</span>
          <span class="value">{{ formatCurrency(changeAmount).replace('₫', 'đ') }}</span>
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium">Ghi chú</label>
          <Textarea v-model="invoice.notes" class="w-full" rows="4" />
        </div>

        <div v-if="invoice.paymentMethodId === 2" class="mb-4">
          <Button label="Thanh toán qua VNPay" icon="pi pi-credit-card" severity="info" :loading="isPaymentProcessing"
            @click="initiateVNPayPayment" :disabled="isPaymentProcessing" />
        </div>
      </div>

      <!-- Nút điều khiển -->
      <div v-if="invoice.paymentMethodId === 1" class="flex justify-end gap-2">
        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
        <Button label="Hoàn tất" icon="pi pi-check" severity="success" @click="completeAndPrint" />
      </div>
    </div>
    <InvoicePrint v-if="showPrintPreview" :invoice="invoice" :changeAmount="changeAmount" />
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import Sidebar from 'primevue/sidebar';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import type { CustomerResponse } from '../../../../model/admin/customer';
import type { PaymentMethodResponse } from '../../../../model/admin/paymentMethod';
import type { CouponUsageResponse } from '../../../../model/admin/couponUsage';
import type { CarrierResponse } from '../../../../model/admin/carrier';
import { CouponUsageService } from '../../../../service/admin/CouponUsageService';
import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';
import { OrderService } from '../../../../service/admin/OrderService';
import CustomerDialog from './CustomerDialog.vue';
import InvoicePrint from './InvoicePrint.vue';
import { useConfirm } from 'primevue/useconfirm';
import type { AddressResponse } from '../../../../model/admin/address';
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import { AddressService } from '../../../../service/admin/AddressService';
import AddressSelectDialog from './AddressSelectDialog.vue';
import type { OrderRequest } from '../../../../model/admin/order';

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const isVisible = ref(true);
const showDialog = ref(false);
const showPrintPreview = ref(false);
const isPaymentProcessing = ref(false);
const localCouponUsage = ref<CouponUsageResponse[]>([]);
const showCustomerError = ref(false);
const showShippingCostError = ref(false);
const showPaidAmountError = ref(false);
const showDeliveryDateError = ref(false);

const props = defineProps<{
  invoice: {
    orderCode: string;
    userId: number | null;
    customerName: string;
    phoneNumber: string;
    email: string;
    addressId: number | null;
    addressStreet: string;
    addressWard: string;
    addressDistrict: string;
    addressProvince: string;
    addressCity: string;
    addressZipcode: string;
    isPos: boolean;
    carrierId: number | null;
    shippingCost: number | null;
    estimatedDeliveryDate: Date | null;
    orderTotal: number;
    discount: number;
    couponUsageIds: number[];
    paidAmount: number | null;
    paymentMethodId: number | null;
    paymentMethod: string;
    receiverName: string;
    receiverPhone: string;
    notes: string;
    items: { id: number; name: string; price: number; quantity: number }[];
  };
  customers: CustomerResponse[];
  paymentMethods: PaymentMethodResponse[];
  couponUsage: CouponUsageResponse[];
  carriers: CarrierResponse[];
  changeAmount: number | null;
}>();

const selectedCustomerId = ref<number | null>(props.invoice.userId);
const selectedCustomerName = ref<string>(props.invoice.customerName || 'khách vãng lai');

const emit = defineEmits<{
  (e: 'update-total'): void;
  (e: 'update-change'): void;
  (e: 'close'): void;
  (e: 'complete-payment'): void;
}>();

const selectedCustomer = computed(() => {
  return props.customers.find(c => c.id === selectedCustomerId.value) || null;
});

const getCouponById = (id: number) => {
  return props.couponUsage.find(c => c.id === id) || null;
};

const minDeliveryDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
});

const isPastDate = computed(() => {
  if (!props.invoice.estimatedDeliveryDate) return false;
  const selectedDate = new Date(props.invoice.estimatedDeliveryDate);
  return selectedDate < minDeliveryDate.value;
});

const validateBeforeComplete = () => {
  showCustomerError.value = false;
  showShippingCostError.value = false;
  showPaidAmountError.value = false;
  showDeliveryDateError.value = false;

  let isValid = true;

  if (!props.invoice.isPos && !selectedCustomer.value) {
    showCustomerError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Thiếu khách hàng',
      detail: 'Đơn hàng giao hàng cần chọn khách hàng',
      life: 3000
    });
    isValid = false;
  }

  if (!props.invoice.isPos && !props.invoice.carrierId) {
    toast.add({
      severity: 'error',
      summary: 'Thiếu nhà vận chuyển',
      detail: 'Vui lòng chọn nhà vận chuyển',
      life: 3000
    });
    isValid = false;
  }

  if (!props.invoice.isPos && (props.invoice.shippingCost === null || props.invoice.shippingCost < 0)) {
    showShippingCostError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Phí vận chuyển không hợp lệ',
      detail: 'Vui lòng nhập phí vận chuyển hợp lệ',
      life: 3000
    });
    isValid = false;
  }

  if (!props.invoice.isPos && (props.invoice.shippingCost || 0) > 50000) {
    showShippingCostError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Phí vận chuyển không hợp lệ',
      detail: 'Phí vận chuyển không được vượt quá 50,000đ',
      life: 3000
    });
    isValid = false;
  }

  if (!props.invoice.isPos && isPastDate.value) {
    showDeliveryDateError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Ngày giao không hợp lệ',
      detail: 'Ngày giao dự kiến không được là ngày trong quá khứ',
      life: 3000
    });
    isValid = false;
  }

  if (!props.invoice.paymentMethodId) {
    toast.add({
      severity: 'error',
      summary: 'Thiếu phương thức thanh toán',
      detail: 'Vui lòng chọn phương thức thanh toán',
      life: 3000
    });
    isValid = false;
  }

  const required = calculateFinalTotal();
  const paid = props.invoice.paidAmount || 0;
  if (props.invoice.paymentMethodId === 1 && paid < required) {
    showPaidAmountError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Chưa thanh toán đủ',
      detail: 'Số tiền khách thanh toán phải lớn hơn hoặc bằng số tiền cần trả',
      life: 3000
    });
    isValid = false;
  }

  if (props.invoice.paymentMethodId === 1 && (props.invoice.paidAmount || 0) > 50000000) {
    showPaidAmountError.value = true;
    toast.add({
      severity: 'error',
      summary: 'Số tiền không hợp lệ',
      detail: 'Khách chỉ được thanh toán tối đa 50,000,000đ',
      life: 3000
    });
    isValid = false;
  }

  return isValid;
};

const initiateVNPayPayment = async () => {
  if (!validateBeforeComplete()) return;
  isPaymentProcessing.value = true;

  try {
    const finalTotal = calculateFinalTotal();

    const payload: OrderRequest = {
      orderCode: props.invoice.orderCode,
      userId: selectedCustomerId.value || undefined,
      addressId: props.invoice.isPos ? undefined : props.invoice.addressId ?? undefined,
      items: props.invoice.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shipments: props.invoice.isPos
        ? undefined
        : [
            {
              carrierId: props.invoice.carrierId!,
              shippingCost: props.invoice.shippingCost ?? 0,
              estimatedDeliveryDate: props.invoice.estimatedDeliveryDate!.toISOString(),
              orderItemIds: props.invoice.items.map(item => item.id),
            },
          ],
      couponUsageIds: props.invoice.couponUsageIds?.length
        ? props.invoice.couponUsageIds
        : undefined,
      payment: {
        paymentMethodId: props.invoice.paymentMethodId!,
        amount: finalTotal,
        returnUrl: `${window.location.origin}/callback`,
      },
      notes: props.invoice.notes || undefined,
    };

    const response = await OrderService.addProductToOrder(props.invoice.orderCode, payload);

    if (response && response.data && response.data.paymentUrl) {
      let invoiceTabs = JSON.parse(localStorage.getItem('invoiceTabs') || '[]');

      const customer = props.customers.find(c => c.id === selectedCustomerId.value);

      const fullInvoice = {
        ...props.invoice,
        customerName: customer?.username || props.invoice.customerName,
        phoneNumber: customer?.phoneNumber || props.invoice.phoneNumber,
        email: customer?.email || props.invoice.email
      };

      invoiceTabs = invoiceTabs.filter(
        (tab: any) => tab.orderCode !== fullInvoice.orderCode
      );
      invoiceTabs.push(fullInvoice);
      localStorage.setItem('invoiceTabs', JSON.stringify(invoiceTabs));

      window.location.href = response.data.paymentUrl;
    } else {
      throw new Error('Không nhận được URL thanh toán từ server');
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể khởi tạo thanh toán VNPay',
      life: 3000,
    });
  } finally {
    isPaymentProcessing.value = false;
  }
};

const completeAndPrint = () => {
  if (!validateBeforeComplete()) return;
  confirm.require({
    message: 'Bạn có muốn in hóa đơn không?',
    header: 'Xác nhận in hóa đơn',
    icon: 'pi pi-print',
    acceptLabel: 'Có',
    rejectLabel: 'Không',
    accept: () => {
      emit('complete-payment');
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đơn hàng đã hoàn tất',
        life: 3000
      });
      handlePrint();
    },
    reject: () => {
      emit('complete-payment');
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đơn hàng đã hoàn tất',
        life: 3000
      });
    }
  });
};

const handlePrint = () => {
  showPrintPreview.value = true;
  setTimeout(() => {
    const content = document.getElementById('print-invoice')?.innerHTML;
    if (!content) return;
    const win = window.open('', '', 'width=900,height=1000');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Hóa đơn</title>
          <style>
            body { font-family: Arial; padding: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 6px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }, 100);
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
    props.invoice.couponUsageIds = [];
    props.invoice.discount = 0;
    emit('update-total');
  }
};

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

const handleCustomerSelect = (customer: CustomerResponse | null) => {
  showDialog.value = false;
  showCustomerError.value = false;
  if (!customer) {
    selectedCustomerId.value = null;
    selectedCustomerName.value = 'khách vãng lai';
    props.invoice.userId = null;
    props.invoice.customerName = 'khách vãng lai';
    props.invoice.phoneNumber = '';
    props.invoice.email = '';
    props.invoice.addressId = null;
    props.invoice.addressStreet = '';
    props.invoice.addressWard = '';
    props.invoice.addressDistrict = '';
    props.invoice.addressProvince = '';
    props.invoice.addressCity = '';
    props.invoice.addressZipcode = '';
    props.invoice.receiverName = '';
    props.invoice.receiverPhone = '';
    selectedAddressId.value = null;
    fetchCouponUsage();
    toast.add({
      severity: 'info',
      summary: 'Hủy chọn',
      detail: 'Đã hủy chọn khách hàng.',
      life: 3000
    });
  } else {
    selectedCustomerId.value = customer.id;
    selectedCustomerName.value = customer.username;
    props.invoice.userId = customer.id;
    props.invoice.customerName = customer.username;
    props.invoice.phoneNumber = customer.phoneNumber;
    props.invoice.email = customer.email;

    const defaultAddress = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];

    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id;
      props.invoice.addressId = defaultAddress.id;
      props.invoice.addressStreet = defaultAddress.street;
      props.invoice.addressWard = defaultAddress.ward;
      props.invoice.addressDistrict = defaultAddress.district;
      props.invoice.addressProvince = defaultAddress.province;
      props.invoice.addressCity = defaultAddress.city || '';
      props.invoice.addressZipcode = defaultAddress.zipcode || '';
      props.invoice.receiverName = defaultAddress.receiverName;
      props.invoice.receiverPhone = defaultAddress.receiverPhone;
    } else {
      selectedAddressId.value = null;
      props.invoice.addressId = null;
      props.invoice.addressStreet = '';
      props.invoice.addressWard = '';
      props.invoice.addressDistrict = '';
      props.invoice.addressProvince = '';
      props.invoice.addressCity = '';
      props.invoice.addressZipcode = '';
      props.invoice.receiverName = '';
      props.invoice.receiverPhone = '';
      toast.add({
        severity: 'warn',
        summary: 'Chưa có địa chỉ',
        detail: 'Khách hàng chưa có địa chỉ giao hàng',
        life: 3000
      });
    }
    fetchCouponUsage();
  }
};

const handleAddressSelect = (address: AddressResponse) => {
  selectedAddressId.value = address.id;
  props.invoice.addressId = address.id;
  props.invoice.addressStreet = address.street;
  props.invoice.addressWard = address.ward;
  props.invoice.addressDistrict = address.district;
  props.invoice.addressProvince = address.province;
  props.invoice.addressCity = address.city || '';
  props.invoice.addressZipcode = address.zipcode || '';
  props.invoice.receiverName = address.receiverName;
  props.invoice.receiverPhone = address.receiverPhone;
  showAddressDialog.value = false;
};

const showAddressDialog = ref(false);

const provinceOptions = provincesData.data;

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
      const resAdd = await AddressService.updateAddressForCustomer(selectedCustomer.value.id, submittedData.id, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã cập nhật địa chỉ thành công.',
        life: 3000
      });
      if (resAdd.data?.id) {
        selectedAddressId.value = resAdd.data.id;
        await refreshSelectedCustomer();
        addressDialogKey.value++;
      }
      selectedAddressId.value = submittedData.id;
    } else {
      const resAdd = await CustomerService.addAddressForCustomer(selectedCustomer.value.id, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã thêm địa chỉ mới cho khách hàng.',
        life: 3000
      });
      if (resAdd.data?.id) {
        selectedAddressId.value = resAdd.data.id;
        await refreshSelectedCustomer();
        addressDialogKey.value++;
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý địa chỉ:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xử lý địa chỉ', life: 3000 });
  }
};

const selectedAddressId = ref<number | null>(null);

const selectedAddress = computed(() => {
  if (!selectedCustomer.value?.addresses) return null;
  return selectedCustomer.value.addresses.find(a => a.id === selectedAddressId.value)
    || selectedCustomer.value.addresses[0];
});

const addressDialogKey = ref(0);

const refreshSelectedCustomer = async () => {
  if (!selectedCustomer.value) return;
  try {
    const res = await CustomerService.getCustomerById(selectedCustomer.value.id);
    if (res.data) {
      Object.assign(selectedCustomer.value, res.data);
    }
  } catch (error) {
    console.error('Lỗi đồng bộ khách hàng:', error);
    toast.add({ severity: 'error', summary: 'Không thể đồng bộ khách hàng', life: 3000 });
  }
};

const updatePaymentMethod = () => {
  const method = props.paymentMethods.find(m => m.id === props.invoice.paymentMethodId);
  props.invoice.paymentMethod = method?.name || 'Tiền mặt';
  emit('update-total');
};

const calculateFinalTotal = () => {
  const shippingCost = props.invoice.isPos ? 0 : (props.invoice.shippingCost || 0);
  return props.invoice.orderTotal + shippingCost - (props.invoice.discount || 0);
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const handlePaidAmountChange = () => {
  showPaidAmountError.value = false;
  emit('update-change');
};

const handleShippingCostChange = () => {
  showShippingCostError.value = false;
  emit('update-total');
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
    const finalTotal = calculateFinalTotal();
    if (finalTotal < 0) {
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

watch(() => props.invoice.shippingCost, () => {
  handleShippingCostChange();
}, { immediate: true });

watch(() => props.invoice.estimatedDeliveryDate, () => {
  showDeliveryDateError.value = false;
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
  margin-bottom: 0.5rem;
}

.kct {
  color: #1e90ff;
}

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

:deep(.p-inputtext.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-calendar.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-inputnumber.p-invalid) .p-inputtext {
  border-color: #dc3545;
}
</style>