<template>
  <div>
    <h3 class="mb-3 text-xl font-semibold text-primary">📋 Danh sách yêu cầu hoàn hàng</h3>

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
      <Column field="userName" header="Người hoàn" sortable />
      <Column field="requestDate" header="Ngày tạo" />
      <Column field="note" header="Ghi chú" />
      <Column field="totalProduct" header="Số SP" />
      <Column header="Thao tác">
  <template #body="slotProps">
    <router-link
      :to="`/admin/return-request/detail/${slotProps.data.code}`"
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
import { ref, onMounted } from 'vue';
import { ReturnOderService } from '../../../../service/admin/ReturnOderService';
import type { ReturnRequestListResponse } from '../../../../model/admin/returnOrder';

const returnRequestListResponse = ref<ReturnRequestListResponse[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await ReturnOderService.getAllReturnRequests();
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
