<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h5>Thêm Sản Phẩm Cùng Loại</h5>
          <Button label="Quay lại" icon="pi pi-arrow-left" @click="$router.back()" />
        </div>
        <!-- Thông tin sản phẩm cha -->
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label>Tên Sản Phẩm</label>
            <InputText v-model="parentProduct.name" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Mã Sản Phẩm</label>
            <InputText v-model="parentProduct.sku" disabled />
          </div>
        </div>

        <!-- Thông tin sản phẩm con -->
        <div class="variant-details mt-4 surface-card p-4 border-round">
          <h6>Thông tin sản phẩm chi tiết</h6>
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <label for="variant-images">Hình ảnh sản phẩm con *</label>
              <FileUpload
                name="variant-images"
                :multiple="true"
                accept="image/*"
                :auto="false"
                chooseLabel="Chọn ảnh"
                @select="onVariantImageUpload"
                :maxFileSize="1000000"
                @error="onError"
                :class="{ 'p-invalid': hasImageError }"
              >
                <template #empty>
                  <div class="flex align-items-center justify-content-center flex-column">
                    <i class="pi pi-cloud-upload border-2 border-circle p-3 text-2xl border-primary-500 text-primary-500 mb-2" />
                    <p class="m-0">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  </div>
                </template>
              </FileUpload>
              <small class="p-error" v-if="hasImageError">{{ imageErrorMessage }}</small>
              
              <!-- Hiển thị preview ảnh đã chọn -->
              <div v-if="variant.images.length > 0" class="image-preview mt-3 flex flex-wrap gap-2">
                <div v-for="(image, idx) in variant.images" :key="idx" class="relative">
                  <img :src="getImageUrl(image)" class="border-2 border-round" style="width: 100px; height: 100px; object-fit: cover" />
                  <Button 
                    icon="pi pi-times" 
                    severity="danger" 
                    rounded 
                    text 
                    class="absolute" 
                    style="right: 0; top: 0; transform: translate(50%, -50%)"
                    @click="removeImage(idx)"
                  />
                </div>
              </div>
            </div>

            <div class="field col-12 md:col-6">
              <label for="variant-price">Giá (VND) *</label>
              <InputNumber
                id="variant-price"
                v-model="variant.price"
                mode="currency"
                currency="VND"
                locale="vi-VN"
                :minFractionDigits="0"
                :class="{ 'p-invalid': hasPriceError }"
                class="w-full"
              />
              <small class="p-error" v-if="hasPriceError">{{ priceErrorMessage }}</small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="variant-stock">Số lượng tồn kho *</label>
              <InputNumber
                id="variant-stock"
                v-model="variant.stockQuantity"
                :class="{ 'p-invalid': hasStockError }"
                class="w-full"
              />
              <small class="p-error" v-if="hasStockError">{{ stockErrorMessage }}</small>
            </div>

            <div class="field col-12">
              <label for="variant-sku">Mã Sản Phẩm</label>
              <InputText 
                id="variant-sku"
                v-model="variant.sku" 
                disabled 
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Thuộc tính sản phẩm con -->
        <div class="attributes mt-4 surface-card p-4 border-round">
          <div class="flex align-items-center justify-content-between mb-3">
            <h6 class="m-0">Thuộc tính sản phẩm </h6>
            <Button
              label="Thêm thuộc tính"
              icon="pi pi-plus"
              severity="secondary"
              outlined
              size="small"
              @click="addAttribute"
              :disabled="attributes.length >= productAttributes.length || isSubmitting"
            />
          </div>

          <div v-if="attributes.length === 0" class="text-center py-4 border-2 border-dashed border-round">
            <p class="text-color-secondary">Chưa có thuộc tính nào được thêm</p>
          </div>

          <div v-for="(attribute, index) in attributes" :key="index" class="attribute-row mb-3 p-3 border-round surface-ground">
            <div class="grid">
              <div class="field col-12 md:col-5">
                <label>Tên thuộc tính *</label>
                <Dropdown
                  v-model="attribute.attributeId"
                  :options="getAvailableAttributes(index)"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Chọn thuộc tính"
                  class="w-full"
                  :class="{ 'p-invalid': hasAttributeIdError[index] }"
                  @change="updateSelections"
                >
                  <template #option="slotProps">
                    <div :class="{ 'text-color-secondary': isAttributeDisabled(slotProps.option.id, index) }">
                      {{ slotProps.option.name }}
                      <span v-if="isAttributeDisabled(slotProps.option.id, index)" class="text-xs ml-2">(đã chọn)</span>
                    </div>
                  </template>
                </Dropdown>
                <small class="p-error" v-if="hasAttributeIdError[index]">{{ attributeIdErrorMessages[index] }}</small>
              </div>

              <div class="field col-12 md:col-5">
                <label>Giá trị *</label>
                <InputText
                  v-model="attribute.value"
                  placeholder="Nhập giá trị"
                  class="w-full"
                  maxlength="20"
                  :class="{ 'p-invalid': hasAttributeValueError[index] }"
                />
                <small class="p-error" v-if="hasAttributeValueError[index]">{{ attributeValueErrorMessages[index] }}</small>
              </div>

              <div class="field col-12 md:col-2 flex align-items-end justify-content-center">
                <!-- <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  rounded
                  @click="removeAttribute(index)"
                  :disabled="isSubmitting"
                /> -->
              </div>
            </div>
          </div>

          <!-- Hiển thị lỗi từ backend (trùng lặp) -->
          <small class="p-error block mt-2" v-if="hasDuplicateError">{{ duplicateErrorMessage }}</small>

          <small class="block mt-2 text-color-secondary" v-if="attributes.length >= productAttributes.length">
            Đã đạt tối đa số thuộc tính có thể thêm
          </small>
        </div>

        <div class="flex justify-content-end mt-4 gap-2">
          <Button
            label="Hủy bỏ"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="router.push(`/productupdateparent/${parentProductId}`)"
            :disabled="isSubmitting"
          />
          <Button
            label="Lưu sản phẩm"
            icon="pi pi-check"
            @click="submitVariant"
            :loading="isSubmitting"
          />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
