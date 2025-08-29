```vue
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h5>Thêm sản phẩm</h5>
          <Button label="Quay lại" icon="pi pi-arrow-left" @click="$router.back()" />
        </div>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName" class="required">Tên sản phẩm</label>
            <InputText id="productName" v-model="product.name" 
            placeholder="Nhập tên sản phẩm" :class="{'p-invalid': submitted && !product.name}" 
            maxlength="50"/>
            <small class="p-error" v-if="submitted && !product.name">Tên sản phẩm là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sku"  class="required">Mã Sản Phẩm</label>
            <InputText id="sku" v-model="product.sku" placeholder="Tự động sinh" disabled />
          </div>
          <div class="field col-12 md:col-6" >
            <label for="productCategory" class="required">Danh mục</label>
            <Dropdown
              id="productCategory"
              v-model="product.categoryId"
              :options="categories"
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn danh mục"
              :class="{'p-invalid': submitted && !product.categoryId}"
            />
            <small class="p-error" v-if="submitted && !product.categoryId">Danh mục là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sportType" class="required">Loại thể thao</label>
            <InputText id="sportType" v-model="product.sportType" 
            placeholder="Nhập loại thể thao" 
            maxlength="50"
            :class="{'p-invalid': submitted && !product.sportType}"
            />
            <small class="p-error" v-if="submitted && !product.sportType">Loại thể thao là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="productTag" class="required">Nhãn</label>
            <MultiSelect
              id="productTag"
              v-model="product.tagId"
              :options="productTags"
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn nhãn"
              :multiple="true"
              :class="{'p-invalid': submitted && product.tagId.length === 0}"
            />
            <small class="p-error" v-if="submitted && product.tagId.length === 0">Nhãn là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="supplier" class="required">Nhà cung cấp</label>
            <Dropdown
              id="supplier"
              v-model="product.supplierId"
              :options="suppliers"
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn nhà cung cấp"
              :class="{'p-invalid': submitted && !product.supplierId}"
            />
            <small class="p-error" v-if="submitted && !product.supplierId">Nhà cung cấp là bắt buộc.</small>
          </div>
          <div class="field col-12">
            <label for="productDescription" class="required">Mô tả</label>
            <Textarea 
              id="productDescription" 
              v-model="product.description" 
              rows="4" 
              placeholder="Nhập mô tả"
              :class="{'p-invalid': submitted && !product.description}"
              maxlength="255"
            />
            <small class="p-error" v-if="submitted && !product.description">Mô tả là bắt buộc.</small>
          </div>
          <div class="field col-12">
            <label for="parentImages" class="required">Hình ảnh sản phẩm</label>
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
              <template #footer>
                <div style="text-align: start; padding: 0.5rem;">
                  <Button
                    label="+Thêm thuộc tính mới"
                    @click="openAddAttributeDialog"
                    class="p-button-text"
                  />
                </div>
              </template>
            </Dropdown>
            <div class="variant-values">
              <div class="p-inputgroup">
                <InputText
                  v-model="variant.currentValue"
                  placeholder="Nhập giá trị và nhấn Enter"
                  class="variant-input"
                  maxlength="30"
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
                  :key="value"
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
          <div class="flex justify-content-between mb-3 align-items-end">
            <div class="flex gap-3 align-items-end">
              <div class="field">
                <label for="defaultPrice">Giá mặc định: </label>
                <InputNumber 
                  id="defaultPrice"
                  v-model="defaultPrice"
                  mode="currency"
                  currency="VND"
                  :min="20000"
                  :max="30000000"
                  :step="1000"
                  :minFractionDigits="0"
                  :maxFractionDigits="0"
                  placeholder="Nhập giá mặc định"
                />
              </div>
              <div class="field">
                <label for="defaultStock">Số lượng mặc định: </label>
                <InputNumber 
                  id="defaultStock"
                  v-model="defaultStock"
                  :min="1"
                  :max="1000"
                  :step="1"
                  :minFractionDigits="0"
                  :maxFractionDigits="0"
                  placeholder="Nhập số lượng mặc định"
                />
              </div>
              <Button 
                label="Áp dụng" 
                icon="pi pi-check-circle" 
                @click="applyDefaultValues" 
                severity="info"
                style="margin-bottom: 15px;"
                :disabled="!defaultPrice || !defaultStock"
              />
            </div>
          </div>
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
                  <small class="p-error" v-if="submitted && (!slotProps.data.images || slotProps.data.images.length === 0)">
                    Ít nhất một hình ảnh sản phẩm là bắt buộc.
                  </small>
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
                <div>
                 <InputNumber 
                  v-model="slotProps.data.price"
                  mode="currency"
                  currency="VND"
                  :max="30000000"
                  :step="1000"
                  :defaultPrice="20000"
                  :min="20000"
                  :maxFractionDigits="0"
                 :style="submitted && (
                  slotProps.data.price === undefined || 
                  slotProps.data.price < 20000 || 
                  slotProps.data.price > 30000000
                ) ? { marginTop: '18px' } : {}"
                  :minFractionDigits="0"
                  :class="[
                    submitted && (
                      slotProps.data.price === undefined || 
                      slotProps.data.price < 20000 || 
                      slotProps.data.price > 30000000
                    ) ? 'p-invalid ' : ''
                  ]"
                  
                  />
                <p 
                  class="p-error" 
                  style="font-size: 10px;" 
                  v-show="submitted && (
                    slotProps.data.price === undefined || 
                    slotProps.data.price < 20000 || 
                    slotProps.data.price > 30000000
                  )"
                >
                  Giá phải từ 20.000đ đến 30.000.000đ.
                </p>

                </div>
              </template>
            </Column>
            <Column header="Số lượng">
              <template #body="slotProps">
                <div>
                  <InputNumber 
                    v-model="slotProps.data.stockQuantity"
                    :min="1"
                    :step="1"
                    :max="1000"
                    :minFractionDigits="0"
                    :maxFractionDigits="0"
                   :style="submitted && (
                  slotProps.data.stockQuantity === undefined || 
                  slotProps.data.stockQuantity < 1 || 
                  slotProps.data.stockQuantity > 1000
                ) ? { marginTop: '18px' } : {}"
                  :class="[
                    submitted && (
                      slotProps.data.stockQuantity === undefined || 
                      slotProps.data.stockQuantity < 1 || 
                      slotProps.data.stockQuantity > 1000
                    ) ? 'p-invalid ' : ''
                  ]"
                    
                  />
                  <p class="p-error" style="font-size: 10px;" v-if="submitted && (
                    slotProps.data.stockQuantity === undefined || 
                    slotProps.data.stockQuantity < 1 || 
                    slotProps.data.stockQuantity > 1000
                  )">
                    Số lượng phải từ 1 đến 1.000.
                  </p>
                </div>
              </template>
            </Column>
            <Column>
              <!-- <template #body="slotProps">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  @click="variantCombinations.splice(slotProps.index, 1)"
                  :class="{'p-button-sm': true}"
                />
              </template> -->
            </Column>
          </DataTable>
        </div>

        <div class="flex justify-content-end mt-4">
          <Button label="Hủy" icon="pi pi-times" severity="secondary" class="mr-2" @click="router.push('/products')" />
          <Button
            label="Thêm Sản Phẩm"
            icon="pi pi-check"
            @click="submitProduct"
            :loading="isSubmitting"
            :disabled="variants.length === 0"
          />
        </div>

        <!-- Sử dụng component dialog -->
        <AddAttribute
          v-model:visible="addAttributeDialogVisible"
          :product-attributes="productAttributes"
          :available-attributes="availableAttributes"
          @attribute-added="handleAttributeAdded"
        />
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { CategoryService } from '../../../../service/admin/CategoryService';
import { SupplierService } from '../../../../service/admin/SupplierService';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import { ProductTagService } from '../../../../service/admin/ProductTagService';
import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/admin/category';
import type { SupplierResponse } from '../../../../model/admin/supplier';
import type { ProductTagResponse } from '../../../../model/admin/ProductTag';
import type { ProductRequest, ProductAttributeValue } from '../../../../model/admin/product';
import type { ProductAttributeResponse } from '../../../../model/admin/productAttribute';
import AddAttribute from './AddAttribute.vue';


const defaultImageUrl = new URL('@/assets/img/airforce2.png', import.meta.url).href;
// Placeholder mặc định
const toast = useToast();
const submitted = ref(false);
const isSubmitting = ref(false);
const router = useRouter();
const addAttributeDialogVisible = ref(false);

const parentImages = ref<File[]>([]);
const productAttributes = ref<ProductAttributeResponse[]>([]);
const availableAttributes = ref<ProductAttributeResponse[]>([]);

const defaultPrice = ref(500000);
const defaultStock = ref(100);

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
const productTags = ref<ProductTagResponse[]>([]);

const getAttributeName = (attributeId: number) => {
  const attribute = productAttributes.value.find(attr => attr.id === attributeId);
  return attribute ? attribute.name : '';
};

const applyDefaultValues = () => {
  if (!defaultPrice.value || !defaultStock.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập cả giá và số lượng mặc định.',
      life: 3000
    });
    return;
  }

  if (
    defaultPrice.value < 20000 ||
    defaultPrice.value > 30000000 ||
    defaultStock.value < 1 ||
    defaultStock.value > 1000
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Lỗi',
      detail: 'Giá phải từ 20,000 đến 30,000,000 VND và số lượng từ 1 đến 1,000.',
      life: 3000
    });
    return;
  }

  variantCombinations.value.forEach(variant => {
    variant.price = defaultPrice.value;
    variant.stockQuantity = defaultStock.value;
  });

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã áp dụng giá ${defaultPrice.value.toLocaleString('vi-VN')} VND và số lượng ${defaultStock.value} cho tất cả biến thể.`,
    life: 3000
  });
};

