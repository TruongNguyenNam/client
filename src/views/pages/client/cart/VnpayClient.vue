<template>
  <div class="vnpay-callback-page">
    <div class="callback-container">
      <div v-if="loading" class="loading-spinner">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Đang xử lý thanh toán...</p>
      </div>
      <div v-else class="callback-message">
        <h2>{{ message.title }}</h2>
        <p>{{ message.content }}</p>
        <Button label="Về trang chủ" @click="goToHome" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../../../stores/auth';
import { VnPayService } from '../../../../service/admin/VnPayService';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const loading = ref<boolean>(true);
const message = ref<{ title: string; content: string }>({ title: '', content: '' });

const handleVnpayCallback = async () => {
  try {
    const queryParams = route.query;

    if (Object.keys(queryParams).length === 0) {
      throw new Error('Không nhận được tham số từ VNPay');
    }

    console.log('VNPay Query Params:', queryParams);
    const response = await VnPayService.verifyVnpayCallback(queryParams);
    console.log('VNPay Callback Response:', response.data);

    if (response.status && response.data.success) {
      message.value = {
        title: 'Thanh toán thành công',
        content: `Thanh toán thành công cho đơn hàng ${response.data.orderCode || queryParams.vnp_TxnRef}!`,
      };
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: message.value.content,
        life: 3000,
      });

      // Làm trống giỏ hàng và cập nhật trạng thái
      authStore.cart = [];
      localStorage.removeItem('cartNote');
      authStore.cartCount = 0;
      await authStore.fetchCart();
      await authStore.fetchUserInfo();
    } else {
      const errorMessage = response.data.message || getVnpayErrorMessage(queryParams.vnp_ResponseCode as string) || 'Thanh toán VNPay thất bại';
      message.value = {
        title: 'Thanh toán thất bại',
        content: errorMessage,
      };
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: errorMessage,
        life: 3000,
      });
    }
  } catch (error: any) {
    console.error('Lỗi khi xử lý phản hồi VNPay:', error);
    message.value = {
      title: 'Lỗi hệ thống',
      content: error.message || 'Lỗi hệ thống khi xử lý thanh toán VNPay',
    };
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: message.value.content,
      life: 3000,
    });
  } finally {
    loading.value = false;
    // Chuyển hướng mạnh mẽ về /client với URL sạch sau 2 giây
    setTimeout(() => {
      console.log('Current route before redirect:', window.location.href);
      window.location.replace('/#/client');
      console.log('Redirected to /client, current URL:', window.location.href);
    }, 2000);
  }
};

const getVnpayErrorMessage = (responseCode: string): string => {
  const errorMap: { [key: string]: string } = {
    '01': 'Giao dịch chưa hoàn tất hoặc bị hủy.',
    '07': 'Giao dịch bị nghi ngờ gian lận.',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ.',
    '10': 'Không xác minh được thông tin thẻ/tài khoản.',
    '11': 'Chưa qua thời gian xác minh thanh toán.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '13': 'Mã OTP không đúng.',
    '24': 'Giao dịch bị hủy bởi người dùng.',
    '51': 'Tài khoản không đủ số dư.',
    '65': 'Giao dịch vượt quá hạn mức.',
    '75': 'Ngân hàng từ chối giao dịch.',
    '79': 'Sai thông tin mật khẩu thanh toán.',
    '99': 'Lỗi không xác định.',
  };
  return errorMap[responseCode] || `Lỗi không xác định: ${responseCode}`;
};

const goToHome = () => {
  console.log('Button clicked, current URL:', window.location.href);
  window.location.replace('/#/client');
  console.log('Button redirected to /client, current URL:', window.location.href);
};

onMounted(async () => {
  console.log('Initial URL:', window.location.href);
  await handleVnpayCallback();
});
</script>

<style scoped>
.vnpay-callback-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
}

.callback-container {
  text-align: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.callback-message h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.callback-message p {
  font-size: 16px;
  color: #555;
  margin-bottom: 24px;
}
</style>