import { ProductAttributeValueService } from '../../../../service/admin/ProductAttributeValueService';
import type { ProductAttributeResponse } from '../../../../model/admin/productAttribute';
import type { ProductResponse, AddProductChild } from '../../../../model/admin/product';
import type { ProductAttributeValueResponse } from '../../../../service/admin/ProductAttributeValueService';

const toast = useToast();
const router = useRouter();
const route = useRoute();

// State
const isSubmitting = ref(false);
const parentProductId = Number(route.params.id);
const parentProduct = ref<ProductResponse>({
  id: 0,
  name: '',
  description: '',
  price: null,
  stockQuantity: null,
  sportType: '',
  originalPrice: null,
  sku: '',
  supplierName: '',
  categoryName: '',
  productAttributeValueResponses: [],
  tagName: [],
  imageUrl: [],
  inventories: [],
});

const variant = reactive({
  name: '',
  sku: '',
  price: undefined as number | undefined,
  stockQuantity: undefined as number | undefined,
  images: [] as File[],
});

const attributes = ref<Array<{
  attributeId: number | null;
  value: string;
}>>([]); // Khởi tạo rỗng, sẽ được điền từ API

const productAttributes = ref<ProductAttributeResponse[]>([]);

// Lưu trạng thái lỗi và thông báo
const hasImageError = ref(false);
const hasPriceError = ref(false);
const hasStockError = ref(false);
const hasAttributeIdError = ref<boolean[]>([]);
const hasAttributeValueError = ref<boolean[]>([]);
const imageErrorMessage = ref('');
const priceErrorMessage = ref('');
const stockErrorMessage = ref('');
const attributeIdErrorMessages = ref<string[]>([]);
const attributeValueErrorMessages = ref<string[]>([]);
const hasDuplicateError = ref(false);
const duplicateErrorMessage = ref('');

