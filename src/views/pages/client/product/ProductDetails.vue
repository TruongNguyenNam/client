<template>
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Product Details</h1>
  
      <div v-if="products.length > 0" class="flex flex-col md:flex-row gap-6">
        <!-- Product Image -->
        <div class="w-full md:w-1/2 bg-white rounded-lg shadow-lg overflow-hidden" style="border: 1px solid red;">
          <img :src="selectedProduct.imageUrl[0]" alt="product image" class="w-full h-96 object-cover" style="border-radius: 20px;" />
        </div>
  
        <!-- Product Info -->
        <div class="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6" style="border: 1px solid red;">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ getBrandName(products[0].name) }}</h2>
          <p class="text-gray-600 text-sm mb-2">Thương hiệu: {{ getBrandName(products[0].name) }} New Arrival | Mã sản phẩm: {{ products[0].sku }}</p>
          <div class="text-gray-600 mb-4">
            <p class="text-xl">
              <span class="text-red-600 font-bold">{{ formatCurrency(selectedProduct.price ?? 0) }}</span>
              <span class="text-gray-500 line-through ml-2">{{ formatCurrency(selectedProduct.originalPrice) }}</span>
              <span v-if="selectedProduct.originalPrice && selectedProduct.price !== null && selectedProduct.price < selectedProduct.originalPrice" class="text-red-500 text-base ml-2">
                -{{ getDiscountPercentage(selectedProduct) }}%
              </span>
            </p>
            <p class="text-green-600 text-sm">(Tiết kiệm {{ formatCurrency(selectedProduct.originalPrice - (selectedProduct.price ?? 0)) }})</p>
          </div>
  
          <!-- Promotion -->
          <div class="border border-dashed border-red-500 p-4 mb-4 rounded-lg">
            <h3 class="text-lg font-medium text-red-600 mb-2">KHUYẾN MÃI</h3>
            <ul class="text-gray-600 text-sm list-disc pl-5">
              <li>🌞 SUMMER SALE: UPTO 50%</li>
              <li>Chào hè với vô vàn bộ sưu tập thời trang đỉnh cao</li>
              <li>🎁 Giảm thêm 5%+ quần áo, giày dép 4 mùa</li>
              <li>Freeship cho đơn hàng từ 500K</li>
              <li>😊 Nhận ngay số hóa đơn trúng bộ sưu tập đình đám!</li>
            </ul>
          </div>
  
          <!-- Dynamic Attributes -->
          <div v-for="attribute in uniqueAttributes" :key="attribute" class="mb-6">
            <p class="text-md font-medium text-gray-700 mb-2">{{ attribute }}:</p>
            <div class="flex flex-wrap gap-2 mb-2">
              <button
                v-for="value in uniqueValuesForAttribute(attribute)"
                :key="value"
                :class="['border rounded-full px-5 py-2 text-base font-semibold transition duration-200', 
                         selectedAttributes[attribute] === value ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100']"
                @click="selectAttribute(attribute, value)"
              >
                {{ value }}
              </button>
            </div>
            <p v-if="attribute === 'size'" class="text-sm text-gray-500">Hướng dẫn chọn size</p>
          </div>
  
          <!-- Quantity + Cart Button -->
          <div class="space-y-4 w-full">
            <!-- Quantity + Thêm vào giỏ -->
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full">
              <!-- Quantity -->
              <div class="flex items-center justify-between w-36 h-12 px-4 border border-gray-300 rounded-full" style="border: 1px solid red;">
                <button @click="decreaseQuantity" class="text-gray-600 text-xl hover:text-red-600 font-bold transition duration-200">-</button>
                <span class="text-gray-800 text-lg font-semibold">{{ quantity }}</span>
                <button @click="increaseQuantity" class="text-gray-600 text-xl hover:text-green-600 font-bold transition duration-200">+</button>
              </div>
  
              <!-- Thêm vào giỏ -->
              <button
                @click="addToCart"
                class="flex-1 bg-white border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-full hover:bg-orange-600 hover:text-white transition duration-200 font-bold text-lg"
                style="border-radius: 20px;"
              >
                THÊM VÀO GIỎ
              </button>
            </div>
  
            <!-- Mua ngay -->
            <button
              class="bg-orange-600 text-white w-full py-4 rounded-full hover:bg-orange-700 transition duration-200 font-bold text-lg"
              style="border-radius: 20px; margin-top: 15px;"
            >
              MUA NGAY
            </button>
  
            <!-- Số điện thoại -->
            <p class="text-center text-sm text-black mt-1">
              Gọi đặt mua / Zalo <span class="font-bold">0974.945.488</span>
              <span class="italic">(9:00 - 17:00)</span>
            </p>
          </div>
  
          <!-- Add to Wishlist -->
          <p class="text-center text-red-600 mt-4 cursor-pointer hover:underline">
            Thêm vào yêu thích <span class="text-xl">❤️</span>
          </p>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-10">Không có dữ liệu sản phẩm.</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { ProductClientService } from '../../../../service/client/ProductClientService';
  import type { ProductResponseClient } from '../../../../model/client/product';
  
  const route = useRoute();
  const products = ref<ProductResponseClient[]>([]);
  const selectedProduct = ref<ProductResponseClient>({} as ProductResponseClient);
  const selectedAttributes = ref<Record<string, string>>({});
  const cart = ref<ProductResponseClient[]>([]);
  const errorMessage = ref('');
  
  const quantity = ref(1);
  
  const increaseQuantity = () => {
    quantity.value++;
  };
  
  const decreaseQuantity = () => {
    if (quantity.value > 1) quantity.value--;
  };
  
  const fetchProductDetails = async () => {
    const id = Number(route.params.id);
    try {
      const response = await ProductClientService.findByParentProductId(id);
      if (response.status === 200 && response.data) {
        products.value = response.data;
        selectedProduct.value = products.value[0];
        selectedProduct.value.productAttributeValueResponses.forEach(attr => {
          selectedAttributes.value[attr.attributeName] = attr.value;
        });
      } else {
        errorMessage.value = response.message || 'Không thể lấy chi tiết sản phẩm.';
      }
    } catch (error) {
      errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
    }
  };
  
  onMounted(fetchProductDetails);
  
  const uniqueAttributes = computed(() => {
    const attributes = new Set<string>();
    products.value.forEach(p => p.productAttributeValueResponses.forEach(attr => attributes.add(attr.attributeName)));
    return Array.from(attributes);
  });
  
  const uniqueValuesForAttribute = computed(() => (attribute: string) => {
    return [...new Set(products.value.flatMap(p => p.productAttributeValueResponses.filter(a => a.attributeName === attribute).map(a => a.value)))].filter(Boolean) as string[];
  });
  
  const selectAttribute = (attribute: string, value: string) => {
    selectedAttributes.value[attribute] = value;
    updateSelectedProduct();
  };
  
  const updateSelectedProduct = () => {
    const product = products.value.find(p =>
      p.productAttributeValueResponses.every(attr => {
        const selectedValue = selectedAttributes.value[attr.attributeName];
        return !selectedValue || selectedValue === attr.value;
      })
    );
    if (product) selectedProduct.value = product;
  };
  
  const addToCart = () => {
    for (let i = 0; i < quantity.value; i++) {
      cart.value.push({ ...selectedProduct.value });
    }
    alert(`${getBrandName(selectedProduct.value.name)} đã được thêm vào giỏ hàng!`);
  };
  
  function formatCurrency(value: number | null): string {
    if (!value || value === 0) return 'Liên hệ';
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
  }
  
  function getDiscountPercentage(product: ProductResponseClient): number {
    const { originalPrice, price } = product;
    if (!originalPrice || !price || price >= originalPrice) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  }
  
  function getBrandName(name: string): string {
    return name.split(' - ')[0];
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
  }
  
  .product-details {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .bg-gray-50 {
    background-color: #f9fafb;
  }
  
  button {
    transition: background-color 0.2s, transform 0.2s, color 0.2s;
  }
  
  button:hover:not(.bg-orange-600) {
    background-color: #e5e7eb;
    transform: translateY(-1px);
  }
  
  button.bg-orange-600 {
    background-color: #f97316;
    font-weight: bold;
  }
  
  button.bg-orange-600:hover {
    background-color: #ea580c;
  }
  
  button.bg-gray-200 {
    background-color: #e5e7eb;
    font-weight: bold;
  }
  </style>