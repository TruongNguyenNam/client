<template>
  <div class="p-5">
    <Toast />
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-primary">
        🧾 Chi tiết đơn hoàn hàng: {{ orderCode }}
       
      </h2>
       
      <Button
        icon="pi pi-arrow-left"
        class="p-button-text p-button-sm"
        @click="goBack"
        v-tooltip="'Quay lại'"
      />
    </div>
     <h2 class="text-xl font-bold text-primary"> Đối chiếu với sản phẩm nhận được</h2>

     
    <DataTable
      :value="returnRequestListResponse"
      :loading="loading"
      dataKey="id"
      :rows="5"
      paginator
      responsiveLayout="scroll"
      currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} sản phẩm"
    >
      <!-- Các Column giữ nguyên -->
      <Column header="Ảnh" style="width: 80px">
        <template #body="slotProps">
          <img
            :src="slotProps.data.imageProduct"
            alt="Ảnh sản phẩm"
            class="product-image"
          />
        </template>
      </Column>

      <Column field="productName" header="Tên sản phẩm" style="min-width: 180px">
        <template #body="slotProps">
          <div class="font-medium line-clamp-2">
            {{ slotProps.data.productName }}
          </div>
        </template>
      </Column>

      <Column field="reason" header="Lý do trả" style="min-width: 150px">
        <template #body="slotProps">
          <div class="line-clamp-2">
            {{ slotProps.data.reason }}
          </div>
        </template>
      </Column>

      <Column field="note" header="Ghi chú" style="min-width: 250px">
        <template #body="slotProps">
          <div class="note-text bg-gray-50 p-2 rounded">
            <template v-if="slotProps.data.note">
              {{ slotProps.data.note }}
            </template>
            <span v-else class="text-gray-400">Không có ghi chú</span>
          </div>
        </template>
      </Column>

      <Column field="quantity" header="SL trả" style="width: 90px" class="text-center">
        <template #body="slotProps">
          <span class="font-medium">
            {{ slotProps.data.quantity }}
          </span>
        </template>
      </Column>

      <Column field="unitPrice" header="Đơn giá" style="width: 130px" class="text-right">
        <template #body="slotProps">
          <span class="font-medium">
            {{ formatCurrency(slotProps.data.unitPrice) }}
          </span>
        </template>
      </Column>

      <Column field="totalRefundAmount" header="Thành tiền" style="width: 140px" class="text-right">
        <template #body="slotProps">
          <span class="font-medium text-primary">
            {{ formatCurrency(slotProps.data.totalRefundAmount) }}
          </span>
        </template>
      </Column>

      <Column field="status" header="Trạng thái" style="width: 140px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
        </template>
      </Column>

      <Column header="Media" style="width: 100px" class="text-center">
        <template #body="slotProps">
          <Button
            icon="pi pi-images"
            class="p-button-text p-button-sm"
           @click="showMediaById(slotProps.data.id)"
            :disabled="!hasMedia(slotProps.data)"
            v-tooltip="getMediaTooltip(slotProps.data)"
          />
        </template>
      </Column>

      <Column header="Thao tác" style="width: 150px">
        <template #body="slotProps">
          <div class="flex justify-center gap-2">
           <Button
  icon="pi pi-check"
  class="p-button-sm p-button-success"
  @click="showApproveDialog(slotProps.data.id)"
  v-tooltip="'Duyệt yêu cầu'"
/>
            <Button
              icon="pi pi-times"
              class="p-button-sm p-button-danger"
              @click="showRejectDialog(slotProps.data.id)"
              v-tooltip="'Từ chối yêu cầu'"
             
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog hiển thị media -->
    <Dialog
      v-model:visible="mediaDialogVisible"
      header="Hình ảnh/video đính kèm"
      :modal="true"
      :style="{ width: '70vw', maxWidth: '800px' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <div v-if="selectedMedia.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(media, index) in selectedMedia"
          :key="index"
          class="relative rounded-lg overflow-hidden border border-gray-200"
        >
          <video
            v-if="media.type?.toUpperCase() === 'VIDEO'"
            :src="media.url"
            controls
            class="w-full h-auto max-h-64 object-contain"
          />
          <img
            v-else
            :src="media.url"
            alt="Ảnh đính kèm"
            class="w-full h-auto max-h-64 object-contain"
          />
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-500">
        Không có media nào
      </div>
      <template #footer>
        <Button
          label="Đóng"
          icon="pi pi-times"
          class="p-button-text"
          @click="mediaDialogVisible = false"
        />
      </template>
    </Dialog>

    <!-- Dialog nhập lý do từ chối -->
    <Dialog
      v-model:visible="rejectDialogVisible"
      header="Từ chối yêu cầu hoàn hàng"
      :modal="true"
      :style="{ width: '50vw', maxWidth: '600px' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <div class="field">
        <label for="adminNote" class="block mb-2 font-medium">Lý do từ chối <span class="text-red-500">*</span></label>
        <Textarea
          id="adminNote"
          v-model="rejectReason"
          rows="5"
          class="w-full"
          placeholder="Nhập lý do từ chối yêu cầu hoàn hàng..."
          :autoResize="true"
        />
        <small class="text-gray-500">Vui lòng nhập lý do rõ ràng để khách hàng hiểu</small>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Hủy bỏ"
            icon="pi pi-times"
            class="p-button-text"
            @click="cancelReject"
          />
          <Button
            label="Xác nhận từ chối"
            icon="pi pi-check"
            class="p-button-danger"
            @click="confirmReject"
            :disabled="!rejectReason.trim()"
          />
        </div>
      </template>
    </Dialog>
    <!-- Dialog chọn kiểu duyệt -->
