<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const stockQuantity = computed(() => props.product.stockQuantity ?? 0);

const formatCurrency = (value: number | null) => {
  return (value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const discountPercentage = computed(() => {
  if (!props.product.originalPrice || props.product.price >= props.product.originalPrice) return 0;
  return Math.round((1 - props.product.price / props.product.originalPrice) * 100);
});

const handleClick = () => {
  console.log('Click on ProductCard:', props.product.id, 'at', new Date().toISOString());
  emit('click');
};
</script>

<template>
  <div class="product-card" @click="handleClick">
    <img 
      :src="product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[0] : '/no-image.png'" 
      alt="Product Image" 
      class="product-image" 
    />
    <div class="product-name">{{ product.name }}</div>
    <div class="product-price">
      <span v-if="product.originalPrice && product.price < product.originalPrice" class="original-price">
        <del>{{ formatCurrency(product.originalPrice).replace('₫', 'đ') }}</del>
      </span>
      <span class="discounted-price">{{ formatCurrency(product.price).replace('₫', 'đ') }}</span>
      <span v-if="product.originalPrice && product.price < product.originalPrice" class="discount-percentage">
        -{{ discountPercentage }}%
      </span>
    </div>
    <div class="product-stock" :class="{ 'out-of-stock': stockQuantity === 0 }">
      {{ stockQuantity === 0 ? 'Hết hàng' : `Còn hàng: ${stockQuantity}` }}
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.product-name {
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  padding: 0 8px 8px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.original-price {
  color: red;
}

.original-price del {
  text-decoration: line-through;
}

.discounted-price {
  font-weight: 600;
  color: #e53935;
}

.discount-percentage {
  color: red;
  font-weight: bold;
  font-size: 12px;
}

.product-stock {
  padding: 4px 8px;
  font-size: 12px;
  color: #4caf50;
  background-color: #f1f8e9;
  border-top: 1px solid #e8f5e9;
}

.out-of-stock {
  color: #f44336;
  background-color: #ffebee;
  border-top: 1px solid #ffcdd2;
}
</style>