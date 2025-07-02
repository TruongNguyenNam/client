<!-- test chính sản chính cart -->

<template>
  <div class="container">
    <!-- Tiêu đề và thanh freeship -->
    <div class="mb-4" style="margin-top: 90px">
      <h2 class="text-2xl font-bold mb-2">Giỏ hàng ({{ cartItems.length }} sản phẩm)</h2>
      <ProgressBar :value="100" style="height: 8px" />
      <p class="mt-2 text-sm text-green-700">
        🎉 Chúc mừng! Đơn hàng của bạn đã đủ điều kiện được Freeship 🎉 Đến trang thanh toán nhập Voucher giảm giá ngay nào!
      </p>
    </div>

    <!-- Nội dung chia 2 cột -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" style="display: flex; justify-content: center;">
      <!-- Cột trái: Danh sách sản phẩm -->
      <div class="lg:col-span-2" style="width: 850px;">
        <div v-if="loading" class="text-center text-gray-500">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          Đang tải giỏ hàng...
        </div>
        <div v-else-if="cartItems.length === 0" class="text-center text-gray-500">
          Giỏ hàng của bạn đang trống.
        </div>
        <div v-else v-for="item in cartItems" :key="item.id" class="cart-item">
          <img
            :src="getFirstImage(item.product.imageUrl)"
            class="cart-img"
            alt="Product"
          />
          <div class="flex-1">
            <p class="font-semibold text-sm sm:text-base">{{ item.product.name }}</p>
            <p class="text-gray-500 text-xs sm:text-sm">
              Thuộc Tính: {{ getAttributesText(item.product.productAttributeValueResponses) }}
            </p>
          </div>
          <div class="text-sm sm:text-base mr-2">
            <span class="line-through text-gray-400 mr-1" v-if="item.product.originalPrice">
              {{ formatPrice(item.product.originalPrice) }}
            </span>
            <span class="text-red-500 font-bold">
              {{ formatPrice(item.product.price) }} x {{ item.quantity }} = {{ formatPrice(item.product.price * item.quantity) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Button icon="pi pi-minus" text @click="decreaseQty(item)" :disabled="item.quantity <= 1 || updating[item.id]" />
            <span class="min-w-[20px] text-center">{{ item.quantity }}</span>
            <Button icon="pi pi-plus" text @click="increaseQty(item)" :disabled="updating[item.id]" />
          </div>
          <div class="flex items-center gap-2">
            <Button icon="pi pi-times" text severity="danger" @click="removeItem(item)" :disabled="updating[item.id]" />
          </div>
        </div>

        <!-- Ghi chú -->
        <div class="mt-4">
          <label class="block mb-2 font-medium">Ghi chú đơn hàng</label>
          <Textarea v-model="note" rows="3" class="w-full" />
        </div>
      </div>

      <!-- Cột phải: Tổng cộng -->
      <div>
        <div class="summary-box">
          <div class="flex justify-between items-center text-base font-semibold">
            <span>TỔNG CỘNG</span>
            <span class="total-price">{{ formatPrice(total) }}</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
          <Button
            label="Thanh Toán"
            class="w-full mt-4 pay-button"
            :disabled="cartItems.length === 0 || loading"
            @click="goToCheckout"
          />
          <div class="flex justify-between items-center mt-4 flex-wrap gap-3">
            <img
              v-for="logo in paymentLogos"
              :key="logo.alt"
              :src="logo.src"
              :alt="logo.alt"
              class="payment-logo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../../stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { CartClientService } from '../../../../service/client/CartClientService';
import type { ShoppingCartResponse } from '../../../../model/client/cart';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(false);
const cartItems = ref<ShoppingCartResponse[]>([]);
const note = ref<string>('');
const updating = ref<{ [key: number]: boolean }>({});

const paymentLogos = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png', alt: 'Visa' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png', alt: 'Mastercard' },
  { src: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png', alt: 'MoMo' },
  { src: 'https://upload.wikimedia.org/wikipedia/vi/e/ef/ZaloPay_Logo.png', alt: 'ZaloPay' },
  { src: 'https://cdn-icons-png.flaticon.com/512/10486/10486076.png', alt: 'COD' },
];

const goToCheckout = () => {
  localStorage.setItem('cartNote', note.value);
  router.push({ name: 'check_out' });
};

const total = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
);

const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const getFirstImage = (images: string[] | null | undefined): string => {
  return images && images.length > 0 ? images[0] : 'https://via.placeholder.com/80';
};

const getAttributesText = (
  attributes: { attributeName: string; value: string }[] | null | undefined
): string => {
  if (!attributes || attributes.length === 0) return 'Không có thuộc tính';
  return attributes.map(attr => `${attr.attributeName}: ${attr.value}`).join(', ');
};

const fetchCart = async () => {
  if (!authStore.userId) {
    toast.add({
      severity: 'warn',
      summary: 'Lỗi đăng nhập',
      detail: 'Vui lòng đăng nhập để xem giỏ hàng.',
      life: 3000,
    });
    cartItems.value = [];
    return;
  }

  loading.value = true;
  try {
    await authStore.fetchCart();
    cartItems.value = authStore.cart; 
    console.log('Cart items updated:', cartItems.value.length); 
    console.log('Cart count from store:', authStore.cartCount); 
  } catch (error: any) {
    console.error('Lỗi khi tải giỏ hàng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error || 'Không thể tải giỏ hàng.',
      life: 3000,
    });
    cartItems.value = [];
  } finally {
    loading.value = false;
  }
};

const increaseQty = async (item: ShoppingCartResponse) => {
  updating.value[item.id] = true;
  try {
    await authStore.updateCartQuantity(item.id, item.quantity + 1);
    await fetchCart(); // Đồng bộ lại giỏ hàng
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tăng số lượng.', life: 3000 });
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error || 'Không thể tăng số lượng.',
      life: 3000,
    });
  } finally {
    updating.value[item.id] = false;
  }
};

const decreaseQty = async (item: ShoppingCartResponse) => {
  if (item.quantity <= 1) return;
  updating.value[item.id] = true;
  try {
    await authStore.updateCartQuantity(item.id, item.quantity - 1);
    await fetchCart(); // Đồng bộ lại giỏ hàng
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã giảm số lượng.', life: 3000 });
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error || 'Không thể giảm số lượng.',
      life: 3000,
    });
  } finally {
    updating.value[item.id] = false;
  }
};

const removeItem = async (item: ShoppingCartResponse) => {
  updating.value[item.id] = true;
  try {
    await authStore.removeFromCart(item.id);
    await fetchCart(); // Đồng bộ lại giỏ hàng từ store
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa sản phẩm khỏi giỏ hàng.', life: 3000 });
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error || 'Không thể xóa sản phẩm.',
      life: 3000,
    });
  } finally {
    updating.value[item.id] = false;
  }
};

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.container {
  width: 1300px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

.payment-logo {
  width: 38px;
  height: 24px;
  object-fit: contain;
  transition: transform 0.2s ease;
}
.payment-logo:hover {
  transform: scale(1.1);
}

.summary-box {
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 1.5rem;
}

.total-price {
  color: #e53935;
  font-weight: bold;
}

.pay-button {
  background-color: #7f56d9;
  border: none;
  border-radius: 6px;
  font-weight: 600;
}
.pay-button:hover {
  background-color: #6c42c7;
}

.cart-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}
.cart-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: white;
}
</style>