const onParentImageUpload = (event: any) => {
  const selectedFiles: File[] = event.files;
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  const invalidFiles = selectedFiles.filter(file => !validImageTypes.includes(file.type));

  if (invalidFiles.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'File không hợp lệ',
      detail: 'Chỉ cho phép hình ảnh (JPG, PNG, WEBP, GIF). Không được tải lên file Excel hoặc định dạng khác.',
      life: 4000
    });
    event.options.clear();
    parentImages.value = [];
    return;
  }

  parentImages.value = selectedFiles;
  // generateCombinations();
  toast.add({
    severity: 'success',
    summary: 'Hình ảnh hợp lệ',
    detail: `Đã chọn ${selectedFiles.length} hình ảnh`,
    life: 3000
  });
};

const onError = (error: any) => {
  toast.add({ severity: 'error', summary: 'Lỗi tải lên', detail: error.message, life: 3000 });
};

const updateAvailableAttributes = () => {
  const selectedAttributeIds = variants.value
    .map(v => v.attributeId)
    .filter(id => id !== 0 && id !== undefined && id !== null);

  availableAttributes.value = productAttributes.value.filter(attr => 
    !selectedAttributeIds.includes(attr.id)
  );
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
  toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm thuộc tính mới', life: 3000 });
};

const removeVariant = (index: number) => {
  variants.value.splice(index, 1);
  generateCombinations();
  updateAvailableAttributes();
  toast.add({ severity: 'info', summary: 'Thành công', detail: 'Đã xóa thuộc tính', life: 3000 });
};