// Cập nhật mảng lỗi và thông báo khi thêm/xóa thuộc tính
const updateErrorArrays = () => {
  hasAttributeIdError.value = new Array(attributes.value.length).fill(false);
  hasAttributeValueError.value = new Array(attributes.value.length).fill(false);
  attributeIdErrorMessages.value = new Array(attributes.value.length).fill('');
  attributeValueErrorMessages.value = new Array(attributes.value.length).fill('');
  hasDuplicateError.value = false;
  duplicateErrorMessage.value = '';
};

// Computed
const getAvailableAttributes = computed(() => (currentIndex: number) => {
  const selectedIds = attributes.value
    .filter((_, idx) => idx !== currentIndex)
    .map(attr => attr.attributeId);
  return productAttributes.value.filter(attr => !selectedIds.includes(attr.id));
});

const isAttributeDisabled = (attributeId: number, currentIndex: number) => {
  return attributes.value.some((attr, index) => 
    index !== currentIndex && attr.attributeId === attributeId
  );
};

// Methods
const loadParentProduct = async () => {
  try {
    const productData = await ProductService.getProductById(parentProductId);
    parentProduct.value = productData;
    updateVariantNameAndSku();
  } catch (error: any) {
    showError('Không thể tải thông tin sản phẩm cha', error);
  }
};

const loadProductAttributes = async () => {
  try {
    const response = await ProductAttributeService.getAllProductAttribute();
    productAttributes.value = response.data || [];
  } catch (error: any) {
    showError('Không thể tải danh sách thuộc tính', error);
  }
};

const loadFirstVariantAttributes = async () => {
  try {
    const response = await ProductAttributeValueService.getFirstVariantAttributes(parentProductId);
    const safeData = response.data ?? []; // fallback [] nếu undefined

    attributes.value = safeData.map(attr => ({
      attributeId: attr.attributeId,
      value: '', // để trống ban đầu
    }));

    updateErrorArrays();
    updateVariantNameAndSku();
  } catch (error: any) {
    showError('Không thể tải thuộc tính của biến thể đầu tiên', error);
    attributes.value = [{ attributeId: null, value: '' }];
    updateErrorArrays();
  }
};


const updateVariantNameAndSku = () => {
  const validAttributes = attributes.value.filter(a => a.attributeId && a.value.trim());
  
  if (validAttributes.length > 0) {
    const attributeValues = validAttributes.map(a => {
      const attrName = productAttributes.value.find(attr => attr.id === a.attributeId)?.name || '';
      return `${attrName}: ${a.value.trim()}`;
    });
    variant.name = `${parentProduct.value.name} (${attributeValues.join(', ')})`;
  } else {
    variant.name = parentProduct.value.name;
  }

  if (validAttributes.length > 0) {
    const skuParts = validAttributes.map(a => a.value.trim().replace(/\s+/g, '-').toLowerCase());
    variant.sku = `${parentProduct.value.sku}-${skuParts.join('-')}`;
  } else {
    variant.sku = parentProduct.value.sku;
  }
};

const addAttribute = () => {
  if (attributes.value.length < productAttributes.value.length) {
    attributes.value.push({ attributeId: null, value: '' });
    updateErrorArrays();
  }
};

const removeAttribute = (index: number) => {
  if (attributes.value.length > 1) {
    attributes.value.splice(index, 1);
    updateErrorArrays();
    updateVariantNameAndSku();
  }
};

const updateSelections = () => {
  updateVariantNameAndSku();
};

const onVariantImageUpload = (event: any) => {
  variant.images = event.files;
  hasImageError.value = false;
  imageErrorMessage.value = '';
};

const removeImage = (index: number) => {
  variant.images.splice(index, 1);
  hasImageError.value = variant.images.length === 0;
  imageErrorMessage.value = variant.images.length === 0 ? 'Bạn chưa chọn hình ảnh nào. Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm con.' : '';
};

const getImageUrl = (file: File) => {
  return URL.createObjectURL(file);
};

const onError = (error: any) => {
  showError('Không thể tải ảnh lên', error);
};

