<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4 text-primary">
      Chi tiết đơn hàng: {{ orderDetail?.code || 'Không có mã' }}
    </h2>

    <!-- Order information card -->
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

    <!-- Product list -->
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

    <!-- Return dialog -->
   <Dialog 
    v-model:visible="returnDialogVisible" 
    header="Yêu cầu hoàn trả hàng" 
    :modal="true" 
    :style="{ width: '50vw', maxWidth: '800px' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div class="space-y-6 return-dialog-content">
      <div v-if="selectedItems.length > 0" class="selected-products-section">
        <h4 class="text-lg font-semibold mb-3">Sản phẩm được chọn</h4>
        <div class="selected-products-container">
          <div 
            v-for="item in selectedItems" 
            :key="item.orderItemId" 
            class="product-item p-4 mb-4 last:mb-0"
          >
            <!-- Product info -->
            <div class="flex gap-4 items-start mb-4">
              <img :src="item.imageUrl || ''" alt="Ảnh" class="w-20 h-20 object-cover rounded border" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold truncate">{{ item.productName }}</p>
                <p class="text-sm text-gray-600">{{ formatCurrency(item.unitPrice) }} × {{ item.quantity }}</p>
              </div>
            </div>

            <!-- Return details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="return-quantity">
                <label class="block text-sm font-medium mb-1">Số lượng hoàn trả</label>
                <InputNumber 
                  v-model="item.returnQuantity" 
                  :min="1" 
                  :max="item.quantity" 
                  class="w-full" 
                  showButtons 
                />
              </div>
              <div class="return-reason">
                <label class="block text-sm font-medium mb-1">Lý do</label>
                <Dropdown 
                  v-model="item.returnReason" 
                  :options="returnReasons" 
                  optionLabel="label" 
                  placeholder="Chọn lý do" 
                  class="w-full" 
                  :class="{ 'p-invalid': !item.returnReason && formSubmitted }" 
                />
                <small class="p-error" v-if="!item.returnReason && formSubmitted">Vui lòng chọn lý do</small>
              </div>
            </div>

            <!-- Return note -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Ghi chú chi tiết</label>
              <InputText 
                v-model="item.returnNote" 
                placeholder="Mô tả vấn đề cụ thể..." 
                class="w-full" 
              />
            </div>

            <!-- Media upload -->
            <div class="media-upload-section">
              <label class="block text-sm font-medium mb-2">Hình ảnh/video minh chứng</label>
              <div class="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  :id="'fileInput-' + item.orderItemId"
                  class="hidden"
                  accept="image/*,video/*"
                  multiple
                  @change="handleFileUpload($event, item.orderItemId)"
                />
                <Button 
                  icon="pi pi-upload" 
                  label="Thêm file" 
                  class="p-button-sm p-button-outlined"
                  @click="triggerFileInput(item.orderItemId)"
                />
                <span class="text-sm text-gray-500">Tối đa 5 file (ảnh/video)</span>
              </div>

              <!-- Preview files -->
              <div v-if="item.mediaFiles.length > 0" class="media-preview-container">
                <div class="media-preview-grid">
                  <div v-for="(file, index) in item.mediaFiles" :key="index" class="media-preview-item">
                    <div class="media-thumbnail">
                      <img 
                        v-if="file.type.startsWith('image')" 
                        :src="file.preview" 
                        alt="Preview" 
                        class="media-object"
                      />
                      <video 
                        v-else-if="file.type.startsWith('video')" 
                        class="media-object"
                        controls
                      >
                        <source :src="file.preview" :type="file.type">
                      </video>
                      <div v-else class="file-icon">
                        <i class="pi pi-file text-2xl"></i>
                        <p class="text-xs truncate">{{ file.name }}</p>
                      </div>
                    </div>
                    <Button 
                      icon="pi pi-times" 
                      class="remove-media-btn" 
                      @click="removeMediaFile(item.orderItemId, index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank info -->
       <div class="bank-info-section p-4 border-round border-1 surface-border">
        <h4 class="text-lg font-semibold mb-3">Thông tin hoàn tiền</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="field">
            <label for="bankAccountName" class="block text-sm font-medium mb-2">Tên chủ tài khoản</label>
            <InputText 
              id="bankAccountName"
              v-model="bankAccountName" 
              placeholder="VD: NGUYEN VAN A" 
              class="w-full" 
            />
          </div>
          <div class="field">
            <label for="bankAccountNumber" class="block text-sm font-medium mb-2">Số tài khoản</label>
            <InputText 
              id="bankAccountNumber"
              v-model="bankAccountNumber" 
              placeholder="VD: 0123456789" 
              class="w-full" 
            />
          </div>
          <div class="field md:col-span-2">
            <label for="bankName" class="block text-sm font-medium mb-2">Ngân hàng</label>
            <Dropdown
              v-model="selectedBank"
              :options="banks"
              optionLabel="name"
              placeholder="Chọn ngân hàng"
              class="w-full"
              :filter="true"
              filterPlaceholder="Tìm ngân hàng"
              :showClear="true"
            >
              <template #option="slotProps">
                <div class="flex align-items-center">
                  <img 
                    v-if="slotProps.option.logo" 
                    :src="slotProps.option.logo" 
                    :alt="slotProps.option.name"
                    class="bank-logo mr-2"
                  />
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
          </div>
        </div>
      </div>
      <!-- General note -->
      <div class="general-note-section">
        <label class="block font-medium mb-2">Ghi chú chung:</label>
        <Textarea 
          v-model="returnNote" 
          rows="3" 
          class="w-full" 
          placeholder="Ghi chú chung cho đơn hoàn trả (nếu có)" 
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 dialog-footer">
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          @click="closeReturnDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Gửi yêu cầu" 
          icon="pi pi-check" 
          @click="submitReturnRequest" 
          class="p-button-warning" 
          :loading="isSubmitting" 
        />
      </div>
    </template>
  </Dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ReturnOrderClientService } from '../../../../service/client/ReturnOrderService';