const addVariantValue = (index: number) => {
  const variant = variants.value[index];
   if (!variant.attributeId) {
    toast.add({
      severity: "warn",
      summary: "Thiếu thuộc tính",
      detail: "Vui lòng chọn thuộc tính trước khi nhập giá trị.",
      life: 3000
    });
    return;
  }
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
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  const invalidFiles = selectedFiles.filter(file => !validImageTypes.includes(file.type));

  if (invalidFiles.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'File không hợp lệ',
      detail: 'Chỉ cho phép hình ảnh (JPG, PNG, WEBP, GIF).',
      life: 4000
    });
    event.options.clear();
    return;
  }

  if (variantCombinations.value[index]) {
    variantCombinations.value[index].images = [...selectedFiles]; // Thay thế hoàn toàn ảnh hiện tại bằng ảnh mới
    variantCombinations.value = [...variantCombinations.value]; // Force re-render
    toast.add({
      severity: 'success',
      summary: 'Hình ảnh đã chọn',
      detail: `Đã chọn ${selectedFiles.length} hình ảnh cho biến thể "${variantCombinations.value[index].name}"`,
      life: 3000
    });
  } else {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Biến thể không tồn tại để thêm hình ảnh.', life: 3000 });
  }
};

const getImagePreview = (files: File[]): string[] => {
  return files.map(file => URL.createObjectURL(file));
};
const generateCombinations = () => {
  const validVariants = variants.value.filter(
    v => v.attributeId !== 0 && v.values.length > 0
  );

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

  const newCombinations = combinations.map(combination => {
    const attributes = validVariants.map((variant, idx) => ({
      attributeId: variant.attributeId,
      value: combination[idx]
    }));

    let existing = variantCombinations.value.find(v =>
      v.attributes.length === attributes.length &&
      v.attributes.every(
        (a, i) =>
          a.attributeId === attributes[i].attributeId &&
          a.value === attributes[i].value
      )
    );

    if (!existing) {
      existing = variantCombinations.value.find(v =>
        attributes.every(a =>
          v.attributes.some(
            old =>
              old.attributeId === a.attributeId && old.value === a.value
          )
        )
      );
    }

    const variantName = product.name
      ? `${product.name} - ${combination.join(' - ')}`
      : `Biến thể - ${combination.join(' - ')}`;

    const sku = product.sku
      ? `${product.sku}-${combination.join('-')}`
      : `SKU-${combination.join('-')}`;

    return {
      name: variantName,
      sku,
      price: existing ? existing.price : defaultPrice.value,
      stockQuantity: existing ? existing.stockQuantity : defaultStock.value,
      attributes,
      images:
        existing && existing.images && existing.images.length > 0
          ? existing.images
          : [new File([''], 'default.png', { type: 'image/png' })]
    };
  });

  variantCombinations.value.splice(0, variantCombinations.value.length, ...newCombinations);
};




