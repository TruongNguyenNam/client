
<!-- FILE TEST DÙNG  CÁCH LƯU  localStorage authen  -->
<template>
    <div>
          <Menubar :model="items">
              <template #start>
                  <img
                  src="../../assets/img/logo.png"
                  alt="AN Logo"
                  style="height: 50px; width: 100px; object-fit: contain"
                  />
              </template>
  
  
              <template #end>
                  <Button icon="pi pi-heart" class="pi-button-rounded pi-button-text" badge="0" />
                  <Button icon="pi pi-shopping-cart" class="pi-button-rounded pi-button-text" badge="0" />
                  <Button
                  :label="userInfo?.username || ''"
                  :icon="userInfo ? 'pi pi-user-circle' : 'pi pi-user'"
                  class="pi-button-rounded pi-button-text"
                  @click="toggleUserMenu"
                  aria-haspopup="true"
                  aria-controls="user_menu"
                  />
                  <OverlayPanel ref="userMenuRef" id="user_menu">
                      <div class="user-menu">
                          <template v-if="!isAuthenticated">
                              <Button label="Đăng ký" icon="pi pi-user-plus" text @click="navigate('/auth/register')" />
                              <Button label="Đăng nhập" icon="pi pi-sign-in" text @click="navigate('/auth/login')" />
                          </template>
                          <template v-else>
                              <div class="user-info p-2 text-center">
                                  <span class="font-medium">{{ userInfo?.username || 'User' }}</span>
                              </div>
                              <Button label="Thông tin cá nhân" icon="pi pi-key" text @click="navigate('/auth/userdetails/:id')" />
                              <Button label="Đổi mật khẩu" icon="pi pi-key" text @click="navigate('/auth/change-password')" />
                              <Button label="Đăng xuất" icon="pi pi-sign-out" text severity="danger" @click="logout" />
                          </template>
                      </div>
                  </OverlayPanel>
              </template>
          </Menubar>
      </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Menubar from 'primevue/menubar';
  import Button from 'primevue/button';
  import OverlayPanel from 'primevue/overlaypanel';
  import type { LoginInfoDto } from '../../service/auth/AuthService';
  const router = useRouter();
  const userMenuRef = ref();
  
  
  const isAuthenticated = ref(false);
  const userInfo = ref<LoginInfoDto | null>(null);
  
  onMounted(() => {
    const token = localStorage.getItem('accessToken');
    const storedUserInfo = localStorage.getItem('userInfo');
    isAuthenticated.value = !!token;
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
    }
  });
  
  
  const toggleUserMenu = (event: Event) => {
    userMenuRef.value?.toggle(event);
  };
  
  
  const navigate = (path: string) => {
    router.push(path);
    userMenuRef.value?.hide();
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    isAuthenticated.value = false;
    userInfo.value = null;
    router.push('/auth/login');
    userMenuRef.value?.hide();
  };
  
  // Menu chính load thông tin sản phẩm
  const items = ref([
    { label: 'TRANG CHỦ', icon: 'pi pi-home', command: () => router.push('/client') },
    { label: 'NEW ARRIVAL', icon: 'pi pi-star', command: () => router.push('/client/about') },
    {
      label: 'Sản Phẩm',
      icon: 'pi pi-tags',
      items: [
        { label: 'Áo Nam', command: () => router.push('/client/product') },
        { label: 'Giày', command: () => router.push({ path: '/client/product/collection', query: { category: 'Giày' } }) },
        { label: 'ÁO', command: () => router.push({ path: '/client/product/collection', query: { category: 'Áo' } }) },
        { label: 'Quần', command: () => router.push({ path: '/client/product/collection', query: { category: 'Quần' } }) },
        { label: 'Khác', command: () => router.push({ path: '/client/product/collection', query: { category: 'Khác' } }) },
        { label: 'Addidass', command: () => router.push({ path: '/client/product/collection', query: { supplier: 'Addidass' } }) },
        { label: 'Nike', command: () => router.push({ path: '/client/product/collection', query: { supplier: 'Nike' } }) },
      ]
    },
    { label: 'UP TO 50%', icon: 'pi pi-fire', command: () => router.push('/client/sale') },
    { label: 'MIX & MATCH', icon: 'pi pi-sliders-h' },
    { label: 'ICONIC', icon: 'pi pi-star' },
    { label: 'KIDS', icon: 'pi pi-users' }
  ]);
  </script>
  
  <style scoped>
  :deep(.p-menubar) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 70px;
    align-items: center;
  }
  
  :deep(.p-menuitem-text) {
    color: black;
    margin: 0 10px;
  }
  
  :deep(.p-menubar-end) {
    display: flex;
    align-items: center;
  }
  
  :deep(.p-button) {
    margin-left: 10px;
  }
  
  .user-menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    min-width: 180px;
  }
  
  .user-menu .p-button {
    justify-content: flex-start;
  }
  
  .user-info {
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 0.5rem;
  }
  </style>