<template>
    <div>
      <h3>Xử lý kết quả thanh toán VNPay</h3>
      <p v-if="isLoading">Đang xử lý...</p>
      <p v-else-if="paymentSuccess">Thanh toán thành công! Đang chuyển về trang đơn hàng...</p>
      <p v-else>Thanh toán thất bại. Vui lòng thử lại. Lỗi: {{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import { VnPayService } from '../../../../service/admin/VnPayService';
  import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
  import { useAuthStore } from '../../../../stores/auth';
  // import type { ApiResponse } from '../../../../model/admin/apiResponse';
  import type { ProductResponse } from '../../../../model/admin/product';
  
  interface Invoice {
    orderCode: string;
    items: { id: number; quantity: number }[];
    [key: string]: any;
  }
  
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const authStore = useAuthStore();
  const isLoading = ref(true);
  const paymentSuccess = ref(false);
  const errorMessage = ref('');
  
  onMounted(async () => {
    try {
      const queryParams = route.query;
      console.log('Query params nhận được:', JSON.stringify(queryParams, null, 2));
  
      if (Object.keys(queryParams).length === 0) {
        throw new Error('Không nhận được tham số từ VNPay');
      }
  
      const response = await VnPayService.verifyVnpayCallback(queryParams);
      console.log('Phản hồi từ verifyVnpayCallback:', response);
  
      if (response.status && response.data.success) {
        paymentSuccess.value = true;
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thanh toán VNPay thành công!',
          life: 3000,
        });
  
        // Xử lý xóa hóa đơn và cập nhật tồn kho
        const orderCode = response.data.orderCode || (queryParams.vnp_TxnRef as string | undefined);
        const orderInfo = queryParams.vnp_OrderInfo
          ? (queryParams.vnp_OrderInfo as string).replace('Thanh toan don hang ', '')
          : undefined;
        if (!orderCode) {
          console.warn('Không tìm thấy orderCode trong phản hồi hoặc queryParams');
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không tìm thấy mã đơn hàng trong phản hồi VNPay',
            life: 3000,
          });
        } else {
          const storedInvoices = localStorage.getItem('invoiceTabs');
          if (storedInvoices) {
            let invoiceTabs: Invoice[] = JSON.parse(storedInvoices);
            // Thử tìm hóa đơn bằng orderCode hoặc orderInfo
            let invoice = invoiceTabs.find((tab) => tab.orderCode === orderCode);
            if (!invoice && orderInfo) {
              invoice = invoiceTabs.find((tab) => tab.orderCode === orderInfo || tab.orderCode.startsWith(orderInfo));
            }
            if (invoice) {
              // Cập nhật số lượng tồn kho
              const productsResponse = await ProductService.getAllChildProducts();
              console.log('Products response:', productsResponse);
              if (productsResponse && productsResponse.data) {
                const products = productsResponse.data;
                invoice.items.forEach((item) => {
                  const product = products.find((p: ProductResponse) => p.id === item.id);
                  if (product) {
                    product.stockQuantity = (product.stockQuantity ?? 0) - item.quantity;
                  } else {
                    console.warn(`Sản phẩm với ID ${item.id} không tìm thấy trong danh sách sản phẩm`);
                    toast.add({
                      severity: 'warn',
                      summary: 'Cảnh báo',
                      detail: `Sản phẩm với ID ${item.id} không tìm thấy`,
                      life: 3000,
                    });
                  }
                });
              } else {
                console.warn('Không lấy được danh sách sản phẩm hoặc productsResponse.data là undefined');
                toast.add({
                  severity: 'warn',
                  summary: 'Cảnh báo',
                  detail: 'Không thể cập nhật số lượng tồn kho do lỗi tải danh sách sản phẩm',
                  life: 3000,
                });
              }
              // Xóa hóa đơn
              invoiceTabs = invoiceTabs.filter((tab) => tab.orderCode !== invoice!.orderCode);
              localStorage.setItem('invoiceTabs', JSON.stringify(invoiceTabs));
            } else {
              console.warn(`Hóa đơn với orderCode ${orderCode} hoặc orderInfo ${orderInfo} không tìm thấy trong invoiceTabs`);
              toast.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: `Hóa đơn với mã ${orderCode} không tìm thấy`,
                life: 3000,
              });
            }
          } else {
            console.warn('Không tìm thấy invoiceTabs trong localStorage');
            toast.add({
              severity: 'warn',
              summary: 'Cảnh báo',
              detail: 'Không tìm thấy danh sách hóa đơn trong localStorage',
              life: 3000,
            });
          }
        }
  
        // Chuyển hướng
        setTimeout(() => {
          const targetRoute = authStore.userInfo?.role === 'ADMIN' ? '/order' : '/client';
          console.log('Chuyển hướng đến:', targetRoute, 'Role:', authStore.userInfo?.role);
          router.replace({ path: targetRoute });
        }, 2000);
      } else {
        paymentSuccess.value = false;
        errorMessage.value = response.data.message || 'Thanh toán VNPay thất bại';
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: errorMessage.value,
          life: 3000,
        });
        setTimeout(() => {
          router.replace({ path: '/client' });
        }, 2000);
      }
    } catch (error: any) {
      paymentSuccess.value = false;
      errorMessage.value = error.message || 'Lỗi hệ thống khi xử lý thanh toán VNPay';
      console.error('Lỗi trong callback:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: errorMessage.value,
        life: 3000,
      });
      setTimeout(() => {
        router.replace({ path: '/client' });
      }, 2000);
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