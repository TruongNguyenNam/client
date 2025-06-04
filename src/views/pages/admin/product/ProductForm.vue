<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { CategoryService } from '../../../../service/CategoryService';
import { SupplierService } from '../../../../service/SupplierService';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductTagService } from '../../../../service/ProductTagService';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/category';
import type { SupplierResponse } from '../../../../model/supplier';
import type { ProductTagResponse } from '../../../../model/ProductTag';
import type { ProductRequest, ProductAttributeValue } from '../../../../model/product';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';

const toast = useToast();
const submitted = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

const parentImages = ref<File[]>([]);
const availableAttributes = ref<ProductAttributeResponse[]>([]);

const product = reactive<ProductRequest>({
  name: '',
  description: '',
  sportType: '',
  sku: '',
  supplierId: null,
  categoryId: null,
  productAttributeValues: [],
  variants: [],
  tagId: [],
  inventoryIds: []
});

const variants = ref<Array<{ attributeId: number; values: string[]; currentValue: string; variantImages: Map<string, File[]> }>>([]);
const variantCombinations = ref<Array<{
  name: string;
  sku: string;
  price?: number;
  stockQuantity?: number;
  attributes: ProductAttributeValue[];
  images: File[];
}>>([]);
const categories = ref<CategoryResponse[]>([]);
const suppliers = ref<SupplierResponse[]>([]);
const productAttributes = ref<ProductAttributeResponse[]>([]);
const productTags = ref<ProductTagResponse[]>([]);


const getAttributeName = (attributeId: number) => {
  const attribute = productAttributes.value.find(attr => attr.id === attributeId);
  return attribute ? attribute.name : '';
};

const onParentImageUpload = (event: any) => {
  const selectedFiles: File[] = event.files;
  parentImages.value = selectedFiles;
  toast.add({ severity: 'success', summary: 'Hình ảnh sản phẩm cha đã chọn', detail: `Đã chọn ${selectedFiles.length} hình ảnh cho sản phẩm cha`, life: 3000 });
};

const onError = (error: any) => {
  toast.add({ severity: 'error', summary: 'Lỗi tải lên', detail: error.message, life: 3000 });
};

const updateAvailableAttributes = () => {
  // Lấy danh sách các attributeId đã được chọn, loại bỏ các giá trị không hợp lệ
  const selectedAttributeIds = variants.value
    .map(v => v.attributeId)
    .filter(id => id !== 0 && id !== undefined && id !== null);

  // Cập nhật availableAttributes dựa trên productAttributes
  availableAttributes.value = productAttributes.value.filter(attr => 
    !selectedAttributeIds.includes(attr.id)
  );

  console.log('Selected attribute IDs:', selectedAttributeIds);
  console.log('Available attributes after update:', availableAttributes.value);
};

const addVariant = () => {
  const selectedIds = variants.value.map(v => v.attributeId).filter(id => id !== 0);
  if (selectedIds.length === productAttributes.value.length) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Tất cả các thuộc tính đã được chọn', life: 3000 });
    return;
  }
  variants.value.push({
    attributeId: 0,
    values: [],
    currentValue: '',
    variantImages: new Map()
  });
  updateAvailableAttributes();
};

const removeVariant = (index: number) => {
  variants.value.splice(index, 1);
  generateCombinations();
  updateAvailableAttributes();
};

const addVariantValue = (index: number) => {
  const variant = variants.value[index];
  const value = variant.currentValue.trim();
  
  if (value && !variant.values.includes(value)) {
    variant.values.push(value);
    variant.currentValue = '';
    variant.variantImages.set(value, []);
    toast.add({ severity: 'success', summary: 'Giá trị đã thêm', detail: `Đã thêm "${value}"`, life: 3000 });
    generateCombinations();
  } else if (value) {
    toast.add({ severity: 'warn', summary: 'Giá trị đã tồn tại', detail: 'Giá trị này đã tồn tại', life: 3000 });
  }
};

