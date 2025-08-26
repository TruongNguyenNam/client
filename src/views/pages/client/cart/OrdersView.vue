<template>
  <div class="p-m-4 mt-6">
    <h1 class="page-title" style="margin-top: 100px;">
      Danh sách đơn hàng của: {{ authStore.userInfo?.username }}
    </h1>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-if="error" class="p-error">{{ error }}</div>

    <DataTable
      v-if="orders.length"
      :value="orders"
      responsiveLayout="scroll"
      :paginator="true"
      :rows="5"
      class="custom-table"
    >
      <Column field="stt" header="STT" style="width: 60px; text-align: center;" />
      <Column field="orderCode" header="Mã đơn hàng" style="min-width: 150px;" />
      <Column field="userName" header="Người đặt" style="min-width: 120px;">
        <template #body="{ data }">
          {{ data.userName || 'Chưa cập nhật' }}
        </template>
      </Column>
      <Column field="createdDate" header="Ngày tạo" style="min-width: 130px;">
        <template #body="{ data }">
          {{ formatDate(data.createdDate) }}
        </template>
      </Column>
      <Column field="orderTotal" header="Tổng tiền" style="min-width: 120px; text-align: right;">
        <template #body="{ data }">
          {{ formatCurrency(data.orderTotal) }}
        </template>
      </Column>
      <Column field="orderStatus" header="Trạng thái đơn" style="min-width: 140px;">
        <template #body="{ data }">
          {{ formatOrderStatus(data.orderStatus) }}
        </template>
      </Column>
      <Column field="shippingStatus" header="Vận chuyển" style="min-width: 150px;">
        <template #body="{ data }">
          {{ formatShippingStatus(data.shippingStatus) }}
        </template>
      </Column>
      <Column header="Hành động" style="min-width: 200px; text-align: center;">
        <template #body="{ data }">
          <button class="p-button p-button-info p-button-sm" @click="viewDetails(data.orderCode)">
            Chi tiết
          </button>
          <button
            v-if="data.orderStatus === OrderStatus.PENDING"
            class="p-button p-button-danger p-button-sm ml-2"
            @click="cancelOrder(data.orderCode)"
          >
            Huỷ Đơn
          </button>
        </template>
      </Column>
    </DataTable>

    <div v-else-if="!loading && !error" class="p-text-center">
      Không có đơn hàng nào.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useAuthStore } from '../../../../stores/auth';
import { CartClientService } from '../../../../service/client/CartClientService';
import type { OrderResponseClient } from '../../../../model/client/cart';
import { useRouter } from 'vue-router';

enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  RETURNED = 'RETURNED',
  CONFIRMED = 'CONFIRMED'
}

const authStore = useAuthStore();
const orders = ref<OrderResponseClient[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();

const formatOrderStatus = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'Đang chờ xác nhận',
    COMPLETED: 'Hoàn thành',
    CONFIRMED: 'xác nhận',
    CANCELLED: 'Huỷ bỏ',
    SHIPPED: 'Đang giao',
    RETURNED: 'Trả hàng'
  };
  return map[status] || status;
};

const formatShippingStatus = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'Đang chờ',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    RETURNED:'Trả Hàng',
    CANCELED:'Huỷ'
  };
  return map[status] || status;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const fetchOrders = async () => {
  if (!authStore.userId) {
    error.value = 'Vui lòng đăng nhập để xem đơn hàng.';
    return;
  }
  loading.value = true;
  try {
    const response = await CartClientService.getOrdersByUserId(authStore.userId);
    if (response.data) {
      orders.value = response.data.map((order, index) => ({
        ...order,
        stt: index + 1,
        userName: order.address?.receiverName || 'Chưa cập nhật',
        shippingStatus: order.shipments?.[0]?.shipmentStatus || 'PENDING'
      }));
      console.log(orders)
    } else {
      error.value = response.message || 'Không thể tải danh sách đơn hàng.';
    }
  } catch (err) {
    console.error(err);
    error.value = 'Lỗi khi tải đơn hàng.';
  } finally {
    loading.value = false;
  }
};

const viewDetails = (orderCode: string) => {
  router.push({ 
    name: 'client-order-details', 
    params: { orderCode } 
  });
};

const cancelOrder = async (orderCode: string) => {
  if (confirm('Bạn có chắc muốn huỷ đơn hàng này?')) {
    const response = await CartClientService.cancelOrderByCode(orderCode);
    if (response.data) {
      await fetchOrders();
      alert('Huỷ thành công!');
    } else {
      alert(response.message || 'Không thể huỷ đơn.');
    }
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.loading {
  font-size: 1.2rem;
  color: #007bff;
}
.custom-table :deep(.p-datatable) {
  border: 1px solid #ddd;
  border-radius: 8px;
}
.custom-table :deep(.p-datatable-thead > tr > th) {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}
.custom-table :deep(.p-datatable-tbody > tr > td) {
  text-align: center;
}
.custom-table :deep(.p-datatable-tbody > tr > td:nth-child(5)) {
  text-align: right;
}
.p-error {
  color: red;
}
.ml-2 {
  margin-left: 10px;
}
</style>
