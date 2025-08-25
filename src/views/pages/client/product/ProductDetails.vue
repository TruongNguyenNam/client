<template>
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Product Details</h1>
  
      <div v-if="products.length > 0" class="flex flex-col md:flex-row gap-6">
        <!-- Product Image -->
        <div class="w-full md:w-1/2 bg-white rounded-lg shadow-lg overflow-hidden">
          <img :src="selectedProduct.imageUrl[0]" alt="product image" class="w-full h-96 object-cover" style="border-radius: 20px;" />
        </div>
  
        <!-- Product Info -->
        <div class="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-xl font-semibold text-gray-800 mb-2">{{ getBrandName(products[0].name) }}</h1>
          <p class="text-gray-600 text-sm mb-2">Thương hiệu: {{ getBrandName(products[0].name) }} New Arrival | Mã sản phẩm: {{ products[0].sku }}</p>
          <span class="text-red-600 font-bold">Số Lượng: {{ selectedProduct.stockQuantity ?? 0}}</span>
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
              <button style="border-radius: 20px;"
                v-for="value in uniqueValuesForAttribute(attribute)"
                :key="value"
                :class="['border rounded-full px-5 py-2 text-base font-semibold transition duration-200', 
                         selectedAttributes[attribute] === value ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100']"
                @click="selectAttribute(attribute, value)"
              >
                {{ value }}
              </button>
            </div>
            <!-- <p v-if="attribute === 'size'" class="text-sm text-gray-500">Hướng dẫn chọn size</p> -->
          </div>
  
          <!-- Quantity + Cart Button -->
          <div class="space-y-4 w-full">
            <!-- Quantity + Thêm vào giỏ -->
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div class="flex items-center justify-center border border-gray-300 rounded-full px-4 py-2" style="min-width: 140px; border: 1px solid black;">
                  <Button
                    icon="pi pi-minus"
                    text
                    @click="decreaseQuantity"
                    class="text-gray-600 hover:text-red-600"
                  />
                  <span class="mx-4 text-gray-800 text-lg font-semibold w-6 text-center" style="margin-top: 10px;">{{ quantity }}</span>
                  <Button
                    icon="pi pi-plus"
                    text
                    @click="increaseQuantity"
                    class="text-gray-600 hover:text-green-600"
                  />
              </div>
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

    <div v-if="selectedProduct.parentProductId" class="productchat mx-auto p-4">
        <ProductReview :product="selectedProduct" />
    </div>
   
    

    

  </template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ProductClientService } from '../../../../service/client/ProductClientService';
import type { ProductResponseClient } from '../../../../model/client/product';
import ProductReview from './ProductReview.vue';
import { useAuthStore } from '../../../../stores/auth';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const products = ref<ProductResponseClient[]>([]);
const selectedProduct = ref<ProductResponseClient>({} as ProductResponseClient);
const selectedAttributes = ref<Record<string, string>>({});
const quantity = ref(1); 
const errorMessage = ref('');
const isAddingToCart = ref(false); 
const toast = useToast();
const authStore = useAuthStore();

// lấy chi tiết sản phẩm 
const fetchProductDetails = async () => {
  const id = Number(route.params.id);
  if (isNaN(id)) {
    errorMessage.value = 'ID sản phẩm không hợp lệ.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
    return;
  }

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
      toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Lỗi không xác định khi tải dữ liệu.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage.value, life: 3000 });
  }
};

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
  if (product) {
    selectedProduct.value = product;
    // Reset quantity to 1 when changing product variant
    quantity.value = 1;
    // Check if product is in cart and set quantity accordingly
    const cartItem = authStore.cart.find(item => item.product.id === product.id);
    if (cartItem) {
      quantity.value = cartItem.quantity;
    }
  }
};

// Add to Cart
const addToCart = async () => {
  if (!authStore.userId) {
    toast.add({
      severity: 'warn',
      summary: 'Chưa đăng nhập',
      detail: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
      life: 3000,
    });
    return;
  }

  if (selectedProduct.value.stockQuantity < quantity.value) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Số lượng tồn kho không đủ (${selectedProduct.value.stockQuantity} sản phẩm).`,
      life: 3000,
    });
    return;
  }

  isAddingToCart.value = true;
  try {
    // Check if product is already in cart
    const existingCartItem = authStore.cart.find(item => item.product.id === selectedProduct.value.id);
    if (existingCartItem) {
      // Update quantity if product exists in cart
      const newQuantity = existingCartItem.quantity + quantity.value;
      if (newQuantity > selectedProduct.value.stockQuantity) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: `Số lượng vượt quá tồn kho (${selectedProduct.value.stockQuantity} sản phẩm).`,
          life: 3000,
        });
        return;
      }
      await authStore.updateCartQuantity(existingCartItem.id, newQuantity);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã cập nhật số lượng ${getBrandName(selectedProduct.value.name)} trong giỏ hàng!`,
        life: 3000,
      });
    } else {
      // Add new product to cart
      await authStore.addToCart(selectedProduct.value.id, quantity.value);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `${getBrandName(selectedProduct.value.name)} đã được thêm vào giỏ hàng!`,
        life: 3000,
      });
    }
    quantity.value = 1; // Reset quantity after adding
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error || 'Không thể thêm vào giỏ hàng.',
      life: 3000,
    });
  } finally {
    isAddingToCart.value = false;
  }
};

