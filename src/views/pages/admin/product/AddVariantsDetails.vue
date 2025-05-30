<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Thêm Sản Phẩm Cùng Loại</h5>

        <!-- Thông tin sản phẩm cha (chỉ tên và SKU) -->
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
        <div class="variant-details mt-4">
          <h6>Thông tin sản phẩm con</h6>
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <label for="variant-images">Hình ảnh sản phẩm con</label>
              <FileUpload
                name="variant-images"
                :multiple="true"
                accept="image/*"
                :auto="false"
                chooseLabel="Chọn ảnh"
                @select="onVariantImageUpload"
                :maxFileSize="1000000"
                @error="onError"
                :class="{ 'p-invalid': submitted && (!variant.images || variant.images.length === 0) }"
              />
              <!-- <div v-if="variant.images.length > 0" class="image-preview mt-2">
                <img
                  v-for="(img, index) in getImagePreview(variant.images)"
                  :key="index"
                  :src="img"
                  alt="Variant Image"
                  style="max-width: 80px; margin: 5px;"
                />
              </div> -->
              <small class="p-error" v-if="submitted && (!variant.images || variant.images.length === 0)">Ít nhất một hình ảnh là bắt buộc.</small>
            </div>
            <div class="field col-12 md:col-6">
              <label for="variant-price">Giá (VND) *</label>
              <InputNumber
                id="variant-price"
                v-model="variant.price"
                mode="currency"
                currency="VND"
                :minFractionDigits="0"
                :class="{ 'p-invalid': submitted && !variant.price }"
              />
              <small class="p-error" v-if="submitted && !variant.price">Giá là bắt buộc.</small>
            </div>
            <div class="field col-12 md:col-6">
              <label for="variant-stock">Số lượng tồn kho *</label>
              <InputNumber
                id="variant-stock"
                v-model="variant.stockQuantity"
                :min="0"
                :class="{ 'p-invalid': submitted && !variant.stockQuantity }"
              />
              <small class="p-error" v-if="submitted && !variant.stockQuantity">Số lượng là bắt buộc.</small>
            </div>
          </div>
        </div>

         <!-- Thuộc tính của sản phẩm con -->
         <div class="attributes mt-4">
          <h6>Thuộc tính sản phẩm con</h6>
          <div v-for="(attribute, index) in attributes" :key="index" class="attribute-row mb-2">
            <div class="field col-12 md:col-4">
              <label>Thuộc tính</label>
              <Dropdown
                v-model="attribute.attributeId"
                :options="availableAttributes"
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn thuộc tính"
                :class="{ 'p-invalid': submitted && !attribute.attributeId }"
              />
            </div>
            <div class="field col-12 md:col-4">
              <label>Giá trị</label>
              <InputText
                v-model="attribute.value"
                placeholder="Nhập giá trị (ví dụ: 4, red)"
                :class="{ 'p-invalid': submitted && !attribute.value }"
              />
            </div>
            <div class="field col-12 md:col-2">
              <label> </label>
              <Button
                icon="pi pi-trash"
                severity="danger"
                @click="removeAttribute(index)"
                v-if="attributes.length > 1"
              />
            </div>
          </div>
          <Button
            label="Thêm thuộc tính"
            icon="pi pi-plus"
            severity="secondary"
            @click="addAttribute"
            class="mt-2"
            :disabled="availableAttributes.length === 0"
          />
          <small class="p-error" v-if="submitted && !attributes.length">
            Cần ít nhất một thuộc tính.
          </small>
        </div>

        <div class="flex justify-content-end mt-4">
          <Button
            label="Hủy"
            icon="pi pi-times"
            severity="secondary"
            class="mr-2"
            @click="router.push(`/productupdateparent/${parentProductId}`)"
          />
          <Button
            label="Lưu"
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';
import type { ProductResponse, AddProductChild, ProductAttributeValue } from '../../../../model/product';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const isSubmitting = ref(false);
const submitted = ref(false);
const productAttributes = ref<ProductAttributeResponse[]>([]);
const availableAttributes = ref<ProductAttributeResponse[]>([]);
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
const attributes = ref<
   Array<{
    attributeId: number;
    value: string;
  }>
