<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4 text-primary">
      Chi tiết đơn hàng: {{ orderDetail?.code || 'Không có mã' }}
    </h2>

    <!-- Thông tin đơn hàng -->
    <Card class="mb-4 shadow-sm">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="space-y-2">
            <p><strong>Ngày đặt:</strong> {{ formatDate(orderDetail?.orderDate) }}</p>
            <p><strong>Trạng thái:</strong>
              <Tag v-if="orderDetail?.status" :value="orderDetail.status" :severity="getStatusSeverity(orderDetail.status)" />
              <span v-else>Không xác định</span>
            </p>
            <p><strong>Thanh toán:</strong>
              <Tag v-if="orderDetail?.paymentMethod" :value="orderDetail.paymentMethod" severity="info" />
              <span v-else>Không xác định</span>
            </p>
          </div>
          <div class="space-y-2">
            <p><strong>Tên người nhận:</strong> {{ orderDetail?.receiverName || 'Không có' }}</p>
            <p><strong>SĐT:</strong> {{ orderDetail?.receiverPhone || 'Không có' }}</p>
            <p><strong>Địa chỉ:</strong> {{ orderDetail?.shippingAddress || 'Không có' }}</p>
            <p><strong>Ghi chú:</strong> {{ orderDetail?.note || 'Không có' }}</p>
          </div>
        </div>
        <Divider class="my-4" />
        <p class="text-base font-semibold text-primary">
          Tổng tiền sau giảm: {{ formatCurrency(orderDetail?.totalAmount) }}
        </p>
      </template>
    </Card>

    <!-- Danh sách sản phẩm -->
    <h3 class="font-semibold mt-6 mb-3 text-lg">Danh sách sản phẩm:</h3>
    <DataTable :value="orderDetail?.productDetails || []" class="p-datatable-sm" v-model:selection="selectedItems" selectionMode="multiple" dataKey="orderItemId">
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column header="Sản phẩm">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <img :src="data.imageUrl || ''" alt="Product Image" class="w-20 h-20 object-cover rounded border" />
            <div>
              <p class="font-medium">{{ data.productName || 'Không có tên' }}</p>
              <div v-if="data.attributes" class="text-sm text-gray-600">
                <span v-for="(value, key) in data.attributes" :key="key" class="mr-2">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </Column>
      <Column header="Giá">
        <template #body="{ data }">
          {{ formatCurrency(data.unitPrice) }}
        </template>
      </Column>
      <Column header="Số lượng" field="quantity" />
      <Column header="Thành tiền">
        <template #body="{ data }">
          {{ formatCurrency((data.unitPrice || 0) * (data.quantity || 0)) }}
        </template>
      </Column>
    </DataTable>

    <div class="mt-6 flex justify-end" v-if="canReturn && (orderDetail?.productDetails?.length || 0) > 0">
      <Button label="Yêu cầu hoàn hàng" icon="pi pi-sync" class="p-button-warning" @click="openReturnDialog" :disabled="selectedItems.length === 0" />
    </div>

    <!-- Dialog hoàn trả -->
    <Dialog v-model:visible="returnDialogVisible" header="Yêu cầu hoàn trả hàng" :modal="true" :style="{ width: '50vw' }">
      <div class="space-y-6">
        <div v-if="selectedItems.length > 0">
          <h4 class="text-lg font-semibold">Sản phẩm được chọn</h4>
          <div class="max-h-80 overflow-y-auto divide-y rounded border border-gray-200">
            <div v-for="item in selectedItems" :key="item.orderItemId" class="py-4 px-4 bg-white">
              <div class="flex gap-4 items-start">
                <img :src="item.imageUrl || ''" alt="Ảnh" class="w-20 h-20 object-cover rounded border" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ item.productName }}</p>
                  <p class="text-sm text-gray-600">{{ formatCurrency(item.unitPrice) }} × {{ item.quantity }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Số lượng hoàn trả</label>
                  <InputNumber v-model="item.returnQuantity" :min="1" :max="item.quantity" class="w-full" showButtons />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Lý do</label>
                  <Dropdown v-model="item.returnReason" :options="returnReasons" optionLabel="label" placeholder="Chọn lý do" class="w-full" :class="{ 'p-invalid': !item.returnReason && formSubmitted }" />
                  <small class="p-error" v-if="!item.returnReason && formSubmitted">Vui lòng chọn lý do</small>
                </div>
              </div>

              <div class="mt-3">
                <label class="block text-sm font-medium mb-1">Ghi chú chi tiết</label>
                <InputText v-model="item.returnNote" placeholder="Mô tả vấn đề cụ thể..." class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-medium mb-2">Ghi chú chung:</label>
          <Textarea v-model="returnNote" rows="3" class="w-full" placeholder="Ghi chú chung cho đơn hoàn trả (nếu có)" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Hủy" icon="pi pi-times" @click="closeReturnDialog" class="p-button-text" />
          <Button label="Gửi yêu cầu" icon="pi pi-check" @click="submitReturnRequest" class="p-button-warning" :loading="isSubmitting" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ReturnOrderClientService } from '../../../../service/client/ReturnOrderService';
