<template>
  <div class="layout-wrapper" :key="layoutKey">
    <ClientHeader class="header" />
    <div class="flex flex-col md:flex-row  min-h-screen main-content">
      <!-- Sidebar trái -->
      <aside class="w-full aside md:w-1/4 p-4">
        <div class="tk">
          <div class="text-sm text-gray-500 font-semibold mb-2">Tài Khoản Của Tôi</div>
          <div class="font-semibold text-lg">
            <i class="pi pi-user mr-1"></i>{{ username }}
          </div>
          <router-link :to="`/auth/profile/userdetails/${userId}`" class="text-blue-600 text-sm">
            <i class="pi pi-pencil mr-1"></i> Sửa Hồ Sơ
          </router-link>
        </div>
        <ul class="space-y-3">
          <li>
            <router-link :to="`/auth/profile/userdetails/${userId}`" class="block"
              :class="isActive('/auth/profile/userdetails')">
              <i class="pi pi-id-card mr-2"></i> Hồ Sơ
            </router-link>
          </li>
          <li>
            <router-link to="/auth/profile/address" class="block" :class="isActive('/auth/profile/address')">
              <i class="pi pi-map-marker mr-2"></i> Địa Chỉ
            </router-link>
          </li>
          <li>
            <router-link to="/auth/profile/change-password" class="block"
              :class="isActive('/auth/profile/change-password')">
              <i class="pi pi-key mr-2"></i> Đổi Mật Khẩu
            </router-link>
          </li>
          <li>
            <router-link to="/auth/profile/orders" class="block" :class="isActive('/auth/profile/orders')">
              <i class="pi pi-shopping-bag mr-2"></i> Đơn Hàng
            </router-link>
          </li>
          <li>
            <router-link to="/auth/profile/vouchers" class="block" :class="isActive('/auth/profile/vouchers')">
              <i class="pi pi-ticket mr-2"></i> Kho Voucher
            </router-link>
          </li>
        </ul>

        <div class="mt-6">
          <span class="inline-block px-2 py-1 text-xs bg-red-500 text-white rounded-full mr-2">7.7</span>
          <span class="text-sm font-medium">Sale Hè Freeship</span>
          <span class="text-xs text-red-500 font-semibold ml-1">New</span>
        </div>
      </aside>

      <!-- Nội dung bên phải -->
      <main>
        <router-view class="main-router" />
      </main>
    </div>
    <ClientFooter class="footer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ClientHeader from './ClientHeader.vue'
import ClientFooter from './ClientFooter.vue'
import type { UserResponse } from '../../service/auth/AuthService'

const route = useRoute()
const userInfo = ref<UserResponse | null>(null)

onMounted(() => {
  const raw = sessionStorage.getItem('userInfo')
  if (raw) {
    userInfo.value = JSON.parse(raw)
  }
})

const username = computed(() => userInfo.value?.username || 'Khách hàng')
const userId = computed(() => userInfo.value?.userId)
const layoutKey = computed(() => route.fullPath)

const isActive = (path: string): string => {
  return route.path === path
    ? 'text-red-500 font-semibold'
    : 'text-gray-700 hover:text-red-500'
}

console.log('User Info:', userInfo.value)

</script>
<style scoped>
.aside {
  background-color: whitesmoke;
}

.header {
  padding-bottom: 50px;

  background-color: blue;
}

