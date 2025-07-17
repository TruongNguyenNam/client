<script setup lang="ts">
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import ProductCard from './ProductCard.vue';
import type { ProductResponse } from '../../../../model/admin/product';

const props = defineProps({
  products: {
    type: Array as () => ProductResponse[],
    required: true
  },
  selectedInvoice: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['add-product']);

const searchQuery = ref('');

const filteredProducts = computed(() => {
  if (!searchQuery.value) return props.products;
  const query = searchQuery.value.toLowerCase();
  return props.products.filter(product => 
    product.name.toLowerCase().includes(query)
  );
});

const handleAddProduct = (product: ProductResponse) => {
  console.log('Emitting add-product for:', product.id, 'at', new Date().toISOString());
  emit('add-product', product);
};
</script>

<template>
  <div class="product-section">
    <!-- Thanh tìm kiếm -->
    <div class="search-box mb-4" v-if="!selectedInvoice">
      <InputText v-model="searchQuery" placeholder="Tìm kiếm sản phẩm..." class="w-full" />
    </div>

    <!-- Danh sách sản phẩm -->
    <div class="products-grid" :class="{ 'products-grid-hidden': selectedInvoice }">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @click="handleAddProduct(product)"
      />
    </div>

    <slot></slot>
  </div>
</template>

<style scoped>
.product-section {
  position: fixed;
  right: 0;
  top: 95px;
  width: 30%;
  height: calc(100vh - 95px);
  background-color: #f8f8f8;
  padding: 20px;
  overflow-y: auto;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.search-box {
  padding: 10px 0;
}

.products-grid-hidden {
  display: none;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
  padding-bottom: 60px;
}

@media (max-width: 992px) {
  .product-section {
    position: static;
    width: 100%;
    height: auto;
    box-shadow: none;
  }
}
</style>