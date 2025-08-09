<template>
  <div id="print-invoice">
    <div class="text-center mb-4">
      <img src="" alt="Logo công ty" class="h-16 mx-auto mb-2" />
      <h2 class="font-bold text-xl">CỬA HÀNG BÁN GIÀY THỂ THAO SHOESHOP</h2>
      <p class="text-sm">Địa chỉ: 13 Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội.</p>
      <p class="text-sm">Hotline: 0123 456 789</p>
    </div>

    <h2 class="text-center font-bold text-xl mb-4">HÓA ĐƠN THANH TOÁN</h2>

    <div class="mb-3">
      <p><strong>Ngày in:</strong> {{ currentDate }}</p>
      <p><strong>Mã đơn:</strong> {{ invoice.orderCode }}</p>
      <p><strong>Khách hàng:</strong> {{ invoice.customerName }}</p>
      <p><strong>SĐT:</strong> {{ invoice.phoneNumber }}</p>
      <p><strong>Địa chỉ:</strong>
        {{ invoice.addressStreet || '' }},
        {{ invoice.addressWard || '' }},
        {{ invoice.addressDistrict || '' }},
        {{ invoice.addressProvince || '' }}
      </p>
    </div>

    <table class="w-full border-collapse border border-black mb-3">
      <thead>
        <tr>
          <th class="border border-black p-1">STT</th>
          <th class="border border-black p-1">Sản phẩm</th>
          <th class="border border-black p-1">Số lượng</th>
          <th class="border border-black p-1">Đơn giá</th>
          <th class="border border-black p-1">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td class="border border-black p-1 text-center">{{ index + 1 }}</td>
          <td class="border border-black p-1">{{ item.name || '---' }}</td>
          <td class="border border-black p-1 text-center">{{ safeNumber(item.quantity) }}</td>
          <td class="border border-black p-1 text-right">{{ formatCurrency(safeNumber(item.price)) }}</td>
          <td class="border border-black p-1 text-right">
            {{ formatCurrency(safeNumber(item.price) * safeNumber(item.quantity)) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="text-right space-y-1">
      <p><strong>Tổng tiền hàng:</strong> {{ formatCurrency(invoice.orderTotal) }}</p>
      <p><strong>Số tiền giảm:</strong> {{ formatCurrency(invoice.discount) }}</p>
      <p><strong>Khách thanh toán:</strong> {{ formatCurrency(invoice.paidAmount) }}</p>
      <p><strong>Tiền thừa:</strong> {{ formatCurrency(changeAmount) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

const { invoice, changeAmount } = defineProps<{
  invoice: {
    orderCode: string;
    userId: number | null;
    customerName: string;
    phoneNumber: string;
    email: string;
    addressStreet: string;
    addressWard: string;
    addressDistrict: string;
    addressProvince: string;
    addressCity: string;
    addressZipcode: string;
    isPos: boolean;
    carrierId: number | null;
    estimatedDeliveryDate: Date | null;
    orderTotal: number;
    discount: number;
    couponUsageIds: number[];
    paidAmount: number | null;
    paymentMethodId: number | null;
    paymentMethod: string;
    notes: string;
    items: { name: string; price: number; quantity: number }[]; // giữ lại để in hóa đơn
  };
  changeAmount: number | null;
}>();


const currentDate = new Date().toLocaleString('vi-VN');
const items = computed(() => invoice?.items || []);

const safeNumber = (value: number | null | undefined): number => {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

const formatCurrency = (value: number | null | undefined) => {
  return (value ?? 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).replace('₫', 'đ');
};
onMounted(() => {
  console.log('🧾 Address:', {
    street: invoice.addressStreet,
    ward: invoice.addressWard,
    district: invoice.addressDistrict,
    province: invoice.addressProvince
  });
});

onMounted(() => {
  console.log("🔍 Invoice data:", invoice);
  console.log("🧾 Items:", invoice.items);
});
</script>


<style scoped>
#print-invoice {
  font-family: Arial, sans-serif;
  font-size: 14px;
  padding: 20px;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: bold;
}

.body {
  font-family: Arial;
  padding: 20px;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.th,
td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.h2,
h3,
h4 {
  margin: 0 0 10px 0;
  text-align: center;
}
</style>