const removeVariantValue = (variantIndex: number, valueIndex: number) => {
  const variant = variants.value[variantIndex];
  const removedValue = variant.values[valueIndex];
  variant.values.splice(valueIndex, 1);
  variant.variantImages.delete(removedValue);
  toast.add({ severity: 'info', summary: 'Giá trị đã xóa', detail: `Đã xóa "${removedValue}"`, life: 3000 });
  generateCombinations();
};

const onVariantImageUpload = (index: number, event: any) => {
  const selectedFiles: File[] = event.files;
  const combination = variantCombinations.value[index];
  combination.images = selectedFiles || [];
  toast.add({ severity: 'success', summary: 'Hình ảnh đã chọn', detail: `Đã chọn ${selectedFiles.length} hình ảnh cho biến thể "${combination.name}"`, life: 3000 });
};

const getImagePreview = (files: File[]): string[] => {
  return files.map(file => URL.createObjectURL(file));
};

const generateCombinations = () => {
  const validVariants = variants.value.filter(v => v.attributeId !== 0 && v.values.length > 0);
  if (validVariants.length === 0) {
    variantCombinations.value = [];
    return;
  }

  const arrays = validVariants.map(v => v.values);
  let combinations: string[][] = [[]];
  for (const array of arrays) {
    const temp: string[][] = [];
    for (const combination of combinations) {
      for (const value of array) {
        temp.push([...combination, value]);
      }
    }
    combinations = temp;
  }

  variantCombinations.value = combinations.map(combination => {
    const attributes = validVariants.map((variant, idx) => ({
      attributeId: variant.attributeId,
      value: combination[idx],
      price: undefined,
      stockQuantity: undefined
    }));
    const variantName = `${product.name} - ${combination.join(' - ')}`;
    return {
      name: variantName,
      sku: `${product.sku}-${combination.join('-')}`,
      price: undefined,
      stockQuantity: undefined,
      attributes: attributes as ProductAttributeValue[],
      images: []
    };
  });
};

watch(
  () => variants.value,
  () => {
    updateAvailableAttributes();
    generateCombinations();
  },
  { deep: true }
);

