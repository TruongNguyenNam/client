<template>
  <div class="admin-return-wrapper">
    <TabView v-model:activeIndex="activeTab" class="admin-return-tabs">
      <!-- Màn 1: Danh sách yêu cầu -->
      <TabPanel header="📋 Danh sách yêu cầu">
       <ReturnRequestList v-if="activeTab === 0" />
      </TabPanel>

      <!-- Màn 2: Kiểm tra hàng -->
      <TabPanel header="📦 Kiểm tra hàng trả về">
        <CheckReturnOrdor></CheckReturnOrdor>
      </TabPanel>

      <!-- Màn 3: Phản hồi & hoàn tiền -->
      <TabPanel header="📨 Phản hồi & hoàn tiền">
        <ReturnPrice/>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref,watch } from 'vue'
import ReturnRequestList from './ReturnRequestList.vue';
import CheckReturnOrdor from './CheckReturnOrdor.vue';
import ReturnPrice from './ReturnPrice.vue';

const activeTab = ref(0)
watch(activeTab, (newIndex) => {
  if (newIndex === 0) {
    console.log('🎯 Đang ở Tab 1 - Danh sách yêu cầu');
    // Gọi API hoặc xử lý tại đây nếu cần
    
  }
});
</script>

<style scoped lang="scss">
.admin-return-wrapper {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.06);
}

.admin-return-tabs {
  .p-tabview-nav {
    background: #f5f7fa;
    border-radius: 10px 10px 0 0;
    padding-left: 1rem;
  }

  .p-tabview-nav li {
    font-size: 1.05rem;
    font-weight: 600;
    color: #555;
    padding: 0.8rem 1.5rem;
    border-radius: 8px 8px 0 0;
    transition: all 0.3s ease;
  }

  .p-tabview-nav li.p-highlight {
    background-color: #ffffff;
    color: #1976d2;
    border-bottom: 3px solid #1976d2;
  }

  .p-tabview-panels {
    background: #fff;
    padding: 2rem;
    border-radius: 0 0 10px 10px;
    border: 1px solid #ddd;
    border-top: none;
  }
}
</style>