.tk {
  width: 100%;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.layout-wrapper {
  background-color: #2196f3;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-router {
  width: auto;
  height: 100%;

  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

main {
  flex: 1;
  margin: 24px 24px 0px 0px;
  min-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Main content wrapper - padding top để lùi xuống dưới header */
.main-content {
  background-color: whitesmoke;
  padding-top: 20px;
  flex: 1;
}

/* Sidebar trái */
aside {

  border-right: 1px solid #eaeaea;
  margin: 24px 0 24px 24px;
  min-width: 240px;
  max-width: 265px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
}

/* Avatar + tên */
aside .mb-6 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 32px 32px 8px 32px;
  border-bottom: 1px solid #f5f6fa;
  width: 100%;
}

aside .font-semibold.text-lg {
  font-size: 1.15rem;
  color: #222;
  margin-bottom: 2px;
}

aside .text-blue-600 {
  color: #2196f3;
  font-size: 0.98rem;
  cursor: pointer;
  margin-top: 2px;
}

.text-sm {
  font-size: 0.98rem;
}

.text-gray-500 {
  color: #b0b4b9;
}

.font-semibold {
  font-weight: 600;
}

/* Menu sidebar */
ul {
  margin: 25px 0 0 0;
  padding: 0 0 0 32px;
  list-style: none;
  width: 100%;
}

.space-y-3>li:not(:last-child) {
  margin-bottom: 8px;
}

li .block {
  padding: 2px 0 2px 0;
  font-size: 1.08rem;
  transition: background 0.18s;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
}

li .text-red-500 {
  color: #ee4d2d !important;
}

li .font-semibold {
  font-weight: 600;
}

li .text-gray-700 {
  color: #555;
}

li .hover\:text-red-500:hover {
  color: #ee4d2d;
}

li .router-link-active,
li .text-red-500.font-semibold {
  background: #fff6f1;
}

li .block.router-link-active {
  font-weight: 600;
  color: #ee4d2d !important;
  background: #fff6f1;
  border-radius: 5px;
}

/* Sidebar các mục icon */
li .icon {
  margin-right: 8px;
  vertical-align: middle;
}

li .font-medium {
  font-weight: 500;
}

/* Promo tag */
aside .mt-6 {
  margin: 32px 0 0 32px;
  font-size: 0.96rem;
  color: #ee4d2d;
  display: flex;
  align-items: center;
  gap: 6px;
}

aside .inline-block {
  font-size: 0.85rem;
  font-weight: 700;
  background: #ee4d2d;
  color: #fff;
  border-radius: 12px;
  padding: 2px 8px;
}

aside .rounded-full {
  border-radius: 9999px;
}

aside .text-xs {
  font-size: 0.82rem;
}

aside .mr-2 {
  margin-right: 7px;
}

aside .ml-1 {
  margin-left: 5px;
}

/* Main content phải */

@media (max-width: 1024px) {
  aside {
    min-width: 100vw;
    max-width: 100vw;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  ul,
  .mt-6,
  .mb-6 {
    padding-left: 16px !important;
  }

  main {
    margin: 0;
    border-radius: 0;
    padding: 18px 8px;
    min-height: auto;
    box-shadow: none;
  }
}

/* Nút Lưu */
button,
.btn-save {
  background-color: #ee4d2d;
  color: #fff;
  border: none;
  padding: 9px 40px;
  border-radius: 3px;
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 17px;
  transition: background 0.2s;
  outline: none;
}

button:hover,
.btn-save:hover {
  background-color: #d1371b;
}

/* Các nhóm thông tin form */
.profile-form-group {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
}

.profile-form-label {
  width: 140px;
  color: #444;
  font-weight: 500;
}

.profile-form-value {
  flex: 1;
  color: #222;
}

/* Avatar chọn ảnh */
.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}

.profile-avatar img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 50%;
  border: 1.5px solid #eee;
  margin-bottom: 14px;
  background: #f7f7f7;
}

.profile-avatar button {
  margin-bottom: 6px;
}

/* Chú thích dưới avatar */
.profile-avatar-desc {
  font-size: 0.92rem;
  color: #b0b4b9;
  text-align: center;
  margin-top: 2px;
}

/* Footer */
.footer {
  background: #fff;
  border-top: 1px solid #eef0f2;
  padding: 16px 0;
  text-align: center;
  margin-top: 0;
}

/* Chat box góc phải */
#chat-widget,
.chat-box {
  position: fixed;
  right: 36px;
  bottom: 24px;
  z-index: 999;
}
</style>