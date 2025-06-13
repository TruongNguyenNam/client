<template>
  <div class="header">
    <div class="p-4 bg-white min-h-screen">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Danh sách sản phẩm</h2>

      <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
        Đang tải dữ liệu...
      </div>

      <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
        {{ errorMessage }} <button @click="retryFetch" class="ml-2 text-blue-500 underline">Thử lại</button>
      </div>

      <div v-else-if="products.length === 0" class="text-center text-gray-500 py-10">
        Không có sản phẩm nào để hiển thị.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex flex-col items-center text-center bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-lg transition-shadow container"
        >
          <div class="product-image">
            <img
              :src="getFirstImage(product.imageUrl)"
              alt="product image"
              @error="onImageError"
              class="image"
            />
            <div
              v-if="imageError"
              class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
            >
              Ảnh không tải được
            </div>
          </div>

          <div class="content px-3 py-2">
            <p class="text-sm text-gray-600 line-clamp-2">{{ product.name || 'Tên sản phẩm không có' }}</p>
            <div class="mt-2 flex flex-col items-center">
              <span class="text-gray-500 line-through text-sm">{{ formatCurrency(product.originalPrice) }}</span>
              <span class="text-red-600 font-bold text-lg">{{ formatCurrency(product.price ?? 0) }}</span>
              <span
                v-if="product.originalPrice && product.price !== null && product.price < product.originalPrice"
                class="text-green-600 text-xs"
              >
                -{{ getDiscountPercentage(product) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-white min-h-screen" style="border: 1px solid red;">
        <video src="https://youtu.be/ZIAZcULuNaQ" controls></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductClientService } from '../../../service/client/ProductClientService';
import type { ProductResponse } from '../../../model/product';

const products = ref<ProductResponse[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const imageError = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await ProductClientService.getAllChildProducts();
    if (response.status === 200 && response.data) {
      products.value = response.data;
    } else {
      errorMessage.value = response.message || 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const retryFetch = () => {
  fetchData();
};

function formatCurrency(value: number | null): string {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
}

function getFirstImage(images: string[]): string {
  return images?.length > 0 ? images[0] : 'https://via.placeholder.com/300x200';
}

function getDiscountPercentage(product: ProductResponse): number {
  const { originalPrice, price } = product;
  if (
    originalPrice === undefined ||
    originalPrice === null ||
    price === undefined ||
    price === null ||
    price >= originalPrice
  ) return 0;

  return Math.round((1 - price / originalPrice) * 100);
}

function onImageError() {
  imageError.value = true;
}
</script>

<style scoped>
.header {
  width: 100%;
  max-width: 1350px;
  margin: 20px auto;
  border: 1px solid blue;
}

.container {
  width: 100%;
  max-width: 300px;
  height: 100%;
  min-height: 300px;
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image {
  width: 100%;
  height: 200px;
  border: 1px solid blue;
  overflow: hidden;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .text-2xl {
    font-size: 1.5rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
