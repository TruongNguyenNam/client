<template>
  <div class="cart-section">
    <TabView v-model:activeIndex="activeIndex">
      <TabPanel v-for="(invoice, index) in invoiceTabs" :key="invoice.id" :header="`HĐ${index + 1}`">
        <template #header>
          <span class="flex items-center">
            <Button
              icon="pi pi-times"
              class="ml-2 p-button-text p-button-danger p-0"
              @click.stop="$emit('remove-tab', index)"
            />
          </span>
        </template>

        <!-- Cart items as table -->
        <div v-if="invoice.items && invoice.items.length > 0" class="cart-items">
          <table class="cart-table">
            <thead>
              <tr>
                <th class="cart-table-header">STT</th>
                <th class="cart-table-header">Hình ảnh</th>
                <th class="cart-table-header">Tên sản phẩm</th>
                <th class="cart-table-header">Số lượng</th>
                <th class="cart-table-header">Đơn giá</th>
                <th class="cart-table-header">Tổng tiền</th>
                <th class="cart-table-header">Xóa</th>
              </tr>
            </thead>
            <tbody>
              <CartItem
                v-for="(item, itemIndex) in invoice.items"
                :key="itemIndex"
                :item="item"
                :index="itemIndex"
                @remove="$emit('remove-item', invoice, itemIndex)"
                @increment="$emit('increment-quantity', invoice, itemIndex)"
                @decrement="$emit('decrement-quantity', invoice, itemIndex)"
              />
            </tbody>
          </table>
        </div>
        <div v-else class="empty-cart">
          <i class="pi pi-shopping-cart empty-cart-icon"></i>
          <p>Chưa có sản phẩm nào. Vui lòng thêm sản phẩm.</p>
        </div>

        <!-- Cart footer -->
        <div class="cart-footer">
          <div class="cart-notes">
            <Button icon="pi pi-pencil" class="p-button-text p-button-sm" />
            <span>Ghi chú đơn hàng</span>
          </div>
          <div class="cart-total">
            <span>Tổng tiền hàng:</span>
            <span class="cart-total-amount">{{
              formatCurrency(invoice.orderTotal || 0).replace('₫', 'đ')
            }}</span>
          </div>
        </div>

        <!-- Payment button -->
        <div class="payment-button-container">
          <Button
            label="THANH TOÁN"
            icon="pi pi-check-circle"
            class="payment-button"
            @click="$emit('open-payment', invoice)"
            :disabled="!invoice.items || invoice.items.length === 0"
          />
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import CartItem from './CartItem.vue';
import type { OrderResponse } from '../../../../model/order';

const props = defineProps({
  invoiceTabs: {
    type: Array as () => OrderResponse[],
    required: true,
  },
  activeTabIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  'update:activeTabIndex',
  'remove-tab',
  'remove-item',
  'increment-quantity',
  'decrement-quantity',
  'open-payment',
]);

const activeIndex = computed({
  get: () => props.activeTabIndex,
  set: (value) => emit('update:activeTabIndex', value),
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
</script>

<style scoped>
.cart-section {
  width: 58%;
  margin-right: 40%;
  padding-right: 20px;
}

.cart-items {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
  overflow-x: auto;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table-header {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  background-color: #f9f9f9;
  border-bottom: 2px solid #e0e0e0;
}

.cart-table-header:nth-child(1) {
  width: 40px;
  text-align: center;
}

.cart-table-header:nth-child(2) {
  width: 80px;
}

.cart-table-header:nth-child(4) {
  width: 140px;
  text-align: center;
}

.cart-table-header:nth-child(5),
.cart-table-header:nth-child(6) {
  width: 120px;
  text-align: right;
}

.cart-table-header:nth-child(7) {
  width: 60px;
  text-align: center;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #9e9e9e;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
}

.empty-cart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px 0;
}

.cart-notes {
  display: flex;
  align-items: center;
  color: #757575;
}

.cart-total {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #e53935;
}

.payment-button-container {
  margin-top: 16px;
}

.payment-button {
  width: 100%;
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
}

.payment-button:hover {
  background-color: #43a047;
  border-color: #43a047;
}

@media (max-width: 992px) {
  .cart-section {
    width: 100%;
    margin-right: 0;
    padding-right: 0;
  }
}
</style>