<Dialog
  v-model:visible="approveDialogVisible"
  header="Xác nhận duyệt yêu cầu"
  :modal="true"
  :style="{ width: '450px' }"
>
  <div class="mb-4">
    <label class="font-semibold block mb-3">Chọn cách xử lý hàng hoàn:</label>
    
    <div class="flex flex-col gap-3">
      <div class="flex items-center">
        <RadioButton 
          v-model="selectedApproveStatus" 
          inputId="returnToStock" 
          name="approveOption" 
          value="RETURNED_TO_STOCK" 
        />
        <label for="returnToStock" class="ml-2 cursor-pointer">
          <span class="font-medium">✅ Cộng lại kho</span>
          <p class="text-sm text-gray-600 mt-1">Hàng còn tốt, có thể bán lại</p>
        </label>
      </div>
      
      <div class="flex items-center">
        <RadioButton 
          v-model="selectedApproveStatus" 
          inputId="discarded" 
          name="approveOption" 
          value="DISCARDED" 
        />
        <label for="discarded" class="ml-2 cursor-pointer">
          <span class="font-medium">🗑️ Không cộng kho</span>
          <p class="text-sm text-gray-600 mt-1">Hàng hỏng, không thể bán lại</p>
        </label>
      </div>
    </div>
  </div>

  <template #footer>
    <Button label="Hủy" class="p-button-text" @click="cancelApprove" />
    <Button
      label="Xác nhận duyệt"
      icon="pi pi-check"
      class="p-button-success"
      :disabled="!selectedApproveStatus"
      @click="confirmApprove"
    />
  </template>
</Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ReturnOderService } from '../../../../service/admin/ReturnOderService';
import type { ReturnRequestItemResponse, ReturnMediaAdminResponse, ReturnRequestListRequest } from '../../../../model/admin/returnOrder';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const orderCode = route.params.orderCode as string;

const returnRequestListResponse = ref<ReturnRequestItemResponse[]>([]);
const loading = ref(false);

// Dialog media
const mediaDialogVisible = ref(false);
const selectedMedia = ref<ReturnMediaAdminResponse[]>([]);

// Dialog từ chối
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentRejectId = ref<number | null>(null);

// Thay đổi các biến liên quan
const approveDialogVisible = ref(false);
const selectedApproveStatus = ref<string | null>(null);
const currentApproveId = ref<number | null>(null);

const showApproveDialog = (id: number) => {
  currentApproveId.value = id;
  selectedApproveStatus.value = null; // Reset lựa chọn khi mở dialog
  approveDialogVisible.value = true;
};

const cancelApprove = () => {
  approveDialogVisible.value = false;
  currentApproveId.value = null;
  selectedApproveStatus.value = null;
};