import type { 
  ReturnOrderDetailResponse,
  ReturnRequestRequest,
  ReturnRequestItemRequest
} from '../../../../model/client/ReturnOrder';
import { useToast } from 'primevue/usetoast';

// PrimeVue components
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

const route = useRoute();
const toast = useToast();
const orderDetail = ref<ReturnOrderDetailResponse | null>(null);
const selectedItems = ref<Array<{
  orderItemId: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  returnQuantity: number;
  returnReason?: { label: string; value: string };
  returnNote?: string;
}>>([]);

// Return dialog state
const returnDialogVisible = ref(false);
const returnNote = ref('');
const isSubmitting = ref(false);
const formSubmitted = ref(false);

const returnReasons = ref([
  { label: 'Sản phẩm bị lỗi', value: 'Sản phẩm bị lỗi' },
  { label: 'Không đúng mô tả', value: 'Không đúng mô tả' },
  { label: 'Giao sai sản phẩm', value: 'Giao sai sản phẩm' },
  { label: 'Sản phẩm bị hỏng', value: 'Sản phẩm bị hỏng' },
  { label: 'Đổi kích thước', value: 'Đổi kích thước' },
  { label: 'Lý do khác', value: 'Lý do khác' }
]);

const canReturn = computed(() => {
  if (!orderDetail.value?.status) return false;
  const validStatuses = ['DELIVERED', 'COMPLETED', 'SHIPPED'];
  return validStatuses.includes(orderDetail.value.status);
});

onMounted(async () => {
  const code = route.params.code as string;
  try {
    orderDetail.value = await ReturnOrderClientService.getReturnOrderDetail(code);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải chi tiết đơn hàng',
      life: 3000
    });
  }
});

function getStatusSeverity(status: string): string | undefined {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'DELIVERED': return 'info';
    case 'CANCELLED': return 'danger';
    case 'PROCESSING': return 'warning';
    default: return undefined;
  }
}

function openReturnDialog() {
  if (selectedItems.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn ít nhất một sản phẩm để hoàn trả',
      life: 3000
    });
    return;
  }
  
  // Initialize return data for selected items
  selectedItems.value = selectedItems.value.map(item => ({
    ...item,
    returnQuantity: Math.min(1, item.quantity),
    returnReason: undefined,
    returnNote: ''
  }));
  
  returnDialogVisible.value = true;
}

function closeReturnDialog() {
  returnDialogVisible.value = false;
  formSubmitted.value = false;
  returnNote.value = '';
}

async function submitReturnRequest() {
  formSubmitted.value = true;
  
  // Validate
  const invalidItems = selectedItems.value.filter(item => 
    !item.returnReason || item.returnQuantity <= 0 || item.returnQuantity > item.quantity
  );
  
  if (invalidItems.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng kiểm tra lại thông tin hoàn trả cho các sản phẩm',
      life: 3000
    });
    return;
  }

  isSubmitting.value = true;
  try {
    const request: ReturnRequestRequest = {
      orderId: orderDetail.value?.oderId || 0,
      note: returnNote.value,
      requestDate: new Date(),
      items: selectedItems.value.map(item => ({
        orderItemId: item.orderItemId,
        quantity: item.returnQuantity,
        reason: item.returnReason!.value,
        note: item.returnNote || ''
      }))
    };

    await ReturnOrderClientService.createReturnOrderRequest(request);
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Yêu cầu hoàn trả đã được gửi thành công',
      life: 3000
    });
    
    closeReturnDialog();
    selectedItems.value = [];
  } catch (err:any) {
   let msg = 'Đã xảy ra lỗi khi gửi dữ liệu.'
    if (err.response?.status === 400 && err.response.data?.message) msg = err.response.data.message
    else if (err.response?.status === 405) msg = 'Phương thức không được hỗ trợ (405).'
    else if (err.response?.data?.error) msg = err.response.data.error

    toast.add({ severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 })
  } finally {
    isSubmitting.value = false;
  }
}

function formatCurrency(value?: number): string {
  if (value == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(date?: Date | string): string {
  if (!date) return 'Không có ngày';
  return new Date(date).toLocaleDateString('vi-VN');
}
</script>
<style scoped>
/* Thêm các style mới */
.flex-shrink-0 {
  flex-shrink: 0;
}
.min-w-0 {
  min-width: 0;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Điều chỉnh kích thước ảnh cố định */
.w-16 {
  width: 4rem;
}
.h-16 {
  height: 4rem;
}

/* Căn chỉnh các input */
:deep(.p-inputnumber),
:deep(.p-dropdown),
:deep(.p-inputtext) {
  width: 100%;
}

/* Điều chỉnh khoảng cách giữa các phần tử */
.mb-3 {
  margin-bottom: 0.75rem;
}
:deep(.p-inputnumber),
:deep(.p-dropdown),
:deep(.p-inputtext),
:deep(.p-inputtextarea) {
  width: 100%;
  min-height: 2.5rem;
  font-size: 0.875rem;
}

:deep(.p-dropdown-label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

:deep(.p-error) {
  font-size: 0.75rem;
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>