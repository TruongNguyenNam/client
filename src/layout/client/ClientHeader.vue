<template>
  <Menubar :model="items">
    <template #start>
      <img src="../../assets/img/logo.png" alt="ANTA Logo" style="height: 50px" width="100px" />
    </template>
    <template #end>
      <Button icon="pi pi-user" class="p-button-rounded p-button-text" />
      <Button icon="pi pi-heart" class="p-button-rounded p-button-text" badge="0" />
      <Button icon="pi pi-shopping-cart" class="p-button-rounded p-button-text" badge="0" />
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';

const router = useRouter();
const items = ref([
  {
    label: 'TRANG CHỦ',
    icon: 'pi pi-home',
    command: () => router.push('/client')
  },
  {
    label: 'NEW ARRIVAL',
    icon: 'pi pi-star',
    command: () => router.push('/client/about')
  },
  {
    label: 'NAM',
    icon: 'pi pi-user',
    items: [
      { label: 'Áo Nam', command: () => router.push('/client/product') },
      { label: 'Quần Nam', command: () => router.push('/client/product/men/pants') }
    ]
  },
  {
    label: 'NỮ',
    icon: 'pi pi-user',
    items: [
      { label: 'Áo Nữ', command: () => router.push('/client/product/women/shirts') },
      { label: 'Quần Nữ', command: () => router.push('/client/product/women/pants') }
    ]
  },
  {
    label: 'UP TO 50%',
    icon: 'pi pi-fire',
    command: () => router.push('/client/sale')
  },
  {
    label: 'MIX & MATCH',
    icon: 'pi pi-sliders-h'
  },
  {
    label: 'ICONIC',
    icon: 'pi pi-star'
  },
  {
    label: 'KIDS',
    icon: 'pi pi-users'
  }
]);
</script>

<style scoped>
:deep(.p-menubar) {
  background: white;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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