const showError = (summary: string, error: any) => {
  toast.add({
    severity: 'error',
    summary,
    detail: typeof error === 'string' ? error : error.message || 'Đã xảy ra lỗi không xác định',
    life: 5000,
  });
};

const validateForm = () => {
  // Reset lỗi
  hasImageError.value = false;
  hasPriceError.value = false;
  hasStockError.value = false;
  hasAttributeIdError.value.fill(false);
  hasAttributeValueError.value.fill(false);
  imageErrorMessage.value = '';
  priceErrorMessage.value = '';
  stockErrorMessage.value = '';
  attributeIdErrorMessages.value.fill('');
  attributeValueErrorMessages.value.fill('');
  hasDuplicateError.value = false;
  duplicateErrorMessage.value = '';

  const errors: string[] = [];

  // Kiểm tra hình ảnh
  if (variant.images.length === 0) {
    hasImageError.value = true;
    imageErrorMessage.value = 'Bạn chưa chọn hình ảnh nào. Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm con.';
    errors.push(imageErrorMessage.value);
  }

  // Kiểm tra giá từ 20,000 đến 30,000,000
  if (
    variant.price === undefined ||
    typeof variant.price !== 'number' ||
    variant.price < 20000 ||
    variant.price > 30000000
  ) {
    hasPriceError.value = true;
    priceErrorMessage.value = 'Giá sản phẩm không hợp lệ. Vui lòng nhập giá từ 20,000 đến 30,000,000';
    errors.push(priceErrorMessage.value);
  }

  // Kiểm tra số lượng từ 1 đến 1000
  if (
    variant.stockQuantity === undefined ||
    typeof variant.stockQuantity !== 'number' ||
    variant.stockQuantity <= 0 ||
    variant.stockQuantity > 1000
  ) {
    hasStockError.value = true;
    stockErrorMessage.value = 'Số lượng tồn kho không hợp lệ. Vui lòng nhập số từ 1 đến 1000.';
    errors.push(stockErrorMessage.value);
  }

  // Kiểm tra thuộc tính
  if (attributes.value.length === 0) {
    hasAttributeIdError.value[0] = true;
    attributeIdErrorMessages.value[0] = 'Bạn chưa thêm thuộc tính nào. Vui lòng thêm ít nhất một thuộc tính cho sản phẩm con.';
    errors.push(attributeIdErrorMessages.value[0]);
  } else {
    for (let i = 0; i < attributes.value.length; i++) {
      const attr = attributes.value[i];
      const attrName = productAttributes.value.find(pa => pa.id === attr.attributeId)?.name || `Thuộc tính thứ ${i + 1}`;

      if (!attr.attributeId) {
        hasAttributeIdError.value[i] = true;
        attributeIdErrorMessages.value[i] = `Bạn chưa chọn tên cho ${attrName}. Vui lòng chọn một thuộc tính.`;
        errors.push(attributeIdErrorMessages.value[i]);
      }

      if (!attr.value.trim()) {
        hasAttributeValueError.value[i] = true;
        attributeValueErrorMessages.value[i] = `Bạn chưa nhập giá trị cho ${attrName}. Vui lòng nhập giá trị.`;
        errors.push(attributeValueErrorMessages.value[i]);
      }
    }
  }

  // Hiển thị thông báo lỗi tổng hợp
  if (errors.length > 0) {
    const errorMessage = errors.join(' | ');
    toast.add({
      severity: 'warn',
      summary: 'Lỗi dữ liệu',
      detail: errorMessage,
      life: 5000,
    });
    return false;
  }

  return true;
};

