<template>
  <div>
    <p v-if="isLoading">Đang tải...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!products.length">Không có sản phẩm nào.</p>
    <div v-else v-for="p in products" :key="p.id">
      <h1>{{ p.id }}</h1>
      <h1>{{ p.name }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductClientService } from '../../../../service/client/ProductClientService';
import type { ProductResponseClient } from '../../../../model/client/product';
import { useRouter, useRoute } from 'vue-router';

const products = ref<ProductResponseClient[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const router = useRouter();
const route = useRoute();

const fetchData = async (name: string) => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await ProductClientService.findByCategoryName(name);
    console.log('API Response:', response); // Debug
    if (response.status === 200 && response.data) {
      products.value = response.data; // Sử dụng response.data
      console.log('Products:', products.value); // Debug
    } else {
      errorMessage.value = response.message || 'Dữ liệu trả về không hợp lệ.';
    }
  } catch (error) {
    console.error('Fetch Error:', error); // Debug
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const categoryName = route.query.category as string;
  console.log('Category Name:', categoryName); // Debug
  if (categoryName) {
    fetchData(categoryName);
  } else {
    errorMessage.value = 'Không có danh mục được chọn.';
    isLoading.value = false;
  }
});
</script>

<style scoped>
</style>