<template>
  <div class="header">
    <div class="p-4 bg-white min-h-screen">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Danh sách sản phẩm</h2>

      <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
        Đang tải dữ liệu...
      </div>

      <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
        {{ errorMessage }}
        <button @click="retryFetch" class="ml-2 text-blue-500 underline">Thử lại</button>
      </div>

      <div v-else-if="groupedProducts.length === 0" class="text-center text-gray-500 py-10">
        Không có sản phẩm nào để hiển thị.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="group in groupedProducts"
          :key="group.parentProductId ?? 'no-parent'"
          class="product-card"
          @click="goToDetails(group.parentProductId)"
        >
          <div class="product-image relative">
            <img
              :src="getFirstImage(group.products[0].imageUrl)"
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
            <div class="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE<br />up to 50%
            </div>
            <div class="absolute top-2 right-2 flex space-x-2">
              <button class="bg-white p-1 rounded-full shadow">
                <i class="pi pi-shopping-cart text-gray-700"></i>
              </button>
              <button class="bg-white p-1 rounded-full shadow">
                <i class="pi pi-eye text-gray-700"></i>
              </button>
            </div>
          </div>

          <div class="content px-3 py-2 text-left">
            <p class="text-lg text-gray-600 line-clamp-2">Sản Phẩm: {{ getBrandName(group.products[0].name) }}</p>

            <div class="mt-2">
              <span class="text-gray-500 line-through text-base block">{{ formatCurrency(group.products[0].originalPrice) }}</span>
              <span class="text-red-600 font-bold text-base block">{{ formatCurrency(group.products[0].price ?? 0) }}</span>
              <span
                v-if="group.products[0].originalPrice && group.products[0].price !== null && group.products[0].price < group.products[0].originalPrice"
                class="text-white text-base bg-red-500 px-2 py-0.5 rounded inline-block mt-1"
              >
                -{{ getDiscountPercentage(group.products[0]) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ProductClientService } from '../../../../service/client/ProductClientService';
import type { ProductResponseClient } from '../../../../model/client/product';
import { useRouter } from 'vue-router';

const products = ref<ProductResponseClient[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const imageError = ref(false);
const router = useRouter();

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

const groupedProducts = computed(() => {
  const groups: { parentProductId: number | null; products: ProductResponseClient[] }[] = [];
  const seenParentIds = new Set<number | null>();

  products.value.forEach(product => {
    if (!seenParentIds.has(product.parentProductId)) {
      seenParentIds.add(product.parentProductId);
      groups.push({
        parentProductId: product.parentProductId,
        products: products.value.filter(p => p.parentProductId === product.parentProductId)
      });
    }
  });

  return groups;
});

function formatCurrency(value: number | null): string {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
}

function getFirstImage(images: string[]): string {
  return images?.length > 0 ? images[0] : 'https://via.placeholder.com/300x200';
}

function getDiscountPercentage(product: ProductResponseClient): number {
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

function getBrandName(name: string): string {
  return name.split(' - ')[0]; // Trích xuất "nike" hoặc "addidas"
}

function onImageError() {
  imageError.value = true;
}


const goToDetails = (id: number | null) => {
  if (id !== null) {
    router.push({ name: 'client-product-details', params: { id } });
  } else {
    console.error('ID is null');
  }
};



</script>

<style scoped>
.header {
  width: 100%;
  max-width: 1350px;
  margin: 20px auto;
  /* border: 1px solid red; */

}

.product-card {
  width: 100%;
  max-width: 300px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>