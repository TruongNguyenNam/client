<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Thêm Sản Phẩm Cùng Loại</h5>

        <!-- Thông tin sản phẩm cha -->
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label>Tên Sản Phẩm Cha</label>
            <InputText v-model="parentProduct.name" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>SKU Sản Phẩm Cha</label>
            <InputText v-model="parentProduct.sku" disabled />
          </div>
        </div>

        <!-- Thông tin sản phẩm con -->
        <div class="variant-details mt-4 surface-card p-4 border-round">
          <h6>Thông tin sản phẩm con</h6>
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
              <small class="p-error" v-if="hasImageError">Vui lòng tải lên ít nhất một hình ảnh.</small>
              
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
              <small class="p-error" v-if="hasPriceError">Vui lòng nhập giá hợp lệ (lớn hơn 0).</small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="variant-stock">Số lượng tồn kho *</label>
              <InputNumber
                id="variant-stock"
                v-model="variant.stockQuantity"
                :min="0"
                :class="{ 'p-invalid': hasStockError }"
                class="w-full"
              />
              <small class="p-error" v-if="hasStockError">Vui lòng nhập số lượng tồn kho hợp lệ (lớn hơn hoặc bằng 0).</small>
            </div>

            <div class="field col-12">
              <label for="variant-sku">SKU tự động</label>
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
            <h6 class="m-0">Thuộc tính sản phẩm con</h6>
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
                <small class="p-error" v-if="hasAttributeIdError[index]">Vui lòng chọn thuộc tính.</small>
              </div>

              <div class="field col-12 md:col-5">
                <label>Giá trị *</label>
                <InputText
                  v-model="attribute.value"
                  placeholder="Nhập giá trị"
                  class="w-full"
                  :class="{ 'p-invalid': hasAttributeValueError[index] }"
                />
                <small class="p-error" v-if="hasAttributeValueError[index]">Vui lòng nhập giá trị.</small>
              </div>

              <div class="field col-12 md:col-2 flex align-items-end justify-content-center">
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  rounded
                  @click="removeAttribute(index)"
                  v-if="attributes.length > 1"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
          </div>

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
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';
import type { ProductResponse, AddProductChild } from '../../../../model/product';

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
  sku: '',
  supplierName: '',
  categoryName: '',
  productAttributeValueResponses: [],
  tagName: [],
  imageUrl: [],
  inventories: []
});

const variant = reactive({
  name: '',
  sku: '',
  price: undefined as number | undefined,
  stockQuantity: undefined as number | undefined,
  images: [] as File[]
});

const attributes = ref<Array<{
  attributeId: number | null;
  value: string;
}>>([{ attributeId: null, value: '' }]);

const productAttributes = ref<ProductAttributeResponse[]>([]);

// Lưu trạng thái lỗi
const hasImageError = ref(false);
const hasPriceError = ref(false);
const hasStockError = ref(false);
const hasAttributeIdError = ref<boolean[]>([]);
const hasAttributeValueError = ref<boolean[]>([]);

// Cập nhật mảng lỗi khi thêm/xóa thuộc tính
const updateErrorArrays = () => {
  hasAttributeIdError.value = new Array(attributes.value.length).fill(false);
  hasAttributeValueError.value = new Array(attributes.value.length).fill(false);
};

updateErrorArrays();

// Computed
const getAvailableAttributes = computed(() => (currentIndex: number) => {
  return productAttributes.value.map(attr => ({
    ...attr,
    disabled: isAttributeDisabled(attr.id, currentIndex)
  }));
});

// Methods
const loadParentProduct = async () => {
  try {
    const productData = await ProductService.getProductById(parentProductId);
    parentProduct.value = productData;
    updateVariantNameAndSku();
  } catch (error: any) {
    showError('Lỗi tải thông tin sản phẩm cha', error);
  }
};

const loadProductAttributes = async () => {
  try {
    const response = await ProductAttributeService.getAllProductAttribute();
    productAttributes.value = response.data || [];
  } catch (error: any) {
    showError('Lỗi tải danh sách thuộc tính', error);
  }
};

const isAttributeDisabled = (attributeId: number, currentIndex: number) => {
  return attributes.value.some((attr, index) => 
    index !== currentIndex && attr.attributeId === attributeId
  );
};

