<template>
  <div>
    <h3 v-show="!isPrinting">Xử lý kết quả thanh toán VNPay</h3>
    <p v-if="isLoading">Đang xử lý...</p>
    <p v-else-if="paymentSuccess">Thanh toán thành công! Đang chuyển về trang đơn hàng...</p>
    <p v-else>Thanh toán thất bại. Vui lòng thử lại. Lỗi: {{ errorMessage }}</p>
  </div>

  <div id="print-section">
    <InvoicePrint v-if="invoiceData" :invoice="invoiceData" :changeAmount="null" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { VnPayService } from '../../../../service/admin/VnPayService';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import { useAuthStore } from '../../../../stores/auth';
import type { ProductResponse } from '../../../../model/admin/product';
import InvoicePrint from './InvoicePrint.vue';

interface Invoice {
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
  items: { name: string; price: number; quantity: number; id: number }[];
}

const showInvoice = ref(false);
const invoiceData = ref<Invoice | null>(null);
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const isLoading = ref(true);
const paymentSuccess = ref(false);
const errorMessage = ref('');
const isPrinting = ref(false);

onMounted(async () => {
  try {
    const queryParams = route.query;

    if (Object.keys(queryParams).length === 0) throw new Error('Không nhận được tham số từ VNPay');

    const response = await VnPayService.verifyVnpayCallback(queryParams);

    if (response.status && response.data.success) {
      paymentSuccess.value = true;
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thanh toán VNPay thành công!', life: 3000 });

      const orderCode = response.data.orderCode || (queryParams.vnp_TxnRef as string | undefined);
      const orderInfo = queryParams.vnp_OrderInfo
        ? (queryParams.vnp_OrderInfo as string).replace('Thanh toan don hang ', '')
        : undefined;

      if (orderCode) {
        const storedInvoices = localStorage.getItem('invoiceTabs');
        if (storedInvoices) {
          let invoiceTabs: Invoice[] = JSON.parse(storedInvoices);
          let invoice = invoiceTabs.find((tab) => tab.orderCode === orderCode) 
            || (orderInfo && invoiceTabs.find((tab) => tab.orderCode.startsWith(orderInfo)));

          if (invoice) {
            invoiceData.value = invoice;
            console.log('🧾 Invoice to print:', invoice);

            showInvoice.value = true;

            setTimeout(() => {
              isPrinting.value = true;
              window.print();
              isPrinting.value = false;
            }, 500);

            // Cập nhật tồn kho
            const productsResponse = await ProductService.getAllChildProducts();
            if (productsResponse?.data) {
              const products = productsResponse.data;
              invoice.items.forEach((item) => {
                const product = products.find((p: ProductResponse) => p.id === item.id);
                if (product) {
                  product.stockQuantity = (product.stockQuantity ?? 0) - item.quantity;
                }
              });
            }

            // Xoá hóa đơn
            invoiceTabs = invoiceTabs.filter((tab) => tab.orderCode !== invoice.orderCode);
            localStorage.setItem('invoiceTabs', JSON.stringify(invoiceTabs));
          }
        }
      }

      setTimeout(() => {
        const targetRoute = authStore.userInfo?.role === 'ADMIN' ? '/order' : '/client';
        router.replace({ path: targetRoute });
      }, 2000);
    } else {
      paymentSuccess.value = false;
      errorMessage.value = response.data.message || 'Thanh toán VNPay thất bại';
      toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
      setTimeout(() => router.replace({ path: '/client' }), 2000);
    }
  } catch (error: any) {
    paymentSuccess.value = false;
    errorMessage.value = error.message || 'Lỗi hệ thống khi xử lý thanh toán VNPay';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
    setTimeout(() => router.replace({ path: '/client' }), 2000);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
div {
  text-align: center;
  padding: 50px;
}

</style>
<style>
@media print {
  body * {
    visibility: hidden !important;
  }

  #print-section, #print-section * {
    visibility: visible !important;
  }

  #print-section {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    padding: 0 !important;
  }

  .p-toast, .settings-button, .not-print {
    display: none !important;
  }
  #print-invoice table, #print-invoice th, #print-invoice td {
  border: 1px solid black;
  border-collapse: collapse;
}
}

</style>