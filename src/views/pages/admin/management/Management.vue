<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { OrderService } from "../../../../service/admin/OrderService";
import 'primeicons/primeicons.css';


const route = useRoute();
const orderId = route.params.id;
const order = ref(null);

onMounted(async () => {
  const response = await OrderService.getOrderById(orderId);
  order.value = response?.data;
  console.log("📦 Đơn hàng đã gán vào biến order:", order.value);
});
</script>

<template>
  <div class="p-4 w-full max-w-6xl mx-auto">
    <h5 class="text-2xl font-bold text-gray-800 mb-6">
      Chi tiết đơn hàng: {{ order?.orderCode }}
    </h5>

    <!-- THÔNG TIN CHUNG -->
    <div class="space-y-6">
      <!-- CARD: Thông tin đơn hàng -->
      <div class="bg-white border-2 border-gray-300 rounded-xl shadow p-6">
        <h6 class="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
          <i class="pi pi-file"></i> Thông tin đơn hàng
        </h6>
        <div class="space-y-1 text-gray-700">
          <p><strong>Mã đơn hàng:</strong> {{ order?.orderCode }}</p>
          <p><strong>Thời gian đặt:</strong> {{ new Date(order?.orderDate).toLocaleString("vi-VN") }}</p>
          <p><strong>Trạng thái:</strong> {{ order?.orderStatus }}</p>
          <p><strong>Loại đơn:</strong> {{ order?.isPos ? "Tại quầy" : "Ship" }}</p>
          <p><strong>Tổng tiền:</strong> {{ order?.orderTotal?.toLocaleString("vi-VN") }} đ</p>
        </div>
      </div>

      <!-- CARD: Thông tin người đặt -->
      <div class="bg-white border-2 border-gray-300 rounded-xl shadow p-6">
        <h6 class="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
          <i class="pi pi-user"></i> Thông tin người đặt
        </h6>
        <div class="space-y-1 text-gray-700">
          <p><strong>Họ tên:</strong> {{ order?.address?.username }}</p>
          <p><strong>Email:</strong> {{ order?.address?.email }}</p>
          <p><strong>SĐT:</strong> {{ order?.address?.phoneNumber }}</p>
          <p><strong>Địa chỉ:</strong>
            {{
              [order?.address?.addressStreet, order?.address?.addressWard,
              order?.address?.addressDistrict, order?.address?.addressProvince,
              order?.address?.addressCountry].filter(Boolean).join(", ")
            }}
          </p>
        </div>
      </div>

      <!-- CARD: Thông tin thanh toán -->
      <div class="bg-white border-2 border-gray-300 rounded-xl shadow p-6">
        <h6 class="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
          <i class="pi pi-credit-card"></i> Thông tin thanh toán
        </h6>
        <div class="space-y-1 text-gray-700">
          <p><strong>Phương thức:</strong> {{ order?.payment?.paymentMethodName }}</p>
          <p><strong>Trạng thái:</strong> {{ order?.payment?.paymentStatus }}</p>
          <p><strong>Số tiền thanh toán:</strong> {{ order?.payment?.amount?.toLocaleString("vi-VN") }} đ</p>
          <p><strong>Số tiền thừa:</strong> {{ order?.payment?.changeAmount?.toLocaleString("vi-VN") }} đ</p>
          <p><strong>Thời gian thanh toán:</strong> {{ new Date(order?.payment?.paymentDate).toLocaleString("vi-VN") }}</p>
        </div>
      </div>

      <!-- CARD: Thông tin vận chuyển -->
      <div class="bg-white border-2 border-gray-300 rounded-xl shadow p-6">
        <h6 class="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
          <i class="pi pi-truck"></i> Thông tin vận chuyển
        </h6>
        <div class="space-y-1 text-gray-700">
          <p><strong>Đơn vị:</strong> {{ order?.shipment?.carrierName }}</p>
          <p><strong>Mã vận đơn:</strong> {{ order?.shipment?.trackingNumber }}</p>
          <p><strong>Trạng thái:</strong> {{ order?.shipment?.shipmentStatus }}</p>
          <p><strong>Ngày giao dự kiến:</strong> {{ new Date(order?.shipment?.estimatedDeliveryDate).toLocaleString("vi-VN") }}</p>
          <p><strong>Ngày giao thực tế:</strong> {{ new Date(order?.shipment?.shipmentDate).toLocaleString("vi-VN") }}</p>
        </div>
      </div>
    </div>

    <!-- BẢNG SẢN PHẨM -->
    <div class="bg-white shadow-lg rounded-2xl border mt-0 overflow-hidden">
  <h6 class="text-lg font-semibold px-6 py-4 text-red-600 flex items-center gap-2 bg-gray-50 border-b">
    <i class="pi pi-shopping-cart text-xl"></i> Sản phẩm đã đặt
  </h6>
  <div class="overflow-x-auto">
    <table class="min-w-full text-sm text-left">
      <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
        <tr>
          <th class="px-6 py-3 border-b">STT</th>
          <th class="px-6 py-3 border-b">Tên sản phẩm</th>
          <th class="px-6 py-3 border-b text-center">Số lượng</th>
          <th class="px-6 py-3 border-b text-right">Đơn giá</th>
          <th class="px-6 py-3 border-b text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr
          v-for="(item, index) in order?.items"
          :key="index"
          class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-6 py-4">{{ index + 1 }}</td>
          <td class="px-6 py-4 font-medium text-gray-800">{{ item.productName }}</td>
          <td class="px-6 py-4 text-center">{{ item.quantity }}</td>
          <td class="px-6 py-4 text-right text-blue-600">
            {{ item.unitPrice?.toLocaleString("vi-VN") }} đ
          </td>
          <td class="px-6 py-4 text-right font-semibold text-green-600">
            {{ (item.unitPrice * item.quantity)?.toLocaleString("vi-VN") }} đ
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

  </div>
</template>




