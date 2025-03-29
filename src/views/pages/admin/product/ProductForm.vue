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
import type { ProductRequest, ProductAttributeValue, ProductVariant } from '../../../../model/product';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';

const toast = useToast();
const submitted = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

// Thêm biến để lưu trữ ảnh của sản phẩm cha
const parentImages = ref<File[]>([]);

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

// Hàm xử lý khi upload ảnh cho sản phẩm cha
const onParentImageUpload = (event: any) => {
  const selectedFiles: File[] = event.files;
  parentImages.value = selectedFiles;
  toast.add({ severity: 'success', summary: 'Parent Images Selected', detail: `Selected ${selectedFiles.length} images for parent product`, life: 3000 });
};

const onError = (error: any) => {
  toast.add({ severity: 'error', summary: 'Upload Error', detail: error.message, life: 3000 });
};

const addVariant = () => {
  variants.value.push({
    attributeId: 0,
    values: [],
    currentValue: '',
    variantImages: new Map()
  });
};



const removeVariant = (index: number) => {
  variants.value.splice(index, 1);
  generateCombinations();
};

const addVariantValue = (index: number) => {
  const variant = variants.value[index];
  const value = variant.currentValue.trim();
  if (value && !variant.values.includes(value)) {
    variant.values.push(value);
    variant.currentValue = '';
    variant.variantImages.set(value, []);
    toast.add({ severity: 'success', summary: 'Value Added', detail: `Added "${value}"`, life: 3000 });
    generateCombinations();
  } else if (value) {
    toast.add({ severity: 'warn', summary: 'Duplicate Value', detail: 'This value already exists', life: 3000 });
  }
};

const removeVariantValue = (variantIndex: number, valueIndex: number) => {
  const variant = variants.value[variantIndex];
  const removedValue = variant.values[valueIndex];
  variant.values.splice(valueIndex, 1);
  variant.variantImages.delete(removedValue);
  toast.add({ severity: 'info', summary: 'Value Removed', detail: `Removed "${removedValue}"`, life: 3000 });
  generateCombinations();
};

// Cập nhật hàm onVariantImageUpload để lưu trữ ảnh cho từng biến thể
const onVariantImageUpload = (index: number, event: any) => {
  const selectedFiles: File[] = event.files;
  const combination = variantCombinations.value[index];
  combination.images = selectedFiles || [];
  toast.add({ severity: 'success', summary: 'Images Selected', detail: `Selected ${selectedFiles.length} images for variant "${combination.name}"`, life: 3000 });
};

// Hiển thị preview ảnh
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
      images: [] // Khởi tạo images rỗng, sẽ được gán khi upload
    };
  });
};

watch(() => [...variants.value], () => {
  generateCombinations();
}, { deep: true });

