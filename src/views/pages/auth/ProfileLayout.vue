<template>
  <div class="flex flex-col md:flex-row bg-white min-h-screen">
    <!-- Sidebar trái -->
    <aside class="w-full md:w-1/4 border-r border-gray-200 p-4">
      <div class="mb-6">
        <div class="font-semibold text-lg">{{ username }}</div>
        <router-link to="/auth/profile/info" class="text-blue-600 text-sm hover:underline">
          Sửa Hồ Sơ
        </router-link>
      </div>

      <div class="text-sm text-gray-500 font-semibold mb-2">Tài Khoản Của Tôi</div>

      <ul class="space-y-3">
        <li>
          <router-link
            to="/auth/profile/info"
            class="block"
            :class="isActive('/auth/profile/info')"
          >
            Hồ Sơ
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/bank"
            class="block"
            :class="isActive('/auth/profile/bank')"
          >
            Ngân Hàng
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/address"
            class="block"
            :class="isActive('/auth/profile/address')"
          >
            Địa Chỉ
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/change-password"
            class="block"
            :class="isActive('/auth/profile/change-password')"
          >
            Đổi Mật Khẩu
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/notifications"
            class="block"
            :class="isActive('/auth/profile/notifications')"
          >
            Cài Đặt Thông Báo
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/privacy"
            class="block"
            :class="isActive('/auth/profile/privacy')"
          >
            Những Thiết Lập Riêng Tư
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/orders"
            class="block"
            :class="isActive('/auth/profile/orders')"
          >
            Đơn Mua
          </router-link>
        </li>
        <li>
          <router-link
            to="/auth/profile/vouchers"
            class="block"
            :class="isActive('/auth/profile/vouchers')"
          >
            Kho Voucher
          </router-link>
        </li>
      </ul>

      <!-- Promo Tag -->
      <div class="mt-6">
        <span class="inline-block px-2 py-1 text-xs bg-red-500 text-white rounded-full mr-2">7.7</span>
        <span class="text-sm font-medium">Sale Hè Freeship</span>
        <span class="text-xs text-red-500 font-semibold ml-1">New</span>
      </div>
    </aside>

    <!-- Nội dung bên phải -->
    <main class="w-full md:w-3/4 p-6 bg-gray-50">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const username = 'HabetCustomer1' // sau này bạn có thể lấy từ Vuex hoặc API

// Hàm kiểm tra trang đang active để highlight
const isActive = (path) => {
  return route.path === path
    ? 'text-red-500 font-semibold'
    : 'text-gray-700 hover:text-red-500'
}
</script>
