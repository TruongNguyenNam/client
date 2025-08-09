<template>
  <div class="p-m-4" style="margin-top: 100px;">
    <h1>Danh sách đơn hàng của: {{ authStore.userInfo?.username }}</h1>
    <div v-if="loading">Đang tải...</div>
    <div v-if="error" class="p-error">{{ error }}</div>
    <DataTable v-if="orders.length" :value="orders" responsiveLayout="scroll" :paginator="true" :rows="5" class="custom-table">
      <Column field="stt" header="STT" sortable style="min-width: 50px; text-align: center;"></Column>
      <Column field="orderCode" header="Mã đơn hàng" sortable style="min-width: 150px;"></Column>
      <Column field="userName" header="Người đặt" sortable style="min-width: 120px;">
        <template #body="slotProps">
          {{ slotProps.data.userName || 'Chưa cập nhật' }}
        </template>
      </Column>
      <Column field="orderTotal" header="Tổng tiền" sortable style="min-width: 120px; text-align: right;">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.orderTotal) }}
        </template>
      </Column>
      <Column field="orderStatus" header="Trạng thái đơn" sortable style="min-width: 120px;">
        <template #body="slotProps">
          {{ formatOrderStatus(slotProps.data.orderStatus) }}
        </template>
      </Column>
      <Column field="shippingStatus" header="Trạng thái vận chuyển" sortable style="min-width: 150px;">
        <template #body="slotProps">
          {{ formatShippingStatus(slotProps.data.shippingStatus) }}
        </template>
      </Column>
      <Column field="actions" header="Hành động" style="min-width: 200px; text-align: center;">
        <template #body="slotProps">
          <button class="p-button p-button-info p-button-sm" @click="viewDetails(slotProps.data.orderCode)">Chi tiết</button>
          <button v-if="slotProps.data.orderStatus === OrderStatus.PENDING" class="p-button p-button-danger p-button-sm" style="margin-left: 10px;" @click="cancelOrder(slotProps.data.orderCode)">Huỷ Đơn</button>
        </template>
      </Column>
    </DataTable>
    <div v-else-if="!loading && !error" class="p-text-center">Không có đơn hàng nào.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useAuthStore } from '../../../../stores/auth';
import { CartClientService } from '../../../../service/client/CartClientService';
import type { OrderResponseClient, AddressResponse, ShipmentResponse, CouponResponse, OrderItemResponse, PaymentResponse } from '../../../../model/client/cart';

// Giả định enum OrderStatus (nếu chưa có, bạn cần định nghĩa)
enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  RETURNED = 'RETURNED'
}

const authStore = useAuthStore();
const orders = ref<OrderResponseClient[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Hàm định dạng trạng thái đơn hàng
const formatOrderStatus = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Đang chờ xác nhận';
    case OrderStatus.COMPLETED:
      return 'Hoàn thành';
    case OrderStatus.CANCELLED:
      return 'Huỷ bỏ';
    case OrderStatus.SHIPPED:
      return 'Đang giao';
    case OrderStatus.RETURNED:
      return 'Trả hàng';
    default:
      return status;
  }
};

// Hàm định dạng trạng thái vận chuyển
const formatShippingStatus = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Đang chờ';
    case 'SHIPPED':
      return 'Đang giao';
    case 'DELIVERED':
      return 'Đã giao';
    default:
      return status;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const fetchOrders = async () => {
  if (!authStore.userId) {
    error.value = 'Vui lòng đăng nhập để xem đơn hàng.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await CartClientService.getOrdersByUserId(authStore.userId);
    if (response.data) {
      orders.value = response.data.map((order, index) => ({
        ...order,
        stt: index + 1,
        userName: order.address?.receiverName || 'truongdz',
        shippingStatus: order.shipments?.[0]?.shipmentStatus || 'PENDING',
      }));
    } else {
      error.value = response.message || 'Không thể tải danh sách đơn hàng.';
    }
  } catch (err) {
    console.error('Lỗi khi gọi API getOrdersByUserId:', err);
    error.value = 'Đã xảy ra lỗi khi tải đơn hàng.';
  } finally {
    loading.value = false;
  }
};

const viewDetails = (orderCode: string) => {
  console.log('Xem chi tiết đơn hàng:', orderCode);
};

const cancelOrder = async (orderCode: string) => {
  if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    try {
      const response = await CartClientService.cancelOrderByCode(orderCode);
      if (response.data) {
        // Cập nhật danh sách đơn hàng sau khi hủy
        await fetchOrders();
        alert('Đơn hàng đã được hủy thành công.');
      } else {
        alert(response.message || 'Không thể hủy đơn hàng.');
      }
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      alert('Đã xảy ra lỗi khi hủy đơn hàng.');
    }
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.custom-table :deep(.p-datatable) {
  border: 1px solid #ddd;
  border-radius: 8px;
}
.custom-table :deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}
.custom-table :deep(.p-datatable .p-datatable-tbody > tr > td) {
  text-align: center;
}
.custom-table :deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(4)) {
  text-align: right;
}
.p-error {
  color: red;
}
.p-button-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}
.p-button-secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
}
.p-button-info {
  background-color: #007bff;
  border-color: #007bff;
}
.p-button-info:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
.p-button-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
.p-button-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}
.p-button-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>