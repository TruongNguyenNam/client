<template>
  <div class="order-details">
    <h1>Đơn hàng chi tiết</h1>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="order" class="order-content">
      <!-- Khối thông tin đơn hàng -->
      <div class="card">
        <h2>📦 Thông tin đơn hàng</h2>
        <p><strong>Mã đơn hàng:</strong> {{ order.orderCode }}</p>
        <p><strong>Ngày đặt:</strong> {{ order.orderDate }}</p>
        <p><strong>Trạng thái:</strong> {{ order.orderStatus }}</p>
        <p><strong>Tổng tiền:</strong> {{ order.orderTotal.toLocaleString() }} VNĐ</p>
      </div>

      <!-- Khối địa chỉ giao hàng -->
      <div class="card">
        <h2>🚚 Địa chỉ giao hàng</h2>
        <p><strong>Người nhận:</strong> {{ order.address?.receiverName }}</p>
        <p><strong>SĐT:</strong> {{ order.address?.receiverPhone }}</p>
        <p>
          {{ order.address?.addressStreet }},
          {{ order.address?.addressWard }},
          {{ order.address?.addressDistrict }},
          <!-- {{ order.address?.addressCity }}, -->
          {{ order.address?.addressProvince }}
        </p>
      </div>

      <!-- Khối danh sách sản phẩm -->
      <div class="card">
        <h2>🛒 Danh sách sản phẩm</h2>
        <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>
                <img
                  v-if="mapProductImageWithOrder(item.productId)?.imageUrl.length"
                  :src="mapProductImageWithOrder(item.productId)?.imageUrl[0]"
                  alt="product image"
                  class="product-img"
                />
                <span v-else>Không có ảnh</span>
              </td>
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unitPrice.toLocaleString() }} VNĐ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { OrderResponseClient } from '../../../../model/client/cart';
import type { ProductResponseClient } from '../../../../model/client/product';
import { CartClientService } from '../../../../service/client/CartClientService';
import { ProductClientService } from '../../../../service/client/ProductClientService';

const route = useRoute();
const orderCode = route.params.orderCode as string;

const products = ref<ProductResponseClient[]>([]);
const order = ref<OrderResponseClient | null>(null);
const loading = ref(true);
const error = ref('');

const fetchOrderDetail = async () => {
  try {
    const response = await CartClientService.getOrderByCode(orderCode);
    if (response.data) {
      order.value = response.data;
    } else {
      order.value = null;
      error.value = response.message || 'Không thể tải thông tin đơn hàng';
    }
  } catch (err) {
    console.error(err);
    order.value = null;
    error.value = 'Lỗi khi tải thông tin đơn hàng';
  }
};

const fetchProductDetails = async () => {
  try {
    const response = await ProductClientService.getAllChildProducts();
    if (response.status === 200 && response.data) {
      products.value = response.data;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error(err);
    products.value = [];
  }
};

const mapProductImageWithOrder = (productId: number): ProductResponseClient | undefined => {
  return products.value.find(product => product.id === productId);
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchProductDetails(), fetchOrderDetail()]);
  loading.value = false;
});
</script>

<style scoped>
.order-details {
  padding: 16px;
  background-color: #f9fafb;
}

h1 {
  margin-bottom: 20px;
}

.loading {
  font-style: italic;
}

.error {
  color: red;
  font-weight: bold;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}

table {
  border-collapse: collapse;
  width: 100%;
}

table th,
table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.product-img {
  width: 80px;
  height: auto;
  border-radius: 4px;
}
</style>
