<template>
  <div class="container">
    <!-- Filter Section -->
    <div class="filter">
      <div class="card p-4">
        <h3 class="text-lg font-semibold mb-2">PHÂN LOẠI HÀNG HÓA</h3>
        <button class="clear-button" @click="clearSportType">Clear</button>
        <div class="flex flex-col gap-2" style="flex-direction: column;">
          <div v-for="category in categories" :key="category.key" class="flex items-center gap-2">
            <RadioButton v-model="selectedSportType" :inputId="category.key" name="sportType" :value="category.name" />
            <label :for="category.key">{{ category.name }}</label>
          </div>
        </div>
      </div>

      <div class="card p-4 mt-4">
        <h3 class="text-lg font-semibold mb-2">MỨC GIÁ</h3>
        <button class="clear-button" @click="clearPriceRange">Clear</button>
        <div class="flex flex-col gap-2" style="flex-direction: column;">
          <div v-for="priceRange in priceRanges" :key="priceRange.key" class="flex items-center gap-2">
            <RadioButton v-model="selectedPriceRange" :inputId="priceRange.key" name="price" :value="priceRange.name" />
            <label :for="priceRange.key">{{ priceRange.name }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Product List Section -->
    <div class="header">
      <div class="p-4 bg-white min-h-screen">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Danh sách sản phẩm</h2>

        <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
          Đang tải dữ liệu...
        </div>

        <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
          {{ errorMessage }}
        </div>

        <div v-else-if="products.length === 0" class="text-center text-gray-500 py-10">
          Không có sản phẩm nào để hiển thị.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          <div
            v-for="group in paginatedGroups"
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
              <button class="wishlist-button" @click.stop="toggleWishlist(group.parentProductId)">
                <i class="pi pi-heart" :class="{ 'pi-heart-fill': isWishlisted(group.parentProductId) }"></i>
              </button>
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

                <div class="buttons-container">
                  <button class="action-button cart-button" @click.stop="toggleCart(group.parentProductId)">
                    <i class="pi pi-shopping-cart" :class="{ 'pi-shopping-cart-fill': isInCart(group.parentProductId) }"></i>
                  </button>
                  <button class="action-button eye-button">
                    <i class="pi pi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page">
        <div class="cardv2">
          <Paginator 
            :rows="rowsPerPage" 
            :first="currentPage * rowsPerPage"
            :totalRecords="groupedProducts.length"
            :rowsPerPageOptions="[8, 16, 24]"
            @page="onPageChange"
          />
        </div>
      </div>
    </div>
   
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { ProductClientService } from '../../../../service/client/ProductClientService';
import type { ProductResponseClient } from '../../../../model/client/product';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'chart.js/helpers';
import { useAuthStore } from '../../../../stores/auth';

const toast = useToast();
const selectedSportType = ref('');
const categories = ref([
  { name: 'Running', key: 'R' },
  { name: 'Training', key: 'T' },
  { name: 'Sneaker', key: 'S' },
  { name: 'Basketball', key: 'B' },
]);

const clearSportType = () => {
  selectedSportType.value = '';
  toast.add({ severity: 'info', summary: 'Thông báo', detail: 'Đã xóa bộ lọc phân loại hàng hóa', life: 3000 });
};

// Hàm xóa bộ lọc mức giá
const clearPriceRange = () => {
  selectedPriceRange.value = '';
  toast.add({ severity: 'info', summary: 'Thông báo', detail: 'Đã xóa bộ lọc mức giá', life: 3000 });
};

const selectedPriceRange = ref('');
const priceRanges = ref([
  { name: 'Dưới 600,000đ', key: 'under600' },
  { name: '600,000đ - 1,000,000đ', key: '600-1000' },
  { name: '1,000,000đ - 2,000,000đ', key: '1000-2000' },
  { name: 'Trên 2,000,000đ', key: 'over2000' },
]);

const supplierName = ref('');
const products = ref<ProductResponseClient[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const imageError = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const currentPage = ref(0);
const rowsPerPage = ref(8);

const onPageChange = (event: any) => {
  currentPage.value = event.page;
  rowsPerPage.value = event.rows;
};


const getPriceRangeValues = (range: string): { minPrice: number | undefined; maxPrice: number | undefined } => {
  switch (range) {
    case 'Dưới 600,000đ':
      return { minPrice: undefined, maxPrice: 600000 };
    case '600,000đ - 1,000,000đ':
      return { minPrice: 600000, maxPrice: 1000000 };
    case '1,000,000đ - 2,000,000đ':
      return { minPrice: 1000000, maxPrice: 2000000 };
    case 'Trên 2,000,000đ':
      return { minPrice: 2000000, maxPrice: undefined };
    default:
      return { minPrice: undefined, maxPrice: undefined };
  }
};

const fetchData = debounce(async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const { minPrice, maxPrice } = getPriceRangeValues(selectedPriceRange.value);
    const response = await ProductClientService.productSearchByAttributeClient(
      selectedSportType.value || '',
      route.query.supplier?.toString() || supplierName.value || '',
      route.query.category?.toString() || '',
      minPrice,
      maxPrice
    );
    if (response.status === 200 && response.data) {
      products.value = response.data;
    } else {
      errorMessage.value = response.message || 'Dữ liệu trả về không hợp lệ.';
      toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
  } finally {
    isLoading.value = false;
  }
}, 500);

onMounted(async () => {
  const categoryName = route.query.category?.toString();
  const supplier = route.query.supplier?.toString();
  if (categoryName) {
    supplierName.value = supplier || '';
    fetchData();
  } else {
    fetchData();
  }
  if (authStore.userId) {
    await authStore.fetchWishlist();
    await authStore.fetchCart();
  }
});

watch(
  () => [selectedSportType.value, selectedPriceRange.value, route.query.category, route.query.supplier],
  () => {
    fetchData();
  }
);

const groupedProducts = computed(() => {
  const groups: { parentProductId: number | null; products: ProductResponseClient[] }[] = [];
  const seenParentIds = new Set<number | null>();
  products.value.forEach(product => {
    if (!seenParentIds.has(product.parentProductId)) {
      seenParentIds.add(product.parentProductId);
      groups.push({
        parentProductId: product.parentProductId,
        products: products.value.filter(p => p.parentProductId === product.parentProductId),
      });
    }
  });
  return groups;
});

const paginatedGroups = computed(() => {
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return groupedProducts.value.slice(start, end);
});

const getFirstImage = (images: string[]) => {
  return images?.length > 0 ? images[0] : 'https://via.placeholder.com/300x200';
};

const getDiscountPercentage = (product: ProductResponseClient) => {
  const { originalPrice, price } = product;
  if (!originalPrice || !price || price >= originalPrice) return 0;
  return Math.round((1 - price / originalPrice) * 100);
};

const getBrandName = (name: string) => {
  return name.split(' - ')[0];
};

const onImageError = () => {
  imageError.value = true;
};

const goToDetails = (id: number | null) => {
  if (id !== null) {
    router.push({ name: 'client-product-details', params: { id } });
  }
};

const formatCurrency = (value: number | null) => {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
};

const isWishlisted = (parentProductId: number | null) => {
  if (parentProductId === null) return false;
  return authStore.wishlist.some(w =>
    w.product?.some(p => groupedProducts.value
      .find(g => g.parentProductId === parentProductId)
      ?.products.some(gp => gp.id === p.id)
    )
  );
};

const isInCart = (parentProductId: number | null) => {
  if (parentProductId === null) return false;
  const productId = groupedProducts.value
    .find(g => g.parentProductId === parentProductId)
    ?.products[0]?.id;
  return productId ? authStore.cart.some(c => c.product?.id === productId) : false;
};

const toggleWishlist = async (parentProductId: number | null) => {
  const userId = authStore.userId;
  if (!userId || parentProductId === null) {
    errorMessage.value = 'Vui lòng đăng nhập để sử dụng tính năng yêu thích.';
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: errorMessage.value, life: 3000 });
    return;
  }

  const productIds = groupedProducts.value
    .find(group => group.parentProductId === parentProductId)
    ?.products.map(p => p.id) || [];

  try {
    if (isWishlisted(parentProductId)) {
      const wishlistItem = authStore.wishlist.find(w =>
        w.product?.some(p => productIds.includes(p.id))
      );
      if (wishlistItem?.id) {
        await authStore.removeFromWishlist(wishlistItem.id);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa khỏi danh sách yêu thích', life: 3000 });
      }
    } else {
      for (const productId of productIds) {
        await authStore.addToWishlist(productId);
      }
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm vào danh sách yêu thích', life: 3000 });
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi khi cập nhật danh sách yêu thích.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
  }
};

