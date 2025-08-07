<template>
  <div class="voucher-container">
    <div class="voucher-header">
      <h2> Kho Voucher</h2>
    </div>

    <div v-if="vouchers.length === 0" class="no-voucher">
      Bạn chưa có voucher nào.
    </div>

    <div v-for="voucher in vouchers" :key="voucher.id" class="voucher-card" :class="getCouponStatus(voucher).severity">
      <div class="voucher-content">
        <!-- Logo -->
        <img src="../../../assets/data/Anh/Logo-removebg-preview.png" class="voucher-logo" alt="Logo" />

        <!-- Thông tin -->
        <div class="voucher-info">
          <div class="voucher-title">
            {{ voucher.couponName }} -
            <span class="voucher-code">({{ voucher.couponCode }})</span>
          </div>
          <div>🔻 Giảm: <strong>{{ formatAmount(voucher.couponDiscountAmount) }}</strong></div>
          <div>📅 Thời hạn: {{ formatDate(voucher.startDate) }} - {{ formatDate(voucher.expiredDate) }}</div>
          <div v-if="voucher.usedDate">🕓 Đã sử dụng: {{ formatDate(voucher.usedDate) }}</div>
          <div>
            🛈 Trạng thái:
            <span class="status-pill" :class="getCouponStatus(voucher).severity">
              {{ getCouponStatus(voucher).text }}
            </span>
          </div>
        </div>
        <!-- Nút dùng -->
        <div v-if="getCouponStatus(voucher).text === 'Hiệu lực'" class="voucher-action">
          <button class="use-button" @click="goToCart">Sử dụng</button>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AuthService } from '../../../service/auth/AuthService';
import type { CouponUserResponse } from '../../../service/auth/AuthService';
import { useAuthStore } from '../../../stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const vouchers = ref<CouponUserResponse[]>([]);
const userId = ref<number | null>(null);
const authStore = useAuthStore();

onMounted(async () => {
  const raw = sessionStorage.getItem('userInfo');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      userId.value = parsed?.userId || null;
      await fetchVouchers();
    } catch (error) {
      console.error('Lỗi khi parse userInfo:', error);
    }
  }
});


function goToCart() {
  if (userId.value) {
    router.push({ name: 'cart-view', params: { userId: userId.value } });
  } else {
    console.error('Không tìm thấy userId');
  }
}

const fetchVouchers = async () => {
  if (!userId.value) return;
  try {
    const res = await AuthService.getCouponListForUser(userId.value);
    vouchers.value = (res.data || []).sort((a, b) => {
      return getCouponStatusOrder(a) - getCouponStatusOrder(b);
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách voucher:', error);
  }
};

const getCouponStatusOrder = (coupon: CouponUserResponse) => {
  const now = new Date();
  if (!coupon.startDate || !coupon.expiredDate) return 3;

  const start = new Date(coupon.startDate);
  const end = new Date(coupon.expiredDate);

  if (start > now) return 1; // Chưa bắt đầu
  if (end < now) return 2;   // Hết hạn
  return 0;                  // Hiệu lực
};


const formatDate = (dateStr: string | null) => {
  return dateStr ? new Date(dateStr).toLocaleString('vi-VN') : '—';
};

const getCouponStatus = (coupon: CouponUserResponse) => {
  const now = new Date();

  // Nếu thiếu ngày bắt đầu hoặc hết hạn thì xem như không xác định
  if (!coupon.startDate || !coupon.expiredDate) {
    return { text: 'Không xác định', severity: 'warning' };
  }

  const start = new Date(coupon.startDate);
  const end = new Date(coupon.expiredDate);

  if (start > now) return { text: 'Chưa bắt đầu', severity: 'warning' };
  if (end < now) return { text: 'Không hiệu lực', severity: 'danger' };
  return { text: 'Hiệu lực', severity: 'success' };
};


const formatAmount = (amount: number | null) => {
  if (amount === null || amount === 0) return '0₫';
  return `${amount.toLocaleString('vi-VN')}₫`;
};
</script>

<style scoped>
.anh {
  margin: auto;
  margin-left: 20px;
  margin-right: 20px;
}

.voucher-container {
  padding: 24px;
  background-color: white;
}



.no-voucher {
  font-style: italic;
  color: #888;
  text-align: center;
  padding: 20px;
}

.voucher-card:hover {
  transform: translateY(-2px);
}

.voucher-logo {
  margin: auto;
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-left: 15px;
  margin-right: 15px;
}

.voucher-info {
  flex: 1;
  border-left: 2px solid #eee;
  padding-left: 16px;
}

.voucher-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.voucher-code {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
}

.success {
  border-left-color: #28a745 !important;
}

.success .status-pill {
  background-color: #d4edda;
  color: #155724;
}

.warning {
  border-left-color: #ffc107 !important;
}

.warning .status-pill {
  background-color: #fff3cd;
  color: #856404;
}

.danger {
  border-left-color: #dc3545 !important;
}

.danger .status-pill {
  background-color: #f8d7da;
  color: #721c24;
}


.voucher-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background-color: #fff;
  border-left: 4px solid #ee4d2d;
}

.voucher-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.voucher-header {
  margin-bottom: 4px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 20px;
}

.voucher-header h2 {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.voucher-action {
  display: flex;
  align-items: center;
  margin: auto;
}

.use-button {
  background-color: #ee4d2d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.use-button:hover {
  background-color: #d8431c;
}
</style>
