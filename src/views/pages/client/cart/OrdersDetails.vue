<template>
  <div class="order-details">
    <h1>Đơn hàng chi tiết</h1>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="order" class="order-content">
      <!-- Khối thông tin đơn hàng -->
      
        <div class="grid grid-cols-2 gap-4" style="margin-top: 10px; margin-left: 3px;">
          <div class="card" style="width: 50%;">
            <h2>📦 Thông tin đơn hàng</h2>
            <p><strong>Mã đơn hàng:</strong> {{ order.orderCode }}</p>
            <p><strong>Ngày đặt:</strong> {{ order.orderDate }}</p>
            <p><strong>Trạng thái:</strong> {{ order.orderStatus }}</p>
            <p><strong>Tổng tiền:</strong> {{ order.orderTotal.toLocaleString() }} VNĐ</p>
          </div>

          <div class="card" style="width: 48%;">
              <h3>👤 Thông tin khách hàng</h3>
              <p><strong>Người đặt:</strong>
                <span v-if="order?.address?.username">{{ order.address.username }}</span>
                <span v-else>Vãng lai</span>
              </p>
              <p><strong>Email:</strong> {{ order?.address?.email }}</p>
              <p><strong>Người nhận:</strong> {{ order?.address?.receiverName }}</p>
              <p><strong>SĐT Người nhận:</strong> {{ order?.address?.receiverPhone }}</p>
              <p><strong>Ngày đặt:</strong> {{ formatDate(order?.orderDate) }}</p>
              <p><strong>Địa chỉ:</strong>
                {{ [
                  order?.address?.addressStreet,
                  order?.address?.addressWard,
                  order?.address?.addressDistrict,
                  order?.address?.addressCity,
                  order?.address?.addressProvince
                ].filter(Boolean).join(', ') || 'Chưa có thông tin' }}
              </p>
          </div>

          <div class="card" style="width: 50%;">
            <h3 class="mb-2 font-semibold text-lg">🚚 Vận chuyển</h3>
            <div v-if="order?.shipments && order.shipments.length > 0" class="space-y-1 text-gray-700">
              <p><strong>Trạng thái:</strong> {{ getShipmentStatusLabel(order?.shipments[0].shipmentStatus) }}</p>
              <p><strong>Đơn vị vận chuyển:</strong> {{ order?.shipments[0].carrierName }}</p>
              <p><strong>Mã theo dõi:</strong> {{ order?.shipments[0].trackingNumber }}</p>
              <p><strong>Phí vận chuyển:</strong> {{ order?.shipments[0].shippingCost?.toLocaleString('vi-VN') }} đ</p>
              <p><strong>Dự kiến giao:</strong> {{ formatDate(order?.shipments[0].estimatedDeliveryDate) }}</p>
            </div>
            <div v-else class="text-gray-500 italic">Không có thông tin vận chuyển</div>
          </div>

          <div class="card" style="width: 48%;">
            <h3>💳 Thông tin thanh toán</h3>
            <p><strong>Phương thức:</strong> {{ order?.payment?.paymentMethodName }}</p>
            <p><strong>Số tiền:</strong> {{ order?.payment?.amount.toLocaleString('vi-VN') }} đ</p>
            <p><strong>Tiền thừa:</strong> {{ order?.payment?.changeAmount.toLocaleString('vi-VN') }} đ</p>
            <p><strong>Ngày thanh toán:</strong> {{ formatDate(order?.payment?.paymentDate) }}</p>
            <p><strong>Trạng Thái:</strong> {{ getPaymentStatusLabel(order?.payment?.paymentStatus) }}</p>
            <p v-if="order?.payment?.paymentMethodName === 'VNPay'">
              <strong>Mã giao dịch:</strong> {{ order?.payment?.transactionId }}
            </p>
          </div>

        </div>
      <div class="card mb-4">
        <h3>Phiếu Giảm Giá</h3>
        <div v-if="order?.couponUsages?.length">
          <div v-for="coupon in order.couponUsages" :key="coupon.id" class="mb-2">
            <p><strong>Mã phiếu:</strong> {{ coupon.couponCode }}</p>
            <p><strong>Số tiền giảm:</strong> {{ coupon.discountAmount.toLocaleString('vi-VN') }} đ</p>
            <p><strong>Ngày sử dụng:</strong> {{ formatDate(coupon.usedDate) }}</p>
          </div>
        </div>
        <div v-else>
          <p>Không có phiếu giảm giá nào được áp dụng.</p>
        </div>
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

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const shipmentStatusLabels = {
  PENDING: 'Chờ xác nhận',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao hàng',
  RETURNED: 'Trả hàng',
  CANCELED: 'Hủy'
};

const OrderStatusLabels = {
  PENDING: 'Chờ xác nhận',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao hàng',
  RETURNED: 'Trả hàng',
  CANCELED: 'Hủy'
};

const paymentStatusLabels = {
  COMPLETED: 'Hoàn thành',
};

const getPaymentStatusLabel = (status?: string): string => {
  return paymentStatusLabels[status as keyof typeof paymentStatusLabels] || 'Không xác định';
};

const getOrdersByStatus = (status?: string): string => {
  return OrderStatusLabels[status as keyof typeof OrderStatusLabels] || 'Không xác định';
};

const getShipmentStatusLabel = (status: string): string => {
  return shipmentStatusLabels[status as keyof typeof shipmentStatusLabels] || 'Không xác định';
};

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
  flex-wrap: wrap;
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