const updateSelections = () => {
  updateVariantNameAndSku();
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

const onVariantImageUpload = (event: any) => {
  variant.images = event.files;
  hasImageError.value = false; // Reset lỗi khi chọn ảnh
};

const removeImage = (index: number) => {
  variant.images.splice(index, 1);
  hasImageError.value = variant.images.length === 0; // Đặt lỗi nếu không còn ảnh
};

const getImageUrl = (file: File) => {
  return URL.createObjectURL(file);
};

const onError = (error: any) => {
  showError('Lỗi tải lên ảnh', error);
};

const showError = (summary: string, error: any) => {
  toast.add({
    severity: 'error',
    summary,
    detail: error.message || 'Đã xảy ra lỗi',
    life: 5000
  });
};

const validateForm = () => {
  // Reset lỗi
  hasImageError.value = false;
  hasPriceError.value = false;
  hasStockError.value = false;
  hasAttributeIdError.value.fill(false);
  hasAttributeValueError.value.fill(false);

  // Mảng lưu trữ tất cả thông báo lỗi
  const errors: string[] = [];

  // Kiểm tra hình ảnh
  if (variant.images.length === 0) {
    hasImageError.value = true;
    errors.push("Hình ảnh sản phẩm con là bắt buộc. Vui lòng tải lên ít nhất một hình ảnh.");
  }

  // Kiểm tra giá
  if (!variant.price || variant.price <= 0) {
    hasPriceError.value = true;
    errors.push("Giá sản phẩm phải lớn hơn 0. Vui lòng nhập giá hợp lệ.");
  }

  // Kiểm tra số lượng
  if (variant.stockQuantity === undefined || variant.stockQuantity < 0) {
    hasStockError.value = true;
    errors.push("Số lượng tồn kho không hợp lệ. Vui lòng nhập số lớn hơn hoặc bằng 0.");
  }

  // Kiểm tra thuộc tính
  if (attributes.value.length === 0) {
    errors.push("Vui lòng thêm ít nhất một thuộc tính cho sản phẩm con.");
  } else {
    for (let i = 0; i < attributes.value.length; i++) {
      const attr = attributes.value[i];
      if (!attr.attributeId) {
        hasAttributeIdError.value[i] = true;
        errors.push(`Thuộc tính thứ ${i + 1}: Vui lòng chọn tên thuộc tính.`);
      }
      if (!attr.value.trim()) {
        hasAttributeValueError.value[i] = true;
        errors.push(`Thuộc tính thứ ${i + 1}: Vui lòng nhập giá trị thuộc tính.`);
      }
    }
  }

  // Nếu có lỗi, hiển thị tất cả thông báo lỗi qua toast
  if (errors.length > 0) {
    showError("Thông tin không hợp lệ", errors.join("\n"));
    return false;
  }

  return true;
};

const submitVariant = async () => {
  if (!validateForm()) {
    showError('Lỗi nhập liệu', 'Vui lòng kiểm tra lại các trường bắt buộc.');
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
          value: a.value.trim()
        })),
      variants: [{
        price: variant.price!,
        stockQuantity: variant.stockQuantity!,
        images: variant.images
      }]
    };

    await ProductService.addVariantsToProduct(parentProductId, variantForm, variant.images);
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm sản phẩm con thành công',
      life: 3000
    });
    
    router.push(`/productupdateparent/${parentProductId}`);
  } catch (error: any) {
    let errorMessage = 'Đã xảy ra lỗi khi thêm sản phẩm con';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
      if (errorMessage.includes('Tổ hợp giá trị thuộc tính đã tồn tại')) {
        errorMessage = 'Tổ hợp giá trị bạn nhập đã tồn tại. Vui lòng chọn giá trị khác.';
      } else if (errorMessage.includes('Tập hợp thuộc tính không khớp')) {
        errorMessage = 'Thuộc tính không khớp. Vui lòng chọn Size và Color.';
      }
    }
    showError('Lỗi', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

// Chạy khi trang tải
onMounted(async () => {
  await Promise.all([loadParentProduct(), loadProductAttributes()]);
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
</style>