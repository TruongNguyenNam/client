<template>
  <div>
    <h3 class="mb-3 text-xl font-semibold text-primary">📋 Danh sách hàng trả về </h3>
    <div class="mb-4 flex justify-end">
  <span class="p-input-icon-left">
    <i class="pi pi-search" />
   <InputText 
  v-model="searchTerm" 
  placeholder="Tìm theo mã hoàn hàng..." 
  class="w-72"
  @input="searchByCode"
/>

  </span>
</div>

   <DataTable
  :value="returnRequestListResponse"
  :loading="loading"
  dataKey="orderCode"
  :rows="5"
  :paginator="true"
  :rowsPerPageOptions="[5, 10, 20]"
  responsiveLayout="scroll"
  currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn"
>

      <Column header="Ảnh">
    <template #body="slotProps">
      <img
        :src="slotProps.data.thumbnailUrl"
        alt="Ảnh"
        style="width: 60px; height: 60px; object-fit: cover;"
      />
    </template>
  </Column>
      <Column field="code" header="Mã Hoàn hàng" sortable />
      <Column field="userName" header="userName" sortable />
      <Column field="requestDate" header="Ngày tạo" />
      <Column field="note" header="Ghi chú" />
      <Column field="totalProduct" header="Số SP" />
      <Column header="Thao tác">
  <template #body="slotProps">
    <router-link
      :to="`/admin/return-request/check-order-return-Detail/${slotProps.data.code}`"
      class="p-button p-button-sm p-button-outlined"
    >
      Xem chi tiết
    </router-link>
  </template>
</Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ref, onMounted } from 'vue';
import { ReturnOderService } from '../../../../service/admin/ReturnOderService';
import type { ReturnRequestListResponse } from '../../../../model/admin/returnOrder';
import InputText from 'primevue/inputtext'; // đừng quên import
const allReturnRequests = ref<ReturnRequestListResponse[]>([]);
const returnRequestListResponse = ref<ReturnRequestListResponse[]>([]);

const loading = ref(false);
const searchTerm = ref('');






const searchByCode = async () => {
  loading.value = true;
  try {
    if (!searchTerm.value.trim()) {
      returnRequestListResponse.value = allReturnRequests.value;
    } else {
      const result = await ReturnOderService.findByCode(searchTerm.value.trim());
      returnRequestListResponse.value = result;
    }
  } catch (error) {
    console.error('Lỗi khi tìm theo mã hoàn hàng:', error);
  } finally {
    loading.value = false;
  }
};



onMounted(async () => {
  loading.value = true;
  try {
    const res = await ReturnOderService.returnOrderApproved();
   allReturnRequests.value = res;
returnRequestListResponse.value = res;
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
h3 {
  margin-bottom: 1rem;
}

:deep(.p-datatable) {
  font-size: 14px;
}

:deep(.p-datatable thead th),
:deep(.p-datatable tbody td) {
  border: 1px solid #eee;
  padding: 0.75rem;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f9f9f9;
}
</style>
