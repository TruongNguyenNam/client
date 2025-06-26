<!--  -->
<template>
    <div class="container">
      <!-- Filter Section -->
      <div class="filter">
        <div class="card p-4">
          <h3 class="text-lg font-semibold mb-2">PHÂN LOẠI HÀNG HÓA</h3>
          <div class="flex flex-col gap-2" style="flex-direction: column;">
            <div v-for="category in categories" :key="category.key" class="flex items-center gap-2">
              <RadioButton v-model="selectedSportType" :inputId="category.key" name="sportType" :value="category.name" />
              <label :for="category.key">{{ category.name }}</label>
            </div>
          </div>
        </div>
  
        <div class="card p-4 mt-4">
          <h3 class="text-lg font-semibold mb-2">MỨC GIÁ</h3>
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
          <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Danh sách sản phẩm ({{ groupedProducts.length }})</h2>
  
          <div v-if="isLoading" class="text-center text-gray-500 animate-pulse py-10">
            Đang tải dữ liệu...
          </div>
  
          <div v-else-if="errorMessage" class="text-center text-red-600 bg-red-100 p-3 rounded-lg">
            {{ errorMessage }}
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
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { ProductClientService } from '../../../../service/client/ProductClientService';
  import type { ProductResponseClient } from '../../../../model/client/product';
  import { useRouter, useRoute } from 'vue-router';
  import { debounce } from 'chart.js/helpers';
  
  const selectedSportType = ref('');
  const categories = ref([
    { name: 'Running', key: 'R' },
    { name: 'Training', key: 'T' },
    { name: 'Sneaker', key: 'S' },
    { name: 'Basketball', key: 'B' },
  ]);
  
  const selectedPriceRange = ref('');
  const priceRanges = ref([
    { name: 'Dưới 600,000đ', key: 'under600' },
    { name: '600,000đ - 1,000,000đ', key: '600-1000' },
    { name: '1,000,000đ - 2,000,000đ', key: '1000-2000' },
    { name: 'Trên 2,000,000đ', key: 'over2000' },
  ]);
  
  const products = ref<ProductResponseClient[]>([]);
  const isLoading = ref(true);
  const errorMessage = ref('');
  const imageError = ref(false);
  const router = useRouter();
  const route = useRoute();
  
  // Chuyển đổi selectedPriceRange thành minPrice, maxPrice
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
  
  // Gọi API để lấy toàn bộ sản phẩm
  const fetchData = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await ProductClientService.getAllChildProducts();
      if (response.status === 200 && response.data) {
        products.value = response.data;
        console.log('Fetched products:', response.data); // Debug data
      } else {
        errorMessage.value = response.message || 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.';
      }
    } catch (error) {
      errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
      console.error('Fetch error:', error); // Debug error
    } finally {
      isLoading.value = false;
    }
  };
  
  // Gọi API khi mount
  onMounted(() => {
    fetchData();
  });
  
  // Lọc sản phẩm theo categoryName, supplierName, sportType và price
  const filteredProducts = computed(() => {
    const { minPrice, maxPrice } = getPriceRangeValues(selectedPriceRange.value);
    const categoryName = route.query.category?.toString() || '';
    const supplierName = route.query.supplier?.toString() || '';
  
    console.log('Filtering with:', { categoryName, supplierName, sportType: selectedSportType.value, minPrice, maxPrice }); // Debug filters
  
    return products.value.filter(product => {
      const matchesCategory = !categoryName || product.categoryName === categoryName;
      const matchesSupplier = !supplierName || product.supplierName === supplierName;
      const matchesSportType = !selectedSportType.value || product.sportType === selectedSportType.value;
      const price = product.price ?? 0;
      const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
  
      // Chỉ yêu cầu ít nhất một điều kiện khớp nếu có bộ lọc
      return (categoryName || supplierName || selectedSportType.value || minPrice || maxPrice)
        ? (matchesCategory || !categoryName) && (matchesSupplier || !supplierName) && (matchesSportType || !selectedSportType.value) && matchesPrice
        : true; // Nếu không có bộ lọc, trả về tất cả sản phẩm
    });
  });
  
  // Nhóm sản phẩm theo parentProductId
  const groupedProducts = computed(() => {
    const groups: { parentProductId: number | null; products: ProductResponseClient[] }[] = [];
    const seenParentIds = new Set<number | null>();
    filteredProducts.value.forEach(product => {
      if (!seenParentIds.has(product.parentProductId)) {
        seenParentIds.add(product.parentProductId);
        groups.push({
          parentProductId: product.parentProductId,
          products: filteredProducts.value.filter(p => p.parentProductId === product.parentProductId),
        });
      }
    });
    console.log('Grouped products:', groups); // Debug groups
    return groups;
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
  
  // Theo dõi thay đổi bộ lọc
  watch(
    () => [selectedSportType.value, selectedPriceRange.value, route.query.category, route.query.supplier],
    () => {
      console.log('Watch triggered:', { sportType: selectedSportType.value, priceRange: selectedPriceRange.value, category: route.query.category, supplier: route.query.supplier }); // Debug watch
    }
  );
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 100px;
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
    border: none;
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