const confirmApprove = async () => {
  if (!currentApproveId.value || !selectedApproveStatus.value) return;

  try {
    loading.value = true;
    
    // Tạo thông báo tùy theo lựa chọn
    let adminNote = '';
    if (selectedApproveStatus.value === 'RETURNED_TO_STOCK') {
      adminNote = 'Yêu cầu đã được duyệt. Hàng sẽ được cộng lại kho.';
    } else {
      adminNote = 'Yêu cầu đã được duyệt. Hàng không được cộng lại kho do tình trạng không đảm bảo.';
    }

    const requestData: ReturnRequestListRequest = {
      adminNote: adminNote
    };

    await ReturnOderService.responseReturnRequestItem(
      currentApproveId.value,
      selectedApproveStatus.value,
      requestData
    );

    toast.add({
      severity: 'success',
      summary: 'Đã duyệt',
      detail: selectedApproveStatus.value === 'RETURNED_TO_STOCK' 
        ? 'Hàng sẽ được cộng lại kho' 
        : 'Hàng không được cộng kho',
      life: 3000
    });

    // Làm mới dữ liệu
    const res = await ReturnOderService.getReturnItemsByOrderCodeApproved(orderCode);
    returnRequestListResponse.value = res;

    // Đóng dialog
    cancelApprove();
  } catch (error) {
    console.error('Lỗi khi duyệt yêu cầu:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể duyệt yêu cầu',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
const goBack = () => {
  router.back();
};

const hasMedia = (item: ReturnRequestItemResponse) => {
  return item.returnMediaAdminResponses?.length > 0;
};

const getMediaTooltip = (item: ReturnRequestItemResponse) => {
  return hasMedia(item) 
    ? `Xem ${item.returnMediaAdminResponses?.length} hình ảnh/video` 
    : 'Không có media';
};

const showMediaById = (id: number) => {
  const item = returnRequestListResponse.value.find(item => item.id === id);
  if (item && item.returnMediaAdminResponses) {
    selectedMedia.value = item.returnMediaAdminResponses;
    mediaDialogVisible.value = true;
  } else {
    selectedMedia.value = [];
    toast.add({
      severity: 'warn',
      summary: 'Không có media',
      detail: 'Sản phẩm này không có hình ảnh/video đính kèm',
      life: 3000
    });
  }
};

// Hiển thị dialog từ chối
const showRejectDialog = (id: number) => {
  currentRejectId.value = id;
  rejectDialogVisible.value = true;
};

// Hủy bỏ từ chối
const cancelReject = () => {
  rejectReason.value = '';
  rejectDialogVisible.value = false;
  currentRejectId.value = null;
};

// Xác nhận từ chối
const confirmReject = async () => {
  if (!currentRejectId.value || !rejectReason.value.trim()) return;

  try {
    loading.value = true;
    
    const requestData: ReturnRequestListRequest = {
      adminNote: rejectReason.value
    };
    
    await ReturnOderService.responseReturnRequestItem(
      currentRejectId.value, 
      'REJECTED',
      requestData
    );
    
    toast.add({
      severity: 'warn',
      summary: 'Đã từ chối',
      detail: 'Yêu cầu hoàn hàng đã bị từ chối',
      life: 3000,
    });

    // Làm mới dữ liệu
    const res = await ReturnOderService.getReturnItemsByOrderCodeApproved(orderCode);
    returnRequestListResponse.value = res;
    
    // Đóng dialog và reset
    cancelReject();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể từ chối yêu cầu',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const approveRequest = async (id: number) => {
  try {
    loading.value = true;
    
    const requestData: ReturnRequestListRequest = {
      adminNote: 'Yêu cầu đã được duyệt'
    };
    
    await ReturnOderService.responseReturnRequestItem(
      id, 
      'APPROVED',
      requestData
    );
    
    toast.add({
      severity: 'success',
      summary: 'Đã duyệt',
      detail: 'Yêu cầu hoàn hàng đã được duyệt',
      life: 3000,
    });

    // Làm mới dữ liệu
    const res = await ReturnOderService.getReturnItemsByOrderCodeApproved(orderCode);
    returnRequestListResponse.value = res;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể duyệt yêu cầu',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const res = await ReturnOderService.getReturnItemsByOrderCodeApproved(orderCode);
    returnRequestListResponse.value = res;
  } catch (error) {
    console.error('Lỗi khi tải chi tiết đơn hoàn hàng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải chi tiết đơn hàng',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
});

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function getStatusSeverity(status: string) {
  switch (status) {
    case 'Chờ phản hồi': return 'warning';
    case 'Đã duyệt': return 'success';
    case 'Bị từ chối': return 'danger';
    case 'Đã hoàn tiền': return 'success'
    default: return 'info';
  }
}
</script>

<style scoped>
/* Thêm vào phần style scoped */
:deep(.p-radiobutton .p-radiobutton-box) {
  border-color: #6366f1;
}

:deep(.p-radiobutton .p-radiobutton-box.p-highlight) {
  background: #6366f1;
  border-color: #6366f1;
}

:deep(.p-radiobutton .p-radiobutton-box.p-highlight:hover) {
  background: #4f46e5;
  border-color: #4f46e5;
}
.p-5 {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  font-size: 14px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.note-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  font-size: 0.9rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.p-datatable-thead > tr > th),
:deep(.p-datatable-tbody > tr > td) {
  border: 1px solid #e0e0e0 !important;
  vertical-align: middle;
  padding: 0.75rem;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f9f9f9;
}

:deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}
</style>