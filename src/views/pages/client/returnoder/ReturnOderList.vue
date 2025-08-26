<template>
  <div class="p-5 max-w-7xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-primary">Đơn hàng của tôi</h2>

    <!-- Trạng thái không có đơn hàng -->
    <div v-if="orders.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
      <i class="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
      <p class="text-gray-600 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
      <RouterLink to="/client/product">
      <Button label="Tiếp tục mua sắm" icon="pi pi-shopping-cart" class="p-button-outlined" />
      </RouterLink>
    </div>

    <!-- Danh sách đơn hàng, không cuộn ngang, tự xuống dòng -->
    <div class="flex flex-wrap -mx-2 gap-y-4" v-else>
      <div 
        v-for="(order, index) in orders"
        :key="index"
        class="flex-shrink-0 w-80 mx-2"
      >
        <div class="border border-gray-200 rounded-lg p-4 bg-white h-full">
          <!-- Header đơn hàng -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-sm">#{{ order.code }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(order.orderDate) }}</p>
            </div>
          <span class="status-badge" :class="statusClasses(order.status)">
            {{ order.status }}
          </span>

          </div>

          <!-- Danh sách sản phẩm cuộn ngang -->
          <div class="flex overflow-x-auto pb-2 scrollbar-hide">
            <div 
              v-for="(product, pIndex) in order.productResponses"
              :key="pIndex"
              class="flex-shrink-0 w-24 mr-3"
            >
              <img 
                :src="product.imageUrl" 
                alt="Product" 
                class="w-full h-20 object-contain rounded border"
              />
              <p class="text-xs font-medium mt-1 truncate">{{ product.productName }}</p>
              <p class="text-xs text-gray-600">{{ product.quantity }} × {{ formatCurrency(product.unitPrice) }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center mt-3 pt-3 border-t">
            <p class="text-sm font-bold">{{ formatCurrency(order.orderTotal) }}</p>
            <RouterLink :to="`/returnoderdetail/${order.code}`">
              <Button label="Chi tiết" icon="pi pi-chevron-right" class="p-button-text p-button-sm" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import { ReturnOrderClientService } from '../../../../service/client/ReturnOrderService';
import type { ReturnOrderResponse } from '../../../../model/client/ReturnOrder';

const orders = ref<ReturnOrderResponse[]>([]);

onMounted(async () => {
  try {
    const data = await ReturnOrderClientService.getAllReturnOrders();
    orders.value = data;
  } catch (error) {
    console.error('Không thể lấy đơn hàng hoàn:', error);
  }
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${formattedDate}, ${formattedTime}`;
};


const statusClasses = (status: string) => {
  switch (status) {
    case 'Đang xử lý': return 'bg-blue-100 text-blue-800';
    case 'Đang giao': return 'bg-yellow-100 text-yellow-800';
    case 'Hoàn thành': return 'bg-green-100 text-green-800';
    case 'Đã hủy': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<style scoped>
/* Ẩn thanh cuộn ngang cho danh sách sản phẩm */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}

/* Kích thước thẻ đơn hàng */
.w-80 {
  width: 20rem;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Sản phẩm trong đơn */
.w-24 {
  width: 6rem;
}

.h-20 {
  height: 5rem;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Margin để căn giữa */
.-mx-2 {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.status-badge {
  margin-left: 10px;
  display: inline-block;
  padding: 0.15rem 0.5rem; /* Thu nhỏ padding ngang lại */
  max-width: 6rem;  
  height: 30px;        /* Giới hạn chiều rộng tối đa */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
     /* Bo tròn hết */
  font-size: 0.75rem;       /* Font nhỏ hơn */
  text-align: center;
}

</style>
