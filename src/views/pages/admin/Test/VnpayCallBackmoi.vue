<template>
    <div class="callback-container">
      <h2>Xử lý thanh toán VNPay</h2>
      <p v-if="isProcessing">Đang xử lý thanh toán...</p>
      <p v-else-if="isSuccess" class="success">Thanh toán thành công! Đơn hàng {{ orderCode }} đã được hoàn tất.</p>
      <p v-else class="error">Thanh toán thất bại: {{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { VnPayService } from '../../../../service/admin/VnPayService';
  import { useToast } from 'primevue/usetoast';
  
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const isProcessing = ref(true);
  const isSuccess = ref(false);
  const orderCode = ref('');
  const errorMessage = ref('');
  
  onMounted(async () => {
    try {
      const queryParams = route.query;
      const response = await VnPayService.verifyVnpayCallback(queryParams);
      if (response.status && response.data.success) {
        isSuccess.value = true;
        orderCode.value = response.data.orderCode || '';
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Thanh toán VNPay thành công cho đơn hàng ${orderCode.value}`,
          life: 5000
        });
        emit('vnpay-callback', queryParams);
      } else {
        isSuccess.value = false;
        errorMessage.value = response.data.message || 'Thanh toán VNPay thất bại';
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: errorMessage.value,
          life: 5000
        });
      }
    } catch (error) {
      isSuccess.value = false;
      errorMessage.value = 'Lỗi hệ thống khi xử lý thanh toán VNPay';
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: errorMessage.value,
        life: 5000
      });
    } finally {
      isProcessing.value = false;
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  });
  
  const emit = defineEmits<{
    (e: 'vnpay-callback', queryParams: any): void;
  }>();
  </script>
  
  <style scoped>
  .callback-container {
    padding: 20px;
    text-align: center;
  }
  
  .success {
    color: green;
    font-weight: bold;
  }
  
  .error {
    color: red;
    font-weight: bold;
  }
  </style>