import type { 
  ReturnOrderDetailResponse,
  ReturnRequestRequest
} from '../../../../model/client/ReturnOrder';

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
  mediaFiles: Array<{
    file: File;
    preview: string;
    type: string;
    name: string;
  }>;
}>>([]);

const returnDialogVisible = ref(false);
const returnNote = ref('');
const isSubmitting = ref(false);
const formSubmitted = ref(false);

const selectedBank = ref<{ code: string; name: string } | null>(null);

const bankAccountName = ref('');
const bankAccountNumber = ref('');
const bankName = ref('');
const banks = ref([
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)' },
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)' },
  { code: 'CTG', name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)' },
  { code: 'MB', name: 'Ngân hàng TMCP Quân đội (MB Bank)' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu (ACB)' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)' },
  { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)' },
  { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)' },
  { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong (TPBank)' },
  { code: 'EIB', name: 'Ngân hàng TMCP Xuất nhập khẩu Việt Nam (Eximbank)' },
  { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)' },
  { code: 'NAB', name: 'Ngân hàng TMCP Nam Á (NamABank)' },
  { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông (OCB)' },
  { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn (SCB)' },
  { code: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM (HDBank)' },
  { code: 'PGB', name: 'Ngân hàng TMCP Xăng dầu Petrolimex (PGBank)' },
  { code: 'BAB', name: 'Ngân hàng TMCP Bắc Á (BacABank)' },
  { code: 'GPB', name: 'Ngân hàng TMCP Dầu khí Toàn cầu (GPBank)' },
  { code: 'AGB', name: 'Ngân hàng TMCP Nông nghiệp & Phát triển Nông thôn (Agribank)' },
  { code: 'LPB', name: 'Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)' },
  { code: 'KLB', name: 'Ngân hàng TMCP Kiên Long (KienLongBank)' },
  { code: 'VAB', name: 'Ngân hàng TMCP Việt Á (VietABank)' },
  { code: 'NCB', name: 'Ngân hàng TMCP Quốc Dân (NCB)' },
  { code: 'OJB', name: 'Ngân hàng TMCP Đại Dương (OceanBank)' },
  { code: 'BVB', name: 'Ngân hàng TMCP Bảo Việt (BaoVietBank)' },
  { code: 'SGB', name: 'Ngân hàng TMCP Sài Gòn Công Thương (SaigonBank)' },
  { code: 'VBB', name: 'Ngân hàng TMCP Việt Nam Thương Tín (VietBank)' },
  { code: 'VCCB', name: 'Ngân hàng TMCP Bản Việt (VietCapitalBank)' },
  { code: 'VRB', name: 'Ngân hàng Liên doanh Việt - Nga (VRB)' },
  { code: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam' },
  { code: 'HLBVN', name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam' },
  { code: 'SHBVN', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam' },
  { code: 'UOB', name: 'Ngân hàng UOB Việt Nam' },
  { code: 'PBVN', name: 'Ngân hàng TNHH MTV Public Việt Nam' },
  { code: 'HSBC', name: 'Ngân hàng TNHH MTV HSBC (Việt Nam)' },
  { code: 'SCVN', name: 'Ngân hàng TNHH MTV Standard Chartered (Việt Nam)' },
  { code: 'ANZV', name: 'Ngân hàng TNHH MTV ANZ (Việt Nam)' },
  { code: 'IBKHCM', name: 'Ngân hàng Industrial Bank of Korea - Chi nhánh TP.HCM' },
  { code: 'WOO', name: 'Ngân hàng Woori Việt Nam' },
]);

// Ngân hàng được chọn

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
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải chi tiết đơn hàng', life: 3000 });
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

function formatCurrency(value?: number): string {
  if (value == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(date?: Date | string): string {
  if (!date) return 'Không có ngày';
  return new Date(date).toLocaleDateString('vi-VN');
}

function openReturnDialog() {
  if (selectedItems.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn ít nhất một sản phẩm để hoàn trả', life: 3000 });
    return;
  }
  selectedItems.value = selectedItems.value.map(item => ({
    ...item,
    returnQuantity: Math.min(1, item.quantity),
    returnReason: undefined,
    returnNote: '',
    mediaFiles: []
  }));
  returnDialogVisible.value = true;
}

function closeReturnDialog() {
  returnDialogVisible.value = false;
  formSubmitted.value = false;
  returnNote.value = '';
  bankAccountName.value = '';
  bankAccountNumber.value = '';
  bankName.value = '';
}

function triggerFileInput(orderItemId: number) {
  const el = document.getElementById(`fileInput-${orderItemId}`) as HTMLInputElement | null;
  if (el) el.click();
}

function handleFileUpload(event: Event, orderItemId: number) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const item = selectedItems.value.find(i => i.orderItemId === orderItemId);
  if (!item) return;

  const currentFiles = item.mediaFiles?.length || 0;
  if (currentFiles + input.files.length > 5) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Mỗi sản phẩm chỉ được tải lên tối đa 5 file', life: 3000 });
    return;
  }

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      item.mediaFiles.push({
        file,
        preview: e.target?.result as string,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  });

  input.value = '';
}

function removeMediaFile(orderItemId: number, index: number) {
  const item = selectedItems.value.find(i => i.orderItemId === orderItemId);
  if (item) item.mediaFiles.splice(index, 1);
}

async function submitReturnRequest() {
  formSubmitted.value = true;
  const invalidItems = selectedItems.value.filter(item => !item.returnReason || item.returnQuantity <= 0 || item.returnQuantity > item.quantity);

  if (invalidItems.length > 0) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng kiểm tra lại thông tin hoàn trả cho các sản phẩm', life: 3000 });
    return;
  }

  isSubmitting.value = true;
  try {
    const request: ReturnRequestRequest = {
      orderId: orderDetail.value?.oderId || 0,
      note: returnNote.value,
      requestDate: new Date(),
      bankAccountName: bankAccountName.value,
      bankAccountNumber: bankAccountNumber.value,
      bankName: selectedBank.value?.name || '',
     items: selectedItems.value.map(item => ({
  orderItemId: item.orderItemId,
  quantity: item.returnQuantity,
  reason: item.returnReason!.value,
  note: item.returnNote || '',
  mediaRequests: item.mediaFiles.map(file => ({
    fileName: file.name,
    type: file.type.startsWith('image') ? 'image' : 'video'
  }))
}))

    };

    const mediaFilesMap: Record<string, File> = {};
    selectedItems.value.forEach(item => {
      item.mediaFiles?.forEach((media, index) => {
        mediaFilesMap[`media-${item.orderItemId}-${index}`] = media.file;
      });
    });

    const formData = new FormData();
    formData.append('returnRequest', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    for (const key in mediaFilesMap) {
      const file = mediaFilesMap[key];
     formData.append('files', file);
    }

    const response = await ReturnOrderClientService.createReturnOrderRequest(formData);

    toast.add({ severity: 'success', summary: 'Thành công', detail: response.message || 'Yêu cầu hoàn trả đã được gửi thành công', life: 3000 });
    closeReturnDialog();
    selectedItems.value = [];
  } catch (err: any) {
    let msg = 'Đã xảy ra lỗi khi gửi dữ liệu.';
    if (err.response?.status === 400 && err.response.data?.message) msg = err.response.data.message;
    else if (err.response?.status === 405) msg = 'Phương thức không được hỗ trợ (405).';
    else if (err.response?.data?.error) msg = err.response.data.error;
    toast.add({ severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.p-4 {
  padding: 1rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-bold {
  font-weight: 700;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-primary {
  color: var(--primary-color);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.font-semibold {
  font-weight: 600;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.object-cover {
  object-fit: cover;
}

.rounded {
  border-radius: 0.25rem;
}

.border {
  border-width: 1px;
}

.font-medium {
  font-weight: 500;
}

.text-gray-600 {
  color: #4b5563;
}

.mr-2 {
  margin-right: 0.5rem;
}

.max-h-80 {
  max-height: 20rem;
}

.overflow-y-auto {
  overflow-y: auto;
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.bg-white {
  background-color: #fff;
}

.gap-4 {
  gap: 1rem;
}

.items-start {
  align-items: flex-start;
}

.flex-1 {
  flex: 1 1 0%;
}

.min-w-0 {
  min-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mt-4 {
  margin-top: 1rem;
}

.block {
  display: block;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.-top-2 {
  top: -0.5rem;
}

.-right-2 {
  right: -0.5rem;
}

.w-24 {
  width: 6rem;
}

.h-24 {
  height: 6rem;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.overflow-hidden {
  overflow: hidden;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.hidden {
  display: none;
}

.rows-3 {
  rows: 3;
}
.return-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.selected-products-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.product-item {
  background: #ffffff;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.media-upload-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e5e7eb;
}

.media-preview-container {
  margin-top: 0.5rem;
}

.media-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.media-preview-item {
  position: relative;
}

.media-thumbnail {
  width: 100%;
  height: 100px;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-object {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  text-align: center;
  padding: 0.5rem;
}

.remove-media-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-info-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.general-note-section {
  margin-top: 1.5rem;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .return-dialog-content {
    max-height: 60vh;
  }
  
  .selected-products-container {
    max-height: 200px;
  }
}
/* Thêm style cho dropdown ngân hàng */
.bank-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>