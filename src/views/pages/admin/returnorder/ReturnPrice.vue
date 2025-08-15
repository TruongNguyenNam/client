<template>
  <div class="p-6 bg-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Danh sách hoàn tiền</h2>

    <div v-if="loading" class="flex justify-center items-center h-32">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else-if="data.length">
      <DataTable
        :value="data"
        stripedRows
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <Column field="userName" header="Người dùng" :sortable="true"></Column>
        <Column field="productName" header="tên sản phẩm" :sortable="true"></Column>
        <Column field="bankAccountNumber" header="Số tài khoản" :sortable="true"></Column>
        <Column field="bankAccountName" header="Chủ tài khoản" :sortable="true"></Column>
        <Column field="bankName" header="Ngân hàng" :sortable="true"></Column>
        <Column header="tiền cần hoàn" :sortable="true">
          <template #body="{ data }">
            {{ formatCurrency(data.totalPrice) }}
          </template>
        </Column>
        <Column header="Trạng thái">
          <template #body="{ data }">
            <Button 
              v-if="!data.isCompleted"
              label="Xác nhận đã chuyển" 
              icon="pi pi-check" 
              class="p-button-sm p-button-success"
              @click="confirmTransfer(data)"
            />
            <Tag 
              v-else
              severity="success" 
              icon="pi pi-check" 
              value="Đã xác nhận" 
              rounded 
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-else class="flex justify-center items-center h-32">
      <Message severity="info" :closable="false">Không có dữ liệu hoàn tiền</Message>
    </div>

    <Dialog 
      v-model:visible="displayConfirmation" 
      header="Xác nhận" 
      :modal="true"
      :style="{ width: '350px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Bạn chắc chắn đã chuyển tiền cho {{ selectedItem?.userName }}?</span>
      </div>
      <template #footer>
        <Button label="Không" icon="pi pi-times" @click="displayConfirmation = false" class="p-button-text"/>
        <Button label="Có" icon="pi pi-check" @click="completeTransfer" class="p-button-success" autofocus />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ReturnOderService } from '../../../../service/admin/ReturnOderService';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const data = ref([]);
const loading = ref(true);
const error = ref(null);
const displayConfirmation = ref(false);
const selectedItem = ref(null);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const confirmTransfer = (item) => {
  selectedItem.value = item;
  displayConfirmation.value = true;
};

const completeTransfer = async () => {
  try {
    // Gọi API để xác nhận chuyển tiền
    await ReturnOderService.updateStatus(selectedItem.value.idReturnRequestItem);

    // Hiển thị thông báo thành công
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã xác nhận chuyển tiền',
      life: 3000
    });

    // Load lại dữ liệu bảng từ server
    loading.value = true;
    const response = await ReturnOderService.returnPrice();
    // Thêm trường isCompleted mặc định false cho tất cả
    data.value = response.map(item => ({ ...item, isCompleted: false }));

  } catch (err) {
    // Hiển thị thông báo lỗi nếu có
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Xác nhận thất bại',
      life: 3000
    });
  } finally {
    // Đóng popup xác nhận và tắt loading
    displayConfirmation.value = false;
    loading.value = false;
  }
};


onMounted(async () => {
  try {
    const response = await ReturnOderService.returnPrice();
    // Thêm trường isCompleted để theo dõi trạng thái
    data.value = response.map(item => ({ ...item, isCompleted: false }));
  } catch (err) {
    error.value = err.message || 'Lỗi không xác định';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.p-datatable {
  @apply border border-gray-200 rounded-lg;
}

.p-datatable :deep(.p-datatable-thead) th {
  @apply bg-gray-100 text-gray-700 font-semibold;
}

.p-datatable :deep(.p-datatable-tbody) tr {
  @apply hover:bg-blue-50 transition-colors duration-150;
}

.confirmation-content {
  @apply flex items-center;
}
</style>