>([]);
const variant = reactive<{
  name: string;
  sku: string;
  price: number | undefined;
  stockQuantity: number | undefined;
  attributes: ProductAttributeValue[];
  images: File[];
}>({
  name: '',
  sku: '',
  price: undefined,
  stockQuantity: undefined,
  attributes: [],
  images: [],
});

const variantForm = reactive<AddProductChild>({
  parentProductId,
  productAttributeValues: [],
  variants: [],
});

const loadParentProduct = async () => {
  try {
    const productData = await ProductService.getProductById(parentProductId);
    parentProduct.value = productData;
    updateVariantNameAndSku();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi tải thông tin sản phẩm cha.',
      life: 3000,
    });
  }
};

const updateAvailableAttributes = () => {
  const selectedAttributeIds = attributes.value.map(a => a.attributeId).filter(id => id !== 0);
  availableAttributes.value = productAttributes.value.filter(attr => !selectedAttributeIds.includes(attr.id));
};

const addAttribute = () => {
  if (availableAttributes.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Không còn thuộc tính nào để thêm.',
      life: 3000,
    });
    return;
  }
  attributes.value.push({ attributeId: 0, value: '' });
  updateAvailableAttributes();
};

const removeAttribute = (index: number) => {
  attributes.value.splice(index, 1);
  updateVariantNameAndSku();
  updateAvailableAttributes();
};

const onVariantImageUpload = (event: any) => {
  const selectedFiles: File[] = event.files;
  variant.images = selectedFiles || [];
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã chọn ${selectedFiles.length} hình ảnh cho sản phẩm con.`,
    life: 3000,
  });
};


const onError = (error: any) => {
  toast.add({
    severity: 'error',
    summary: 'Lỗi tải lên',
    detail: error.message,
    life: 3000,
  });
};

const getImagePreview = (files: File[]): string[] => {
  return files.map(file => URL.createObjectURL(file));
};

const updateVariantNameAndSku = () => {
  const validAttributes = attributes.value.filter(a => a.attributeId !== 0 && a.value.trim());
  const attributeValues = validAttributes.map(a => a.value.trim());
  variant.attributes = validAttributes.map(a => ({
    attributeId: a.attributeId,
    value: a.value.trim(),
  }));
  variant.name = attributeValues.length ? `${parentProduct.value.name} - ${attributeValues.join(' - ')}` : parentProduct.value.name;
  variant.sku = attributeValues.length ? `${parentProduct.value.sku}-${attributeValues.join('-')}` : parentProduct.value.sku;
};

const submitVariant = async () => {
  submitted.value = true;

  if (
    !attributes.value.length ||
    attributes.value.some(a => !a.attributeId || !a.value.trim()) ||
    !variant.price ||
    variant.price <= 0 ||
    !variant.stockQuantity ||
    variant.stockQuantity < 0 ||
    !variant.images ||
    variant.images.length === 0
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Lỗi',
      detail: 'Vui lòng điền đầy đủ các trường bắt buộc, giá > 0, số lượng >= 0, và tải lên ít nhất một hình ảnh.',
      life: 3000,
    });
    return;
  }

  isSubmitting.value = true;
  try {
    // Cập nhật variantForm
    variantForm.productAttributeValues = attributes.value.map(a => ({
      attributeId: a.attributeId,
      value: a.value.trim(),
    }));
    variantForm.variants = [
      {
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        images: variant.images,
      },
    ];

    await ProductService.addVariantsToProduct(parentProductId, variantForm, variant.images);
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm sản phẩm cùng loại thành công.',
      life: 3000,
    });
    router.push(`/productupdateparent/${parentProductId}`);
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi thêm sản phẩm con.',
      life: 3000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [attributes.value, parentProduct.value.name, parentProduct.value.sku],
  () => {
    updateVariantNameAndSku();
  },
  { deep: true }
);

onMounted(async () => {
  try {
    const [productAttributeResponse] = await Promise.all([
      ProductAttributeService.getAllProductAttribute(),
      loadParentProduct(),
    ]);
    productAttributes.value = productAttributeResponse.data || [];
    availableAttributes.value = [...productAttributes.value];
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi tải dữ liệu.',
      life: 3000,
    });
  }
});
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.attributes, .variant-details {
  background-color: #fff;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.attribute-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mt-4 {
  margin-top: 1rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
:deep(.p-fileupload-choose) {
  width: auto !important;
  padding: 0.5rem !important;
}
</style>