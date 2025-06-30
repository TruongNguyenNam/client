<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useAuthStore } from '../../../../stores/auth';
import type { WishlistResponse, Product } from '../../../../model/client/wishlist';

const router = useRouter();
const authStore = useAuthStore();
const wishlist = ref<WishlistResponse[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const imageError = ref(false);

const fetchWishlist = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    if (authStore.userId) {
      await authStore.fetchWishlist();
      wishlist.value = authStore.wishlist;
    } else {
      errorMessage.value = 'Vui lòng đăng nhập để xem danh sách yêu thích.';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải danh sách yêu thích.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchWishlist);

const retryFetch = () => {
  fetchWishlist();
};

const removeFromWishlist = async (wishlistIds: number[]) => {
  try {
    for (const id of wishlistIds) {
      await authStore.removeFromWishlist(id);
    }
    await fetchWishlist();
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi khi xóa sản phẩm yêu thích.';
  }
};

const goToDetails = (parentProductId: number | null | undefined) => {
  if (parentProductId !== undefined && parentProductId !== null && !isNaN(parentProductId)) {
    console.log('Navigating to product details with parentProductId:', parentProductId);
    router.push({ name: 'client-product-details', params: { id: parentProductId.toString() } }).catch(err => {
      console.error('Navigation error:', err);
    });
  } else {
    console.error('parentProductId không hợp lệ:', parentProductId);
  }
};

const formatCurrency = (value: number | null | undefined): string => {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
};

const getFirstImage = (images: string[] ): string => {
  return images?.length > 0 ? images[0] : 'https://via.placeholder.com/300x200';
};

const getDiscountPercentage = (product: Product | undefined): number => {
  if (!product?.originalPrice || !product.price || product.price >= product.originalPrice) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
};

const getBrandName = (name: string | undefined): string => {
  return name?.split(' - ')[0] || 'Thương hiệu không xác định';
};

function onImageError() {
  imageError.value = true;
}

// Gom nhóm wishlist theo parentProductId
const groupedWishlist = computed(() => {
  const groups: { parentProductId: number | null; products: Product[]; wishlistIds: number[] }[] = [];
  const seenParentIds = new Set<number | null>();

  wishlist.value.forEach(item => {
    const parentProductId = item.product[0]?.parentProductId ?? null;
    if (!seenParentIds.has(parentProductId)) {
      seenParentIds.add(parentProductId);
      groups.push({
        parentProductId,
        products: item.product,
        wishlistIds: [item.id]
      });
    } else {
      const existingGroup = groups.find(g => g.parentProductId === parentProductId);
      if (existingGroup) {
        existingGroup.products.push(...item.product);
        existingGroup.wishlistIds.push(item.id);
      }
    }
  });

  return groups;
});
</script>

<template>
  <div class="wishlist-container">
    <h1 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Danh sách sản phẩm yêu thích</h1>

    <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
      Đang tải dữ liệu...
    </div>

    <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
      {{ errorMessage }}
      <button @click="retryFetch" class="ml-2 text-blue-500 underline">Thử lại</button>
    </div>

    <div v-else-if="groupedWishlist.length === 0" class="text-center text-gray-500 py-10">
      Bạn chưa có sản phẩm yêu thích nào.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center" style="border: 1px solid red; margin-top: 40px;">
      <div
        v-for="group in groupedWishlist"
        :key="group.parentProductId ?? 'no-parent'"
        class="product-card"
        @click="goToDetails(group.parentProductId)"
      >
        <div class="product-image relative">
          <img
            :src="getFirstImage(group.products[0]?.imageUrl)"
            alt="Product Image"
            @error="onImageError"
            class="image"
          />
          <div
            v-if="imageError"
            class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
          >
            Ảnh không tải được
          </div>
          <div
            v-if="group.products[0]?.originalPrice && group.products[0]?.price < group.products[0]?.originalPrice"
            class="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
          >
            SALE<br />up to {{ getDiscountPercentage(group.products[0]) }}%
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
          <p class="text-lg text-gray-600 line-clamp-2">Sản Phẩm: {{ getBrandName(group.products[0]?.name) }}</p>

          <div class="mt-2">
            <span class="text-gray-500 line-through text-base block">{{ formatCurrency(group.products[0]?.originalPrice) }}</span>
            <span class="text-red-600 font-bold text-base block">{{ formatCurrency(group.products[0]?.price ?? 0) }}</span>
            <span
              v-if="group.products[0]?.originalPrice && group.products[0]?.price !== null && group.products[0]?.price < group.products[0]?.originalPrice"
              class="text-white text-base bg-red-500 px-2 py-0.5 rounded inline-block mt-1"
            >
              -{{ getDiscountPercentage(group.products[0]) }}%
            </span>
          </div>
          <Button label="Xóa" icon="pi pi-trash" class="p-button-danger mt-2" @click.stop="removeFromWishlist(group.wishlistIds)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wishlist-container {
  padding: 20px;
  max-width: 1350px;
  margin: 0 auto;
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
  cursor: pointer;
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

.content {
  text-align: left;
}

.p-button-danger {
  width: 100%;
}
</style>