const submitProduct = async () => {
  submitted.value = true;
  isSubmitting.value = true;

  // Validation
  if (!product.name || !product.sku || !product.categoryId || !product.supplierId || !product.description) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (variantCombinations.value.length > 0 && variantCombinations.value.some(v => v.price === undefined || v.stockQuantity === undefined)) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill price and stock for all variants.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (variantCombinations.value.length > 0 && variantCombinations.value.some(v => !v.images || v.images.length === 0)) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please upload at least one image for each variant.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  if (!parentImages.value || parentImages.value.length === 0) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please upload at least one image for the parent product.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  // Chuẩn bị dữ liệu gửi đi
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

  // Chuẩn bị uploadedFiles từ variantCombinations và parentImages
  const variantUploadedFiles: File[][] = variantCombinations.value.map(v => v.images);
  const parentUploadedFiles: File[] = parentImages.value;

  try {
    console.log('Submitting product:', JSON.stringify(requestData, null, 2));
    const message = await ProductService.addProduct(requestData, parentUploadedFiles, variantUploadedFiles);
    toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    router.push('/documentation');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errorMessage = error.message || 'Failed to submit product';
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
    productTags.value = productTagResponse.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 
      life: 3000 
    });
  }
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Add Product</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName">Product Name</label>
            <InputText id="productName" v-model="product.name" placeholder="Enter product name" :class="{'p-invalid': submitted && !product.name}" />
            <small class="p-error" v-if="submitted && !product.name">Product name is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sku">SKU</label>
            <InputText id="sku" v-model="product.sku" placeholder="Enter SKU" :class="{'p-invalid': submitted && !product.sku}" />
            <small class="p-error" v-if="submitted && !product.sku">SKU is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="productCategory">Category</label>
            <Dropdown
              id="productCategory"
              v-model="product.categoryId"
              :options="categories"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Category"
              :class="{'p-invalid': submitted && !product.categoryId}"
            />
            <small class="p-error" v-if="submitted && !product.categoryId">Category is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sportType">Sport Type</label>
            <InputText id="sportType" v-model="product.sportType" placeholder="Enter sport type" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="productTag">Tags</label>
            <MultiSelect
              id="productTag"
              v-model="product.tagId"
              :options="productTags"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Tags"
              :multiple="true"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="supplier">Supplier</label>
            <Dropdown
              id="supplier"
              v-model="product.supplierId"
              :options="suppliers"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Supplier"
              :class="{'p-invalid': submitted && !product.supplierId}"
            />
            <small class="p-error" v-if="submitted && !product.supplierId">Supplier is required.</small>
          </div>
          <div class="field col-12">
            <label for="productDescription">Description</label>
            <Textarea 
              id="productDescription" 
              v-model="product.description" 
              rows="4" 
              placeholder="Enter product description"
              :class="{'p-invalid': submitted && !product.description}"
            />
            <small class="p-error" v-if="submitted && !product.description">Description is required.</small>
          </div>

          <!-- Thêm phần upload ảnh cho sản phẩm cha -->
          <div class="field col-12">
            <label for="parentImages">Parent Product Images</label>
            <FileUpload
              name="parentImages"
              :multiple="true"
              accept="image/*"
              :auto="false"
              chooseLabel="Choose Images"
              @select="onParentImageUpload"
              :maxFileSize="1000000"
              @error="onError"
              :class="{'p-invalid': submitted && (!parentImages || parentImages.length === 0)}"
            />
            <!-- <div v-if="parentImages && parentImages.length > 0" class="image-preview mt-2">
              <div v-for="(image, index) in getImagePreview(parentImages)" :key="index" class="preview-item">
                <img :src="image" alt="Preview" style="max-width: 100px; max-height: 100px; margin-right: 10px;" />
              </div>
            </div> -->
            <small class="p-error" v-if="submitted && (!parentImages || parentImages.length === 0)">At least one parent image is required.</small>
          </div>
        </div>

        <div class="variants mt-4">
          <h3>Product Attributes</h3>
          <div class="variant-row" v-for="(variant, index) in variants" :key="index">
            <Dropdown
              v-model="variant.attributeId"
              :options="productAttributes"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Attribute"
              class="variant-select"
            />
            <div class="variant-values">
              <div class="p-inputgroup">
                <InputText
                  v-model="variant.currentValue"
                  placeholder="Enter value and press Enter"
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
            label="Add Attribute" 
            icon="pi pi-plus" 
            @click="addVariant" 
            class="mt-2"
            severity="secondary"
          />
        </div>

        <!-- Cập nhật bảng biến thể -->
        <div class="variant-combinations mt-4" v-if="variantCombinations.length > 0">
          <h3>Danh sách hàng hóa cùng loại</h3>
          <DataTable :value="variantCombinations" responsiveLayout="scroll">
            <Column header="Ảnh">
              <template #body="slotProps">
                <div class="variant-image-upload">
                  <FileUpload
                    :name="'variantImages' + slotProps.index"
                    :multiple="true"
                    accept="image/*"
                    :auto="false"
                    chooseLabel="Choose Images"
                    @select="onVariantImageUpload(slotProps.index, $event)"
                    :maxFileSize="1000000"
                    @error="onError"
                    :class="{'p-invalid': submitted && (!slotProps.data.images || slotProps.data.images.length === 0)}"
                  />
                  <!-- Hiển thị preview ảnh nếu đã upload -->
                  <!-- <div v-if="slotProps.data.images && slotProps.data.images.length > 0" class="image-preview mt-2">
                    <div v-for="(image, index) in getImagePreview(slotProps.data.images)" :key="index" class="preview-item">
                      <img :src="image" alt="Preview" style="max-width: 100px; max-height: 100px; margin-right: 10px;" />
                    </div>
                  </div> -->
                </div>
              </template>
            </Column>
            <Column header="Tên">
              <template #body="slotProps">
                {{ slotProps.data.name }}
              </template>
            </Column>
            <Column header="Giá bán">
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
            <Column header="Tồn kho">
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
          <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="router.push('/documentation')" />
          <Button label="Submit Product" icon="pi pi-check" @click="submitProduct" :loading="isSubmitting" />
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

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item img {
  border-radius: 4px;
  object-fit: cover;
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