const submitProduct = async () => {
  submitted.value = true;
  isSubmitting.value = true;

  if (!product.name ||  !product.categoryId || !product.supplierId || !product.description) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Vui lòng điền đầy đủ các trường bắt buộc.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (variantCombinations.value.length > 0 && variantCombinations.value.some(v => v.price === undefined || v.stockQuantity === undefined)) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Vui lòng điền giá và số lượng cho tất cả biến thể.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (
    variantCombinations.value.length > 0 &&
    variantCombinations.value.some(
      v =>
        v.price === undefined ||
        v.price === null ||
        isNaN(Number(v.price)) ||
        Number(v.price) <= 0 ||
        v.stockQuantity === undefined ||
        v.stockQuantity === null ||
        isNaN(Number(v.stockQuantity)) ||
        Number(v.stockQuantity) < 0
    )
  ) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Vui lòng nhập giá > 0 và số lượng >= 0 cho tất cả biến thể.',
      life: 3000
    });
    isSubmitting.value = false;
    return;
  }

  if (variantCombinations.value.length > 0 && variantCombinations.value.some(v => !v.images || v.images.length === 0)) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Vui lòng tải lên ít nhất một hình ảnh cho mỗi biến thể.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (!parentImages.value || parentImages.value.length === 0) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm cha.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  const requestData: ProductRequest = {
    ...product,
    productAttributeValues: Array.from(
      new Map(
        variants.value
          .filter(v => v.attributeId !== 0)
          .flatMap(v => v.values.map(value => [value, v.attributeId]))
          .map(([value, attributeId]) => [value, { attributeId, value } as ProductAttributeValue])
      ).values()
    ),
    variants: variantCombinations.value.map(v => ({
      price: v.price,
      stockQuantity: v.stockQuantity
    })),
    inventoryIds: []
  };

  const variantUploadedFiles: File[][] = variantCombinations.value.map(v => v.images);
  const parentUploadedFiles: File[] = parentImages.value;

  try {
    const message = await ProductService.addProduct(requestData, parentUploadedFiles, variantUploadedFiles);
    toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    router.push('/documentation');
  } catch (error: any) {
    const errorMessage = error.message || 'Lỗi khi thêm sản phẩm';
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    const [categoriesResponse, supplierResponse, productAttributeResponse, productTagResponse] = 
      await Promise.all([
        CategoryService.getAllCategories(),
        SupplierService.getAllSuppliers(),
        ProductAttributeService.getAllProductAttribute(),
        ProductTagService.getAllTags()
      ]);

    categories.value = categoriesResponse.data || [];
    suppliers.value = supplierResponse.data || [];
    productAttributes.value = productAttributeResponse.data || [];
    availableAttributes.value = [...productAttributes.value];
    productTags.value = productTagResponse.data || [];

    console.log('Initial product  attributes:', productAttributes.value);
    console.log('Initial available attributes:', availableAttributes.value);
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.message || 'Failed to load data. Please try again later.', 
      life: 3000 
    });
  }
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Thêm sản phẩm</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName">Tên sản phẩm</label>
            <InputText id="productName" v-model="product.name" placeholder="nhập tên sản phẩm" :class="{'p-invalid': submitted && !product.name}" />
            <small class="p-error" v-if="submitted && !product.name">Tên sản phẩm là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sku">SKU</label>
            <InputText id="sku" v-model="product.sku" placeholder="tự động sinh" disabled />
            <!-- <small class="p-error" v-if="submitted && !product.sku">SKU is required.</small> -->
          </div>
          <div class="field col-12 md:col-6">
            <label for="productCategory">Danh mục</label>
            <Dropdown
              id="productCategory"
              v-model="product.categoryId"
              :options="categories"
              optionLabel="name"
              optionValue="id"
              placeholder="chọn danh mục"
              :class="{'p-invalid': submitted && !product.categoryId}"
            />
            <small class="p-error" v-if="submitted && !product.categoryId">Danh mục là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sportType">Loại thể thao</label>
            <InputText id="sportType" v-model="product.sportType" placeholder="Enter sport type" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="productTag">Nhãn</label>
            <MultiSelect
              id="productTag"
              v-model="product.tagId"
              :options="productTags"
              optionLabel="name"
              optionValue="id"
              placeholder="chọn nhãn"
              :multiple="true"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="supplier">Nhà cung cấp</label>
            <Dropdown
              id="supplier"
              v-model="product.supplierId"
              :options="suppliers"
              optionLabel="name"
              optionValue="id"
              placeholder="chọn nhà cung cấp"
              :class="{'p-invalid': submitted && !product.supplierId}"
            />
            <small class="p-error" v-if="submitted && !product.supplierId">Nhà cung cấp là bắt buộc.</small>
          </div>
          <div class="field col-12">
            <label for="productDescription">Mô tả</label>
            <Textarea 
              id="productDescription" 
              v-model="product.description" 
              rows="4" 
              placeholder="nhập mô tả"
              :class="{'p-invalid': submitted && !product.description}"
            />
            <small class="p-error" v-if="submitted && !product.description">Mô tả là bắt buộc.</small>
          </div>
          <div class="field col-12">
            <label for="parentImages">Hình ảnh sản phẩm</label>
            <FileUpload
              name="parentImages"
              :multiple="true"
              accept="image/*"
              :auto="false"
              chooseLabel="chọn hình ảnh"
              @select="onParentImageUpload"
              :maxFileSize="1000000"
              @error="onError"
              :class="{'p-invalid': submitted && (!parentImages || parentImages.length === 0)}"
            />
            <small class="p-error" v-if="submitted && (!parentImages || parentImages.length === 0)">Ít nhất một hình ảnh sản phẩm là bắt buộc.</small>
          </div>
        </div>

        <div class="variants mt-4">
          <h3>Thuộc tính sản phẩm</h3>
          <div class="variant-row" v-for="(variant, index) in variants" :key="index">
            <Dropdown
              v-model="variant.attributeId"
              :options="availableAttributes"
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn thuộc tính"
              class="variant-select"
              @change="updateAvailableAttributes"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  {{ getAttributeName(slotProps.value) }}
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
            </Dropdown>
            <div class="variant-values">
              <div class="p-inputgroup">
                <InputText
                  v-model="variant.currentValue"
                  placeholder="nhập giá trị và nhấn Enter"
                  class="variant-input"
                  @keydown.enter="addVariantValue(index)"
                />
                <Button 
                  icon="pi pi-plus" 
                  @click="addVariantValue(index)"
                  :disabled="!variant.currentValue.trim()"
                />
              </div>
              <div class="value-chips mt-2">
                <Chip
                  v-for="(value, valueIndex) in variant.values"
                  :key="valueIndex"
                  :label="value"
                  removable
                  @remove="removeVariantValue(index, valueIndex)"
                  class="mr-2 mb-2"
                />
              </div>
            </div>
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              @click="removeVariant(index)"
              class="align-self-start"
            />
          </div>
          <Button 
            label="Thêm thuộc tính" 
            icon="pi pi-plus" 
            @click="addVariant" 
            class="mt-2"
            severity="secondary"
            :disabled="availableAttributes.length === 0"
          />
        </div>

        <div class="variant-combinations mt-4" v-if="variantCombinations.length > 0">
          <h3>Danh sách biến thể</h3>
          <DataTable :value="variantCombinations" responsiveLayout="scroll">
            <Column header="Hình ảnh">
              <template #body="slotProps">
                <div class="variant-image-upload">
                  <FileUpload
                    :name="'variantImages' + slotProps.index"
                    :multiple="true"
                    accept="image/*"
                    :auto="false"
                    chooseLabel="chọn hình ảnh"
                    @select="onVariantImageUpload(slotProps.index, $event)"
                    :maxFileSize="1000000"
                    @error="onError"
                    :class="{'p-invalid': submitted && (!slotProps.data.images || slotProps.data.images.length === 0)}"
                  />
                </div>
              </template>
            </Column>
            <Column header="Tên">
              <template #body="slotProps">
                {{ slotProps.data.name }}
              </template>
            </Column>
            <Column header="Giá">
              <template #body="slotProps">
                <InputNumber 
                  v-model="slotProps.data.price"
                  mode="currency"
                  currency="VND"
                  :minFractionDigits="0"
                  :class="{'p-invalid': submitted && slotProps.data.price === undefined}"
                />
              </template>
            </Column>
            <Column header="Kho">
              <template #body="slotProps">
                <InputNumber 
                  v-model="slotProps.data.stockQuantity"
                  :min="0"
                  :class="{'p-invalid': submitted && slotProps.data.stockQuantity === undefined}"
                />
              </template>
            </Column>
            <Column>
              <template #body="slotProps">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  @click="variantCombinations.splice(slotProps.index, 1)"
                  :class="{'p-button-sm': true}"
                />
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="flex justify-content-end mt-4">
          <Button label="Hủy" icon="pi pi-times" severity="secondary" class="mr-2" @click="router.push('/documentation')" />
          <Button
            label="Thêm Sản Phẩm"
            icon="pi pi-check"
            @click="submitProduct"
            :loading="isSubmitting"
            :disabled="variants.length === 0"
          />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.variants {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.variant-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.variant-select {
  flex: 1;
  min-width: 200px;
}

.variant-values {
  flex: 2;
}

.variant-input {
  width: 100%;
}

.value-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

:deep(.p-chip) {
  background-color: #e9ecef;
}

:deep(.p-chip .p-chip-remove-icon) {
  margin-left: 0.5rem;
}

.p-inputgroup {
  display: flex;
}

.p-inputgroup .p-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.p-inputgroup .p-inputtext {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
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

.variant-combinations {
  margin-top: 2rem;
  background-color: #fff;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.variant-image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-datatable) {
  .p-datatable-thead > tr > th {
    background-color: #f8f9fa;
    padding: 0.75rem;
  }
  
  .p-datatable-tbody > tr > td {
    padding: 0.75rem;
    vertical-align: middle;
  }
}

:deep(.p-fileupload-choose) {
  width: auto !important;
  padding: 0.5rem !important;
}

:deep(.p-fileupload .p-button) {
  margin-top: 0.5rem;
}
</style>