<template>
  <tr class="cart-item">
    <td class="cart-item-number">{{ index + 1 }}</td>
    <td class="cart-item-image">
      <img
        :src="item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : '/no-image.png'"
        alt="Product Image"
        class="product-image"
        width="60"
        height="60"
      />
    </td>
    <td class="cart-item-info">
      <div class="cart-item-name">{{ item.name }}</div>
      <div class="cart-item-sku" v-if="item.sku">{{ item.sku }}</div>
    </td>
    <td class="cart-item-quantity">
      <Button
        icon="pi pi-minus"
        class="p-button-text p-button-sm"
        @click="$emit('decrement')"
      />
      <input type="text" v-model="quantity" class="quantity-input" />
      <Button
        icon="pi pi-plus"
        class="p-button-text p-button-sm"
        @click="$emit('increment')"
      />
    </td>
    <td class="cart-item-price">{{ formatCurrency(item.price).replace('₫', 'đ') }}</td>
    <td class="cart-item-total">
      {{ formatCurrency(item.price * item.quantity).replace('₫', 'đ') }}
    </td>
    <td class="cart-item-action">
      <Button
        icon="pi pi-trash"
        class="p-button-text p-button-danger p-button-sm"
        @click="$emit('remove')"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['remove', 'increment', 'decrement']);

const quantity = computed({
  get: () => props.item.quantity,
  set: (value) => {
    props.item.quantity = parseInt(value) || 1;
  },
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
</script>

<style scoped>
.cart-item {
  border-bottom: 1px solid #f0f0f0;
}

.cart-item-number {
  width: 40px;
  text-align: center;
  font-weight: 500;
  color: #757575;
  padding: 12px;
}

.cart-item-image {
  width: 80px;
  padding: 12px;
}

.product-image {
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-info {
  padding: 12px;
}

.cart-item-name {
  font-weight: 500;
}

.cart-item-sku {
  font-size: 12px;
  color: #757575;
}

.cart-item-quantity {
  width: 140px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-input {
  width: 40px;
  text-align: center;
  border: none;
  background: transparent;
  font-weight: 500;
}

.cart-item-price,
.cart-item-total {
  width: 120px;
  text-align: right;
  font-weight: 500;
  padding: 12px;
}

.cart-item-total {
  font-weight: 600;
}

.cart-item-action {
  width: 60px;
  text-align: center;
  padding: 12px;
}
</style>