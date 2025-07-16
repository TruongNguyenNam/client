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
            <label class="block text-sm text-gray-600 mb-2">Thông Tin Khách Hàng</label>
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
            <div>
              <label class="block text-sm text-gray-600 mb-2">Địa chỉ giao hàng</label>
              <div class="mb-3">
                <label class="block text-sm text-gray-600 mb-2">Số nhà</label>
                <InputText v-model="selectedCustomer.addressStreet" class="w-full bg-gray-100" :disabled="true"
                  placeholder="Số nhà, tên đường" />
              </div>
              <div class="flex gap-4 mb-3">
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-2">Phường / Xã</label>
                  <InputText v-model="selectedCustomer.addressWard" class="w-full bg-gray-100" :disabled="true"
                    placeholder="Phường/Xã" />
                </div>
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-2">Quận/Huyện</label>
                  <InputText v-model="selectedCustomer.addressDistrict" class="w-full bg-gray-100" :disabled="true"
                    placeholder="Quận/Huyện" />
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-2">Tỉnh/Thành phố</label>
                  <InputText v-model="selectedCustomer.addressProvince" class="w-full bg-gray-100" :disabled="true"
                    placeholder="Tỉnh/Thành phố" />
                </div>
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-2">Mã Code</label>
                  <InputText v-model="selectedCustomer.addressZipcode" class="w-full bg-gray-100" :disabled="true"
                    placeholder="Mã bưu chính" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Thông tin vận chuyển (nếu không phải POS) -->
        <div v-if="!invoice.isPos" class="mb-4">
          <label class="block mb-1 font-medium">Nhà vận chuyển</label>
          <Dropdown v-model="invoice.carrierId" :options="carriers" optionLabel="name" optionValue="id"
            placeholder="Chọn nhà vận chuyển" class="w-full" @change="handleCarrierChange" />
        </div>
        <div v-if="!invoice.isPos" class="mb-4">
          <label class="block mb-1 font-medium">Phí vận chuyển</label>
          <InputNumber v-model="invoice.shippingCost" @input="handleShippingCostChange" class="w-full"
            :min="0" :useGrouping="true" placeholder="Nhập phí vận chuyển" />
        </div>
        <div v-if="!invoice.isPos" class="mb-4">
          <label class="block mb-1 font-medium">Ngày giao dự kiến</label>
          <Calendar v-model="invoice.estimatedDeliveryDate" showTime hourFormat="24" dateFormat="yy-mm-dd"
            class="w-full" />
        </div>
  
        <!-- Tính tiền -->
        <div class="mb-4">
          <div class="flex justify-between mb-2 items-center">
            <span class="label">Tổng tiền hàng (trước giảm giá):</span>
            <span class="value font-medium">{{ formatCurrency(productTotal).replace('₫', 'đ') }}</span>
          </div>
          <div class="flex justify-between mb-2 items-center">
            <span class="label">Mã giảm giá:</span>
            <MultiSelect v-model="invoice.couponUsageIds" :options="couponUsage" optionLabel="couponCode" optionValue="id"
              placeholder="Chọn mã giảm giá" :maxSelectedLabels="3" class="value w-full md:w-80"
              @change="updateDiscount" />
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
          <div class="flex justify-between mb-2 items-center">
            <span class="label">Tổng tiền hàng (sau giảm giá):</span>
            <span class="value font-medium">{{ formatCurrency(invoice.orderTotal).replace('₫', 'đ') }}</span>
          </div>
          <div v-if="!invoice.isPos" class="flex justify-between mb-2 items-center">
            <span class="label">Phí vận chuyển:</span>
            <span class="value font-medium">{{ formatCurrency(invoice.shippingCost || 0).replace('₫', 'đ') }}</span>
          </div>
          <div class="flex justify-between mb-2 items-center font-semibold">
            <span class="label">Khách cần trả:</span>
            <span class="value kct">{{ formatCurrency(calculateFinalTotal()).replace('₫', 'đ') }}</span>
          </div>
          <div class="flex justify-between mb-2 items-center">
            <span class="label">Khách thanh toán:</span>
            <InputNumber v-model="invoice.paidAmount" @input="handlePaidAmountChange" class="value w-full md:w-80"
              :min="0" :useGrouping="true" placeholder="Nhập số tiền" :disabled="invoice.paymentMethodId === 2" />
          </div>
          <div v-if="changeAmount !== null && changeAmount >= 0 && invoice.paymentMethodId !== 2"
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
          <Button label="Hoàn tất" icon="pi pi-check" severity="success" @click="completeAndPay" :loading="isLoading" />
        </div>
      </div>
      <InvoicePrint v-if="showPrintPreview" :invoice="invoice" :changeAmount="changeAmount" />
    </Sidebar>
    <ConfirmDialog />
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
  import ConfirmDialog from 'primevue/confirmdialog';
  import type { CustomerResponse } from '../../../../model/admin/customer';
  import type { PaymentMethodResponse } from '../../../../model/admin/paymentMethod';
  import type { CouponUsageResponse } from '../../../../model/admin/couponUsage';
  import type { CarrierResponse } from '../../../../model/admin/carrier';
  import { CouponUsageService } from '../../../../service/admin/CouponUsageService';
  import { OrderService } from '../../../../service/admin/OrderService';
  import CustomerDialog from './CustomerDialog.vue';
  import InvoicePrint from './InvoicePrint.vue';
  import { useConfirm } from 'primevue/useconfirm';
  import type { OrderRequest } from '../../../../model/admin/order';
  import { useRouter } from 'vue-router';
  
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const isVisible = ref(true);
  const showDialog = ref(false);
  const showPrintPreview = ref(false);
  const isLoading = ref(false);
  const localCouponUsage = ref<CouponUsageResponse[]>([]);
  
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
      shippingCost: number | null;
      estimatedDeliveryDate: Date | null;
      orderTotal: number;
      discount: number;
      couponUsageIds: number[];
      paidAmount: number | null;
      paymentMethodId: number | null;
      paymentMethod: string;
      notes: string;
      items: { id: number; name: string; price: number; quantity: number }[];
    };
    customers: CustomerResponse[];
    paymentMethods: PaymentMethodResponse[];
    couponUsage: CouponUsageResponse[];
    carriers: CarrierResponse[];
    changeAmount: number | null;
    invoiceTimeouts?: { [key: string]: number }; // Thêm prop để quản lý timer
  }>();
  
  const selectedCustomerId = ref<number | null>(props.invoice.userId);
  const selectedCustomerName = ref<string>(props.invoice.customerName || '');
  
  const emit = defineEmits<{
    (e: 'update-total'): void;
    (e: 'update-change'): void;
    (e: 'close'): void;
    (e: 'complete-payment'): void;
  }>();
  
  const selectedCustomer = computed(() => {
    return props.customers.find(c => c.id === selectedCustomerId.value) || null;
  });
  
  const productTotal = computed(() => {
    return props.invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });
  
  const getCouponById = (id: number) => {
    return props.couponUsage.find(c => c.id === id) || null;
  };
  
  const validateBeforeComplete = () => {
    if (!props.invoice.items.length) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Đơn hàng phải có ít nhất một sản phẩm',
        life: 3000,
      });
      return false;
    }
    const required = calculateFinalTotal();
    const paid = props.invoice.paidAmount || 0;
    if (!props.invoice.isPos && !selectedCustomer.value) {
      toast.add({
        severity: 'error',
        summary: 'Thiếu khách hàng',
        detail: 'Đơn hàng giao hàng cần chọn khách hàng',
        life: 3000,
      });
      return false;
    }
    if (!props.invoice.isPos && !props.invoice.carrierId) {
      toast.add({
        severity: 'error',
        summary: 'Thiếu nhà vận chuyển',
        detail: 'Vui lòng chọn nhà vận chuyển',
        life: 3000,
      });
      return false;
    }
    if (!props.invoice.isPos && (props.invoice.shippingCost === null || props.invoice.shippingCost < 0)) {
      toast.add({
        severity: 'error',
        summary: 'Phí vận chuyển không hợp lệ',
        detail: 'Vui lòng nhập phí vận chuyển hợp lệ',
        life: 3000,
      });
      return false;
    }
    if (!props.invoice.paymentMethodId) {
      toast.add({
        severity: 'error',
        summary: 'Thiếu phương thức thanh toán',
        detail: 'Vui lòng chọn phương thức thanh toán',
        life: 3000,
      });
      return false;
    }
    if (props.invoice.paymentMethodId === 1 && paid < required) {
      toast.add({
        severity: 'error',
        summary: 'Chưa thanh toán đủ',
        detail: 'Số tiền khách thanh toán phải lớn hơn hoặc bằng số tiền cần trả',
        life: 3000,
      });
      return false;
    }
    return true;
  };
  
  const completeAndPay = async () => {
    if (!validateBeforeComplete()) return;
  
    const finalTotal = calculateFinalTotal();
    const payload: OrderRequest = {
      orderCode: props.invoice.orderCode,
      userId: selectedCustomerId.value ?? undefined,
      items: props.invoice.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shipments: props.invoice.isPos
        ? undefined
        : [
            {
              carrierId: props.invoice.carrierId ?? undefined,
              shippingCost: props.invoice.shippingCost ?? 0,
              estimatedDeliveryDate: props.invoice.estimatedDeliveryDate?.toISOString() ?? '',
              orderItemIds: props.invoice.items.map(item => item.id),
            },
          ],
      couponUsageIds: props.invoice.couponUsageIds?.length ? props.invoice.couponUsageIds : undefined,
      payment: {
        paymentMethodId: props.invoice.paymentMethodId!,
        amount: finalTotal,
        returnUrl: 'http://localhost:8080/api/vnpay/callback',
      },
      notes: props.invoice.notes || undefined,
    };
  
    console.log('📦 Payload gửi đến backend:', JSON.stringify(payload, null, 2));
  
    confirm.require({
      message:
        props.invoice.paymentMethodId === 2
          ? 'Bạn có muốn chuyển hướng đến cổng thanh toán VNPay?'
          : 'Bạn có muốn hoàn tất và in hóa đơn?',
      header:
        props.invoice.paymentMethodId === 2
          ? 'Xác nhận thanh toán VNPay'
          : 'Xác nhận hoàn tất đơn hàng',
      icon: props.invoice.paymentMethodId === 2 ? 'pi pi-credit-card' : 'pi pi-check',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: async () => {
        isLoading.value = true;
        try {
          const response = await OrderService.addProductToOrder(props.invoice.orderCode, payload);
  
          if (response.status && response.data) {
            if (props.invoice.paymentMethodId === 2 && response.data.paymentUrl) {
              // Tạm dừng timer hóa đơn khi chuyển hướng đến VNPay
              if (props.invoiceTimeouts && props.invoice.orderCode in props.invoiceTimeouts) {
                clearTimeout(props.invoiceTimeouts[props.invoice.orderCode]);
              }
              window.location.href = response.data.paymentUrl;
            } else {
              emit('complete-payment');
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã thanh toán ${formatCurrency(finalTotal).replace('₫', 'đ')}. Tiền thừa: ${formatCurrency(
                  props.changeAmount || 0,
                ).replace('₫', 'đ')}`,
                life: 5000,
              });
              handlePrint();
            }
          } else {
            toast.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: response.message || 'Không thể hoàn tất đơn hàng',
              life: 3000,
            });
          }
        } catch (error: any) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error?.response?.data?.message || 'Lỗi hệ thống khi hoàn tất đơn hàng',
            life: 3000,
          });
        } finally {
          isLoading.value = false;
        }
      },
      reject: () => {
        toast.add({
          severity: 'info',
          summary: 'Hủy',
          detail: 'Hủy hoàn tất đơn hàng',
          life: 3000,
        });
      },
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
          life: 3000,
        });
      }
    } else {
      localCouponUsage.value = [];
      props.couponUsage.splice(0, props.couponUsage.length);
    }
  };
  
  const handleCustomerSelect = (customer: CustomerResponse) => {
    selectedCustomerId.value = customer.id;
    selectedCustomerName.value = customer.username;
    showDialog.value = false;
    if (!customer) {
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
    } else {
      props.invoice.userId = customer.id;
      props.invoice.customerName = customer.username;
      props.invoice.phoneNumber = customer.phoneNumber;
      props.invoice.email = customer.email;
      if (!props.invoice.isPos) {
        props.invoice.addressStreet = customer.addressStreet;
        props.invoice.addressWard = customer.addressWard;
        props.invoice.addressDistrict = customer.addressDistrict;
        props.invoice.addressProvince = customer.addressProvince;
        props.invoice.addressCity = customer.addressCity;
        props.invoice.addressZipcode = customer.addressZipcode;
      }
    }
    fetchCouponUsage();
  };
  
  const updatePaymentMethod = () => {
    const method = props.paymentMethods.find(m => m.id === props.invoice.paymentMethodId);
    props.invoice.paymentMethod = method?.name || 'Tiền mặt';
    if (props.invoice.paymentMethodId === 2) {
      props.invoice.paidAmount = calculateFinalTotal();
    }
    emit('update-total');
  };
  
  const updateDiscount = () => {
    const coupons = props.couponUsage.filter(c => props.invoice.couponUsageIds?.includes(c.id));
    props.invoice.discount = coupons.reduce((sum, coupon) => sum + (coupon.couponDiscountAmount || 0), 0);
    const productTotalBeforeDiscount = props.invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    props.invoice.orderTotal = productTotalBeforeDiscount - props.invoice.discount;
    if (props.invoice.orderTotal < 0) {
      props.invoice.orderTotal = 0;
      props.invoice.discount = productTotalBeforeDiscount;
      props.invoice.couponUsageIds = [];
      toast.add({
        severity: 'warn',
        summary: 'Mã không hợp lệ',
        detail: `Đơn hàng cần tối thiểu ${formatCurrency(productTotalBeforeDiscount).replace('₫', 'đ')} để áp dụng mã này`,
        life: 3000,
      });
    }
    emit('update-total');
  };
  
  const calculateFinalTotal = () => {
    const shippingCost = props.invoice.isPos ? 0 : (props.invoice.shippingCost || 0);
    return props.invoice.orderTotal + shippingCost;
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };
  
  const handlePaidAmountChange = () => {
    emit('update-change');
  };
  
  const handleShippingCostChange = () => {
    emit('update-total');
    emit('update-change');
  };
  
  const handleCarrierChange = () => {
    emit('update-total');
  };
  
  watch(selectedCustomerId, async () => {
    if (selectedCustomerId.value) {
      await fetchCouponUsage();
    }
  }, { immediate: true });
  
  watch(() => props.invoice.paymentMethodId, () => {
    updatePaymentMethod();
  }, { immediate: true });
  
  watch(() => props.invoice.couponUsageIds, () => {
    updateDiscount();
  }, { immediate: true });
  
  watch(() => props.invoice.paidAmount, () => {
    handlePaidAmountChange();
  }, { immediate: true });
  
  watch(() => props.invoice.shippingCost, () => {
    handleShippingCostChange();
  }, { immediate: true });
  
  watch(() => props.invoice.carrierId, () => {
    handleCarrierChange();
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
  </style>