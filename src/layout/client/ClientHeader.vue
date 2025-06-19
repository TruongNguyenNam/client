<template>
  <div>
    <Menubar :model="items">
      <template #start>
        <img
          src="../../assets/img/logo.png"
          alt="ANTA Logo"
          style="height: 50px; width: 100px; object-fit: contain"
        />
      </template>

      <template #end>
        <Button icon="pi pi-user" class="p-button-rounded p-button-text" />
        <Button icon="pi pi-heart" class="p-button-rounded p-button-text" badge="0" />
        <Button icon="pi pi-shopping-cart" class="p-button-rounded p-button-text" badge="0" />
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const router = useRouter();

const items = ref([
  { label: 'TRANG CHỦ', icon: 'pi pi-home', command: () => router.push('/client') },
  { label: 'NEW ARRIVAL', icon: 'pi pi-star', command: () => router.push('/client/about') },
  // { label: 'NEW ARRIVAL', icon: 'pi pi-star', command: () => router.push('/client/home') },
  {
    label: 'NEW ARRIVAL',
    icon: 'pi pi-user',
    items: [
      { label: 'Áo Nam', command: () => router.push('/client/product') },
      { label: 'Giày', command: () => router.push({ path: '/client/product/collection', query: { category: 'Giày' } }) },
      { label: 'Dép', command: () => router.push({ path: '/client/product/collection', query: { category: 'Dép' } }) },
      { label: 'Khác', command: () => router.push({ path: '/client/product/collection', query: { category: 'Khác' } }) }
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
</style>
