<!-- src/views/pages/auth/ProfileLayout.vue -->
<template>
  <div class="profile-layout">
    <!-- Sidebar -->
    <aside class="profile-sidebar">
      <div class="profile-username">{{ user?.username || 'Tên người dùng' }}</div>
      <button class="sidebar-edit-btn">Sửa Hồ Sơ</button>
      <nav class="profile-menu">
        <div class="profile-menu-section">Tài Khoản Của Tôi</div>
        <router-link class="profile-menu-item" to="/auth/profile" exact-active-class="active">Hồ Sơ</router-link>
        <router-link class="profile-menu-item" to="#">Ngân Hàng</router-link>
        <router-link class="profile-menu-item" to="/auth/profile/address" exact-active-class="active">Địa Chỉ</router-link>
        <router-link class="profile-menu-item" to="#">Đổi Mật Khẩu</router-link>
        <router-link class="profile-menu-item" to="#">Cài Đặt Thông Báo</router-link>
        <router-link class="profile-menu-item" to="#">Thiết Lập Riêng Tư</router-link>
        <div class="profile-menu-section mt-3"></div>
        <router-link class="profile-menu-item" to="#">Đơn Mua</router-link>
        <router-link class="profile-menu-item" to="#">Kho Voucher</router-link>

        <div class="profile-menu-sale">
          <span class="sale-badge">7.7</span>
          <span>Sale Hè Freeship</span>
          <span class="sale-new">New</span>
        </div>
      </nav>
    </aside>

    <!-- Nội dung bên phải -->
    <main class="profile-main">
      <router-view /> <!-- hiển thị tab con -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AuthService } from '../../../service/auth/AuthService'
import type { UserResponse } from '../../../service/auth/AuthService';

const user = ref<UserResponse | null>(null)

const fetchUserInfo = async () => {
  try {
    const userId = parseInt(sessionStorage.getItem('userId') || '0')
    const response = await AuthService.findByUserId(userId)
    user.value = response.data ?? null
  } catch (err) {
    console.error('Lỗi khi lấy thông tin user:', err)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
@import './styles/profile.css'; /* hoặc copy CSS từ bạn gửi vào đây */
</style>
