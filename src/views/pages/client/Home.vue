<template>
  <Banner /><br>
  <section class="products py-10 bg-gray-100">
    <div class="container mx-auto max-w-screen-lg px-0">
      <h2 class="text-3xl font-bold mb-10 text-center text-gray-800">Sản phẩm nổi bật</h2>
      <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
        Đang tải dữ liệu...
      </div>
      <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
        {{ errorMessage }}
        <button @click="fetchProducts" class="ml-2 text-blue-500 underline">Thử lại</button>
      </div>
      <div v-else class="grid grid-cols-4 gap-4">
        <div v-for="product in products" :key="product.id" class="product-card  rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-2">
          <!-- Product Image -->
          <div class="product-image relative">
            <img :src="getFirstImage(product.imageUrl)" alt="Product" class="product-img" />
            <div v-if="product.isOnSale" class="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
              Sale!
            </div>
          </div>
          <!-- Product Name and Category -->
          <div class="product-info mt-4 text-center">
            <h3 class="text-sm text-gray-600 uppercase">{{ product.categoryName }}</h3>
            <p class="text-lg font-semibold text-gray-800 mt-1">{{ product.name }}</p>
            <!-- Price -->
            <div class="mt-2">
              <p class="text-gray-500 line-through" v-if="product.originalPrice">
                {{ formatCurrency(product.originalPrice) }}
              </p>
              <p class="text-red-600 font-bold text-xl">
                {{ formatCurrency(product.price) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductClientService } from '../../../service/client/ProductClientService'; // Đường dẫn tới service
import type { ProductResponseClient } from '../../../model/client/product';
import Banner from './Banner.vue';

// State variables
const products = ref<ProductResponseClient[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

// Fetch products from API
const fetchProducts = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await ProductClientService.getAllChildProducts(); // Thay thế bằng logic API từ service
    if (response.status === 200 && response.data) {
      products.value = response.data; // Lưu dữ liệu sản phẩm
    } else {
      errorMessage.value = response.message || 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProducts);

// Format currency
const formatCurrency = (value: number | null): string => {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
};

// Get the first image from the image list
const getFirstImage = (images: string[]): string => {
  return images?.length > 0 ? images[0] : 'https://via.placeholder.com/300x200';
};
</script>

<style scoped>
/* Container Styling */
.container {
  background-color: aliceblue;
  max-width: 100%; /* Đảm bảo container sử dụng toàn bộ chiều rộng */
  margin: 0 auto; /* Căn giữa container */
  padding: 0 2rem;
}

/* Grid Styling */
.grid {
  display: grid; /* Sử dụng CSS Grid */
  grid-template-columns: repeat(4, 1fr); /* Tạo 4 cột với kích thước bằng nhau */
  gap: 1rem; /* Khoảng cách giữa các phần tử */
  justify-content: center; /* Căn giữa các item trong grid */
  padding: 0 4rem; /* Thêm khoảng cách hai bên lưới */
}

/* Product Card Styling */
.product-card {
  margin-top: 3rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
}

/* Product Image Styling */
.product-image {
  background-color: white;
  position: relative;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 200px; /* Đảm bảo hình ảnh lớn hơn để giống mẫu */
  object-fit: cover; /* Hiển thị hình ảnh đầy đủ */
  background-color: #f3f3f3; /* Màu nền khi ảnh nhỏ */
}

/* Sale Badge */
.product-image .absolute {
  font-size: 0.875rem;
  font-weight: bold;
}

/* Product Info Styling */
.product-info h3 {
  font-size: 0.875rem;
  color: #666;
}

.product-info p {
  font-size: 1rem;
  margin: 0.5rem 0;
}

/* Price Styling */
.product-info .line-through {
  font-size: 0.875rem;
  color: #999; 
}

.product-info .text-red-600 {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