// thêm số lượng 
const increaseQuantity = () => {
  if (quantity.value < selectedProduct.value.stockQuantity) {
    quantity.value += 1;
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: `Số lượng tối đa là ${selectedProduct.value.stockQuantity}.`,
      life: 3000,
    });
  }
};

// giảm số lượng 
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

// Checkout (Mua ngay)
// const checkout = async () => {
//   if (!authStore.userId) {
//     toast.add({
//       severity: 'warn',
//       summary: 'Chưa đăng nhập',
//       detail: 'Vui lòng đăng nhập để thực hiện thanh toán.',
//       life: 3000,
//     });
//     return;
//   }

//   if (selectedProduct.value.stockQuantity < quantity.value) {
//     toast.add({
//       severity: 'error',
//       summary: 'Lỗi',
//       detail: `Số lượng tồn kho không đủ (${selectedProduct.value.stockQuantity} sản phẩm).`,
//       life: 3000,
//     });
//     return;
//   }

//   isCheckingOut.value = true;
//   try {
//     // Construct OrderRequestClient
//     const orderRequest: OrderRequestClient = {
//       userId: authStore.userId,
//       items: [
//         {
//           productId: selectedProduct.value.id,
//           quantity: quantity.value,
//         },
//       ],
//       payment: {
//         paymentMethodId: 1, // Example: Assume 1 is for a default payment method (e.g., Cash on Delivery)
//         amount: selectedProduct.value.price * quantity.value,
//       },
//       shipments: [
//         {
//           carrierId: 1, // Example: Assume 1 is for a default carrier
//           estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
//         },
//       ],
//     };

//     const response = await CartClientService.checkout(orderRequest);
//     if (response.status === 200 && response.data) {
//       toast.add({
//         severity: 'success',
//         summary: 'Thành công',
//         detail: `Đơn hàng #${response.data.orderCode} đã được tạo thành công!`,
//         life: 3000,
//       });
//       quantity.value = 1; // Reset quantity
//       await authStore.fetchCart(); // Refresh cart after checkout
//     } else {
//       toast.add({
//         severity: 'error',
//         summary: 'Lỗi',
//         detail: response.message || 'Không thể tạo đơn hàng.',
//         life: 3000,
//       });
//     }
//   } catch (error: any) {
//     toast.add({
//       severity: 'error',
//       summary: 'Lỗi',
//       detail: error.response?.data?.error || 'Không thể thực hiện thanh toán.',
//       life: 3000,
//     });
//   } finally {
//     isCheckingOut.value = false;
//   }
// };

// const addToWishlist = async () => {
//   if (!authStore.userId) {
//     toast.add({
//       severity: 'warn',
//       summary: 'Chưa đăng nhập',
//       detail: 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.',
//       life: 3000,
//     });
//     return;
//   }

//   try {
//     await authStore.addToWishlist(selectedProduct.value.id);
//     toast.add({
//       severity: 'success',
//       summary: 'Thành công',
//       detail: `${getBrandName(selectedProduct.value.name)} đã được thêm vào danh sách yêu thích!`,
//       life: 3000,
//     });
//   } catch (error: any) {
//     toast.add({
//       severity: 'error',
//       summary: 'Lỗi',
//       detail: error.response?.data?.error || 'Không thể thêm vào danh sách yêu thích.',
//       life: 3000,
//     });
//   }
// };

// Format currency
const formatCurrency = (value: number | null): string => {
  if (!value || value === 0) return 'Liên hệ';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
};

// Calculate discount percentage
const getDiscountPercentage = (product: ProductResponseClient): number => {
  const { originalPrice, price } = product;
  if (!originalPrice || !price || price >= originalPrice) return 0;
  return Math.round((1 - price / originalPrice) * 100);
};

// Extract brand name
const getBrandName = (name: string): string => {
  return name.split(' - ')[0] || name;
};

onMounted(async () => {
  await fetchProductDetails();
  console.log('selectedProduct:', selectedProduct.value); // Debug
  console.log('selectedProduct.id:', selectedProduct.value.id); // Debug
  if (authStore.userId) {
    await authStore.fetchCart();
  }
});
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