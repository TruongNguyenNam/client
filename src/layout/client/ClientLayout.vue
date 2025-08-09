<template>
  <div class="layout-wrapper" :key="layoutKey">
    <ClientHeader />
    <main class="main-content">
      <RouterView />
      <ChatBox></ChatBox>
    </main>
    <ClientFooter class="footer" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import ClientHeader from './ClientHeader.vue';
import ClientFooter from './ClientFooter.vue';
// import ChatBox from '../../views/pages/client/aichat/ChatBox.vue';
import ChatBox from '../../views/pages/client/aichat/ChatBox.vue';

const authStore = useAuthStore();
const layoutKey = ref(0);

const updateLayoutKey = () => {
  layoutKey.value += 1;
};

watch(() => authStore.userId, updateLayoutKey);
watch(() => authStore.wishlistCount, updateLayoutKey);
watch(() => authStore.cartCount, updateLayoutKey);

onMounted(async () => {
  if (authStore.userId) {
    await authStore.fetchWishlist();
    await authStore.fetchCart();
  }
});
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Chiều cao tối thiểu là 100% viewport */
}

.main-content {
  flex: 1; /* Phần nội dung chiếm hết phần còn lại để đẩy footer xuống dưới */
}

.footer {
  background-color: #f4f4f4; /* Cho dễ nhìn, bạn có thể bỏ */
  /* border: 1px solid red;
  margin-top: 300px; */
}
</style>