<template>
  <div class="flex gap-2 mb-4">
    <Button label="Bán thường" @click="$emit('set-invoice-type', true)" 
      :class="currentIsPos ? 'p-button-primary' : 'p-button-outlined'" 
      icon="pi pi-shopping-cart" />
    <Button label="Giao hàng" @click="$emit('set-invoice-type', false)" 
      :class="!currentIsPos ? 'p-button-primary' : 'p-button-outlined'" 
      icon="pi pi-truck" />
    <Button label="Tạo hoá đơn" @click="$emit('add-invoice')" 
      icon="pi pi-plus" class="p-button-success" />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

defineProps({
  currentIsPos: {
    type: Boolean,
    required: true
  }
});

defineEmits(['set-invoice-type', 'add-invoice']);
</script>
