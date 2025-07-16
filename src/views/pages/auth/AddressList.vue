<template>
  <div class="address-container">
    <div class="address-header">
      <h2>Địa Chỉ Của Tôi</h2>
      <button class="add-btn" @click="onAdd">+ Thêm Địa Chỉ</button>
    </div>

    <div v-if="addresses.length === 0">Bạn chưa có địa chỉ nào.</div>

    <div v-for="address in addresses" :key="address.id" class="address-card">
      <div class="info">
        <div><strong>{{ address.receiverName }}</strong> - {{ address.phone }}</div>
        <div>{{ address.fullAddress }}</div>
      </div>
      <div class="actions">
        <span v-if="address.isDefault" class="default-tag">Mặc định</span>
        <button @click="onEdit(address)">Sửa</button>
        <button v-if="!address.isDefault" @click="setDefault(address)">Chọn làm mặc định</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Address } from '@/types';
import { AddressService } from '@/service/address/AddressService';

const addresses = ref<Address[]>([]);

const fetchAddresses = async () => {
  const userId = parseInt(sessionStorage.getItem('userId') || '0');
  const res = await AddressService.findByUserId(userId);
  addresses.value = res.data;
};

const onAdd = () => {
  // emit hoặc mở dialog thêm địa chỉ
};

const onEdit = (address: Address) => {
  // emit hoặc mở dialog sửa
};

const setDefault = async (address: Address) => {
  await AddressService.setDefault(address.id);
  await fetchAddresses();
};

onMounted(fetchAddresses);
</script>

<style scoped>
.address-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  background: #ee4d2d;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.address-card {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.actions button {
  margin-left: 10px;
  background: none;
  border: none;
  color: #1793e6;
  cursor: pointer;
}
.default-tag {
  background: #13c97a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