const submitVariant = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const variantForm: AddProductChild = {
      parentProductId,
      productAttributeValues: attributes.value
        .filter(a => a.attributeId && a.value.trim())
        .map(a => ({
          attributeId: a.attributeId!,
          value: a.value.trim(),
        })),
      variants: [{
        price: variant.price!,
        stockQuantity: variant.stockQuantity!,
        images: variant.images,
      }],
    };

    await ProductService.addVariantsToProduct(parentProductId, variantForm, variant.images);

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm sản phẩm con thành công',
      life: 3000,
    });

    router.push(`/productupdateparent/${parentProductId}`);
  } catch (error: any) {
    console.error('Chi tiết lỗi đầy đủ:', JSON.stringify(error, null, 2));
    console.error('Dữ liệu thô từ response:', JSON.stringify(error.response, null, 2));
    console.error('Thông điệp lỗi:', error.message);

    let errorMessage = 'Không thể thêm sản phẩm con';
    hasDuplicateError.value = false;

    let backendMessage = error.message || 'Đã xảy ra lỗi không xác định';
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'object' && error.response.data.message) {
        backendMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        backendMessage = error.response.data;
      } else if (typeof error.response.data === 'object' && error.response.data.error) {
        backendMessage = error.response.data.error;
      }
    }

    if (typeof backendMessage === 'string') {
      if (backendMessage.includes('Dữ liệu JSON không hợp lệ')) {
        errorMessage = 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (backendMessage.includes('Danh sách thuộc tính mới không được để trống')) {
        errorMessage = 'Bạn chưa thêm thuộc tính nào cho sản phẩm con. Vui lòng thêm ít nhất một thuộc tính.';
        hasAttributeIdError.value[0] = true;
        attributeIdErrorMessages.value[0] = errorMessage;
      } else if (backendMessage.includes('Không tìm thấy biến thể nào cho sản phẩm cha với ID')) {
        errorMessage = 'Không tìm thấy sản phẩm cha hoặc biến thể liên quan. Vui lòng kiểm tra lại sản phẩm.';
      } else if (backendMessage.includes('Không tìm thấy product_id đầu tiên') || backendMessage.includes('Không tìm thấy biến thể con đầu tiên')) {
        errorMessage = 'Không tìm thấy biến thể con để tham chiếu. Vui lòng kiểm tra lại sản phẩm cha.';
      } else if (backendMessage.includes('Tập hợp thuộc tính không khớp')) {
        errorMessage = 'Thuộc tính không khớp với biến thể con đầu tiên. Vui lòng kiểm tra lại Size và Color.';
      } else if (backendMessage.includes('Giá trị thuộc tính không được để trống')) {
        errorMessage = 'Giá trị thuộc tính không được để trống. Vui lòng nhập đầy đủ giá trị.';
        hasAttributeValueError.value = attributes.value.map(() => true);
        attributeValueErrorMessages.value = attributes.value.map((_, i) => `Giá trị cho thuộc tính thứ ${i + 1} không được để trống`);
      } else if (backendMessage.includes('Tổ hợp giá trị thuộc tính đã tồn tại')) {
        errorMessage = `Sản phẩm với tổ hợp giá trị này đã tồn tại: ${backendMessage.split(': ')[1] || ''}. Vui lòng chọn giá trị khác.`;
        hasDuplicateError.value = true;
      } else if (backendMessage.includes('Lỗi hệ thống')) {
        errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau.';
      } else if (backendMessage.includes('Request failed with status code 404')) {
        errorMessage = 'Không tìm thấy sản phẩm cha hoặc endpoint. Vui lòng kiểm tra ID và kết nối.';
      } else {
        errorMessage = backendMessage;
      }
    }

    duplicateErrorMessage.value = errorMessage;

    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMessage,
      life: 4000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Chạy khi trang tải
onMounted(async () => {
  await Promise.all([loadParentProduct(), loadProductAttributes(), loadFirstVariantAttributes()]);
});
</script>

<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.attribute-row {
  transition: all 0.2s ease;
  border: 1px solid var(--surface-border);
}

.attribute-row:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.image-preview img {
  transition: all 0.2s ease;
}

.image-preview img:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.p-fileupload) {
  width: 100%;
}

:deep(.p-fileupload-content) {
  border: 2px dashed var(--surface-border);
  border-radius: 6px;
  padding: 1rem;
}

:deep(.p-fileupload-content:hover) {
  border-color: var(--primary-color);
}

:deep(.p-dropdown .p-dropdown-label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.p-button.p-button-secondary:not(:disabled):hover) {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>