watch(
  () => variants.value,
  () => {
    updateAvailableAttributes();
    // generateCombinations();
  },
  { deep: true }
);

watch(
  () => product.name,
  (newName) => {
    if (!newName) return;
    variantCombinations.value = variantCombinations.value.map((combination) => {
      const variantName = `${newName} - ${combination.attributes.map(attr => attr.value).join(' - ')}`;
      return {
        ...combination,
        name: variantName,
        sku: `${product.sku}-${combination.attributes.map(attr => attr.value).join('-')}`
      };
    });
  }
);

// watch(
//   () => parentImages.value,
//   () => {
//     generateCombinations();
//   },
//   { deep: true }
// );


const submitProduct = async () => {
  submitted.value = true;
  isSubmitting.value = true;

  const errorMessage = validateProduct();
  if (errorMessage) {
    // toast.add({ severity: "error", summary: "Lỗi", detail: errorMessage, life: 3000 });
    isSubmitting.value = false;
    return;
  }

  // build payload
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
    toast.add({ severity: "success", summary: "Thành công", detail: message, life: 3000 });
    router.push("/products");
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Lỗi", detail: error.message || "Lỗi khi thêm sản phẩm", life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};


const openAddAttributeDialog = () => {
  addAttributeDialogVisible.value = true;
};

const handleAttributeAdded = (newAttribute: ProductAttributeResponse) => {
  productAttributes.value.push(newAttribute);
  availableAttributes.value.push(newAttribute);
  updateAvailableAttributes();
  toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã thêm thuộc tính "${newAttribute.name}"`, life: 3000 });
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
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.message || 'Failed to load data. Please try again later.', 
      life: 3000 
    });
  }
});

const validateProduct = () => {
  product.name = product.name?.trim() || "";
  product.description = product.description?.trim() || "";
  product.sportType = product.sportType?.trim() || "";

  const requiredFields = [
    { field: product.name, message: "Tên sản phẩm là bắt buộc." },
    { field: product.categoryId, message: "Danh mục là bắt buộc." },
    { field: product.supplierId, message: "Nhà cung cấp là bắt buộc." },
    { field: product.description, message: "Mô tả là bắt buộc." },
    { field: product.sportType, message: "Loại thể thao là bắt buộc." },
    { field: product.tagId?.length, message: "Nhãn là bắt buộc." }
  ];

  for (const rule of requiredFields) {
    if (!rule.field) return rule.message;
  }

  for (const v of variantCombinations.value) {
    const price = Number(v.price);
    const stock = Number(v.stockQuantity);

    if (!v.images || v.images.length === 0) {
      return "Mỗi biến thể cần ít nhất một hình ảnh.";
    }
    if (!price || isNaN(price) || price < 20000 || price > 30000000) {
      return "Giá phải từ 20.000đ đến 30.000.000đ.";
    }
    if (!stock || isNaN(stock) || stock < 1 || stock > 1000) {
      return "Số lượng phải từ 1 đến 1.000.";
    }
  }

  if (!parentImages.value || parentImages.value.length === 0) {
    return "Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm.";
  }

  return null; 
};

const handlePriceBlur = (data: { price: number; stockQuantity: number; }) => {
  if (!data.price || data.price === 0) {
    data.price = 20000;
    data.stockQuantity = 10;
  }
};
</script>

<style scoped>
label.required::after {
  content: " *";
  color: red;
}
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

</style>
```