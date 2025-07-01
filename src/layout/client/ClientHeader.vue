<template>
  <div>
    <Menubar :model="items" :key="headerKey">
      <template #start>
        <img
          src="../../assets/img/logo.png"
          alt="AN Logo"
          style="height: 50px; width: 100px; object-fit: contain"
        />
      </template>
      <template #end>
        <RouterLink v-if="userId" :to="{ name: 'client-wishlist-details', params: { userId: userId } }">
          <Button
            icon="pi pi-heart"
            class="p-button-rounded p-button-text"
            :badge="wishlistCount.toString()"
          />
        </RouterLink>
        <Button v-else icon="pi pi-heart" class="p-button-rounded p-button-text" @click="navigate('/auth/login')" />
        <RouterLink v-if="userId" :to="{ name: 'cart-view', params: { userId: userId } }">
          <Button
            icon="pi pi-shopping-cart"
            class="p-button-rounded p-button-text"
            :badge="cartCount.toString()"
          />
        </RouterLink>
        <Button v-else icon="pi pi-shopping-cart" class="p-button-rounded p-button-text" @click="navigate('/auth/login')" />
        <Button
          :label="userInfo?.username || ''"
          :icon="userInfo ? 'pi pi-user-circle' : 'pi pi-user'"
          class="p-button-rounded p-button-text"
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
              <Button
                label="Thông tin cá nhân"
                icon="pi pi-user"
                text
                @click="navigate(`/auth/userdetails/${userInfo?.userId}`)"
              />
              <Button
                label="Đổi mật khẩu"
                icon="pi pi-key"
                text
                @click="navigate('/auth/change-password')"
              />
              <Button
                label="Đăng xuất"
                icon="pi pi-sign-out"
                text
                severity="danger"
                @click="logout"
              />
            </template>
          </div>
        </OverlayPanel>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
import { AuthService } from '../../service/auth/AuthService';
import type { UserResponse } from '../../service/auth/AuthService';
import { useAuthStore } from '../../stores/auth';
import { RouterLink } from 'vue-router';

const router = useRouter();
const userMenuRef = ref();
const authStore = useAuthStore();
const isAuthenticated = ref(false);
const userInfo = ref<UserResponse | null>(null);
const wishlistCount = computed(() => authStore.wishlistCount || 0);
const cartCount = computed(() => {
  console.log('Cart count accessed:', authStore.cartCount); // Log để kiểm tra
  return authStore.cartCount || 0;
});
const userId = computed(() => authStore.userId);
const headerKey = ref(0);

onMounted(async () => {
  const storedUserId = sessionStorage.getItem('userId');
  const storedUserInfo = sessionStorage.getItem('userInfo');

  if (storedUserId && storedUserInfo) {
    const userIdNum = parseInt(storedUserId);
    if (!isNaN(userIdNum)) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo) as UserResponse;
        userInfo.value = parsedUserInfo;
        isAuthenticated.value = true;
        authStore.setUser(userIdNum, parsedUserInfo);
        await Promise.all([authStore.fetchWishlist(), authStore.fetchCart()]);
        updateHeaderKey();
        return;
      } catch (error) {
        console.error('Lỗi khi phân tích thông tin người dùng từ session:', error);
      }
    }
  }

  if (storedUserId) {
    const userIdNum = parseInt(storedUserId);
    if (!isNaN(userIdNum)) {
      try {
        const response = await AuthService.findByUserId(userIdNum);
        if (response.data) {
          userInfo.value = response.data;
          isAuthenticated.value = true;
          authStore.setUser(userIdNum, response.data);
          sessionStorage.setItem('userInfo', JSON.stringify(response.data));
          sessionStorage.setItem('userId', response.data.userId.toString());
          await Promise.all([authStore.fetchWishlist(), authStore.fetchCart()]);
          updateHeaderKey();
        } else {
          clearSession();
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        clearSession();
      }
    } else {
      clearSession();
    }
  } else {
    clearSession();
  }
});

const clearSession = () => {
  isAuthenticated.value = false;
  userInfo.value = null;
  sessionStorage.clear();
  authStore.clearUser();
};

const updateHeaderKey = () => {
  console.log('Header key updated, cartCount:', authStore.cartCount); // Log để kiểm tra
  headerKey.value += 1; // Buộc render lại Menubar
};

watch(() => authStore.cartCount, () => {
  console.log('Watch triggered for cartCount:', authStore.cartCount); // Log để kiểm tra
  updateHeaderKey();
});
watch(() => authStore.wishlistCount, updateHeaderKey);
watch(() => authStore.userId, updateHeaderKey);

const toggleUserMenu = (event: Event) => {
  userMenuRef.value?.toggle(event);
};

const navigate = (path: string) => {
  router.push(path);
  userMenuRef.value?.hide();
};

const logout = () => {
  sessionStorage.clear();
  isAuthenticated.value = false;
  userInfo.value = null;
  authStore.clearUser();
  router.push('/client');
  userMenuRef.value?.hide();
};

const items = computed(() => {
  const baseItems = [
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
      ],
    },
    { label: 'UP TO 50%', icon: 'pi pi-fire', command: () => router.push('/client/sale') },
  ];

  if (userInfo.value?.role === 'ADMIN') {
    return [];
  } else if (userInfo.value?.role === 'CUSTOMER') {
    return [
      ...baseItems,
      { label: 'MIX & MATCH', icon: 'pi pi-sliders-h', command: () => router.push('/client/mix-match') },
      { label: 'ICONIC', icon: 'pi pi-star', command: () => router.push('/client/iconic') },
      { label: 'KIDS', icon: 'pi pi-users', command: () => router.push('/client/kids') },
    ];
  }
  return baseItems;
});
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
  padding: 1rem;
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