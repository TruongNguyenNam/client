<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import OverlayPanel from 'primevue/overlaypanel';
import Button from 'primevue/button';
import { AuthService } from '../service/auth/AuthService';
import type { UserResponse } from '../service/auth/AuthService';

const { layoutConfig, onMenuToggle } = useLayout();
const router = useRouter();

const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null);
const topbarMenuActive = ref(false);
const profileMenuRef = ref();
const isAuthenticated = ref(false);
const userInfo = ref<UserResponse | null>(null);

onMounted(async () => {
  bindOutsideClickListener();
  const storedUserInfo = sessionStorage.getItem('userInfo');
  const userId = parseInt(sessionStorage.getItem('userId') || '0');
  if (storedUserInfo && userId) {
    userInfo.value = JSON.parse(storedUserInfo);
    isAuthenticated.value = true;
  }

  if (userId && !isNaN(userId)) {
    try {
      const response = await AuthService.findByUserId(userId);
      if (response.data) {
        isAuthenticated.value = true;
        userInfo.value = response.data;
        sessionStorage.setItem('userInfo', JSON.stringify(response.data));
        sessionStorage.setItem('userId', response.data.userId.toString());
      } else {
        isAuthenticated.value = false;
        userInfo.value = null;
        sessionStorage.clear();
      }
    } catch (error) {
      isAuthenticated.value = false;
      userInfo.value = null;
      sessionStorage.clear();
    }
  }
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push('/documentation');
};

const toggleProfileMenu = (event: Event) => {
  profileMenuRef.value?.toggle(event);
};

const navigate = (path: string) => {
  router.push(path);
  profileMenuRef.value?.hide();
  topbarMenuActive.value = false;
};

const logout = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userInfo');
  isAuthenticated.value = false;
  userInfo.value = null;
  router.push('/');
  profileMenuRef.value?.hide();
  topbarMenuActive.value = false;
};

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value,
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
        profileMenuRef.value?.hide();
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
};

const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
};

const isOutsideClicked = (event: Event) => {
  if (!topbarMenuActive.value && !profileMenuRef.value?.isVisible()) return false;

  const sidebarEl = document.querySelector('.layout-topbar-menu');
  const topbarEl = document.querySelector('.layout-topbar-menu-button');
  const profileMenuEl = document.querySelector('.p-overlaypanel');

  return !(
    (sidebarEl?.isSameNode(event.target as Node) || sidebarEl?.contains(event.target as Node)) ||
    (topbarEl?.isSameNode(event.target as Node) || topbarEl?.contains(event.target as Node)) ||
    (profileMenuEl?.isSameNode(event.target as Node) || profileMenuEl?.contains(event.target as Node))
  );
};
</script>

<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img :src="logoUrl" alt="logo" />
      <span>SAKAI</span>
    </router-link>

    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-calendar"></i>
        <span>Calendar</span>
      </button>
      <button class="p-link layout-topbar-button" @click="toggleProfileMenu">
        <i class="pi pi-user"></i>
        <span>{{ userInfo?.username || 'Profile' }}</span>
      </button>
      <OverlayPanel ref="profileMenuRef" id="profile_menu">
        <div class="profile-menu">
          <div v-if="isAuthenticated" class="user-info p-2 text-center">
            <span class="font-medium">{{ userInfo?.username || 'User' }}</span>
          </div>
          <template v-if="!isAuthenticated">
            <Button label="Đăng nhập" icon="pi pi-sign-in" text @click="navigate('/auth/login')" />
            <Button label="Đăng ký" icon="pi pi-user-plus" text @click="navigate('/auth/register')" />
          </template>
          <template v-else>
            <Button
              label="Thông tin cá nhân"
              icon="pi pi-user"
              text
              @click="navigate(`/auth/userdetails/${userInfo?.userId}`)"
            />
            <Button label="Đăng xuất" icon="pi pi-sign-out" text severity="danger" @click="logout" />
          </template>
        </div>
      </OverlayPanel>
      <button @click="onSettingsClick()" class="p-link layout-topbar-button">
        <i class="pi pi-cog"></i>
        <span>Settings</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  min-width: 180px;
}

.profile-menu .p-button {
  justify-content: flex-start;
}

.user-info {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 0.5rem;
}
</style>