const toggleCart = async (parentProductId: number | null) => {
  const userId = authStore.userId;
  if (!userId || parentProductId === null) {
    errorMessage.value = 'Vui lòng đăng nhập để sử dụng giỏ hàng.';
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: errorMessage.value, life: 3000 });
    return;
  }

  const product = groupedProducts.value
    .find(group => group.parentProductId === parentProductId)
    ?.products[0];
  const productId = product?.id;

  if (!productId) {
    errorMessage.value = 'Không tìm thấy sản phẩm.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
    return;
  }

  try {
    if (isInCart(parentProductId)) {
      const cartItem = authStore.cart.find(c => c.product?.id === productId);
      if (cartItem?.id) {
        if (product.stockQuantity <= cartItem.quantity) {
          errorMessage.value = 'Số lượng vượt quá tồn kho.';
          toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: errorMessage.value, life: 3000 });
          return;
        }
        await authStore.updateCartQuantity(cartItem.id, cartItem.quantity + 1);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tăng số lượng sản phẩm trong giỏ hàng', life: 3000 });
      }
    } else {
      if (product.stockQuantity < 1) {
        errorMessage.value = 'Sản phẩm đã hết hàng.';
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: errorMessage.value, life: 3000 });
        return;
      }
      await authStore.addToCart(productId, 1);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm sản phẩm vào giỏ hàng', life: 3000 });
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi khi cập nhật giỏ hàng.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 100px;
}

.clear-button{
    margin-left: 173px;
}

.filter {
  width: 20%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-right: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.header {
  width: 78%;
  margin-top: 0;
}

.product-card {
  width: 100%;
  max-width: 250px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: au;
  overflow: hidden;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.wishlist-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.wishlist-button:active {
  background: #ef4444;
  transform: scale(0.9);
}

.wishlist-button i {
  font-size: 1.2rem;
  color: #374151;
}

.wishlist-button .pi-heart-fill {
  color: #ef4444;
}

.buttons-container {
  display: flex;
  width: 100%;
  margin-top: auto;
  border-top: 1px solid #eee;
}

.action-button {
  flex: 1;
  background: #fff;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-right: 1px solid #eee;
  transition: background-color 0.2s, transform 0.2s;
  border-radius: 0;
}

.action-button:last-child {
  border-right: none;
}

.action-button:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.action-button:active {
  background-color: #2563eb;
  transform: scale(0.95);
}

.action-button:active i {
  color: #fff;
}

.action-button i {
  font-size: 1.25rem;
  color: #374151;
}

.cart-button .pi-shopping-cart-fill {
  color: #2563eb;
}

.buttons-container .cart-button {
  border-bottom-left-radius: 10px;
}

.buttons-container .eye-button {
  border-bottom-right-radius: 10px;
}
</style>