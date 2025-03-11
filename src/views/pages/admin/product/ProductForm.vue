<template>
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h5>Add Product</h5>
          <div class="p-fluid formgrid grid">
            <!-- Tên sản phẩm -->
            <div class="field col-12 md:col-6">
              <label for="productName">Product Name</label>
              <InputText id="productName" v-model="product.name" placeholder="Enter product name" :class="{'p-invalid': submitted && !product.name}" />
              <small class="p-error" v-if="submitted && !product.name">Product name is required.</small>
            </div>
  
            <!-- SKU -->
            <div class="field col-12 md:col-6">
              <label for="sku">SKU</label>
              <InputText id="sku" v-model="product.sku" placeholder="Enter SKU" :class="{'p-invalid': submitted && !product.sku}" />
              <small class="p-error" v-if="submitted && !product.sku">SKU is required.</small>
            </div>
  
            <!-- Danh mục sản phẩm -->
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
  
            <!-- Sport Type -->
            <div class="field col-12 md:col-6">
              <label for="sportType">Sport Type</label>
              <InputText id="sportType" v-model="product.sportType" placeholder="Enter sport type" />
            </div>
  
            <!-- Tags -->
            <div class="field col-12 md:col-6">
              <label for="productTag">Tags</label>
              <MultiSelect
                id="productTag"
                v-model="product.tagId"
                :options="productTag"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Tags"
                :multiple="true"
              />
            </div>
  
            <!-- Supplier -->
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
  
            <!-- Mô tả sản phẩm -->
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
  
            <!-- Giá sản phẩm -->
            <div class="field col-12 md:col-6">
              <label for="productPrice">Price</label>
              <InputNumber 
                id="productPrice" 
                v-model="product.price" 
                placeholder="Enter price" 
                mode="currency" 
                currency="VND"
                :minFractionDigits="0"
                :class="{'p-invalid': submitted && !product.price}"
              />
              <small class="p-error" v-if="submitted && !product.price">Price is required.</small>
            </div>
  
            <!-- Số lượng sản phẩm -->
            <div class="field col-12 md:col-6">
              <label for="productStock">Stock</label>
              <InputNumber 
                id="productStock" 
                v-model="product.stockQuantity" 
                placeholder="Enter stock quantity"
                :class="{'p-invalid': submitted && !product.stockQuantity}"
              />
              <small class="p-error" v-if="submitted && !product.stockQuantity">Stock quantity is required.</small>
            </div>
  
            <!-- Upload ảnh sản phẩm cha -->
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
              >
                <template #empty>
                  <p>Drag and drop files here to upload.</p>
                </template>
              </FileUpload>
            </div>
          </div>
  
          <!-- Variants -->
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
                <!-- <FileUpload
                  :name="'variantImages' + index"
                  :multiple="true"
                  accept="image/*"
                  :auto="false"
                  chooseLabel="Choose Variant Images"
                  @select="onVariantImageUpload(index, $event)"
                  :maxFileSize="1000000"
                  @error="onError"
                >
                  <template #empty>
                    <p>Upload images for this variant value.</p>
                  </template>
                </FileUpload> -->
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
  
          <!-- Variant Combinations -->
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
                    />
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
                  />
                </template>
              </Column>
              <Column header="Tồn kho">
                <template #body="slotProps">
                  <InputNumber 
                    v-model="slotProps.data.stockQuantity"
                    :min="0"
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
  
          <!-- Submit Button -->
          <div class="flex justify-content-end mt-4">
            <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="router.push('/documentation')" />
            <Button label="Submit Product" icon="pi pi-check" @click="submitProduct" />
          </div>
        </div>
      </div>
      <Toast />
    </div>
  </template>
  
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
  import type { ProductRequest } from '../../../../model/product';
  import type { ProductAttributeResponse } from '../../../../model/productAttribute';
  const toast = useToast();
  const submitted = ref(false);
  const router = useRouter();
  
  // Form data
  const product = reactive<ProductRequest>({
    name: '',
    description: '',
    price: null,
    stockQuantity: null,
    sportType: '',
    sku: '',
    supplierId: null,
    categoryId: null,
    tagId: [],
    productAttributeValues: [],
    parentImages: [],
    inventoryIds: []
  });
  
  // Refs
  const variants = ref<Array<{ attributeId: number; values: string[]; currentValue: string; variantImages: Map<string, File[]> }>>([]);
  const variantCombinations = ref<Array<{ name: string; sku: string; price: number | null; stockQuantity: number | null; attributes: { attributeId: number; value: string }[] }>>([]);
  const categories = ref<CategoryResponse[]>([]);
  const suppliers = ref<SupplierResponse[]>([]);
  const productAttributes = ref<ProductAttributeResponse[]>([]);
  const productTag = ref<ProductTagResponse[]>([]);
  
  // Methods
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
  };
  
  const addVariantValue = (index: number) => {
    const variant = variants.value[index];
    const value = variant.currentValue.trim();
    if (value && !variant.values.includes(value)) {
      variant.values.push(value);
      variant.currentValue = '';
      variant.variantImages.set(value, []);
      toast.add({ severity: 'success', summary: 'Value Added', detail: `Added "${value}"`, life: 3000 });
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
  };
  
  const onParentImageUpload = (event: any) => {
    const selectedFiles = event.files;
    product.parentImages = [...selectedFiles];
    toast.add({ severity: 'success', summary: 'Images Selected', detail: 'Parent images ready to upload', life: 3000 });
  };
  
  const onVariantImageUpload = (index: number, event: any) => {
    const selectedFiles = event.files;
    const variantIdx = Math.floor(index / variants.value.reduce((acc, v) => acc * v.values.length, 1));
    const valueIdx = index % variants.value[variantIdx].values.length;
    const variant = variants.value[variantIdx];
    const value = variant.values[valueIdx];
    variant.variantImages.set(value, [...selectedFiles]);
    toast.add({ severity: 'success', summary: 'Images Selected', detail: `Variant images for "${value}" ready`, life: 3000 });
  };
  
  const onError = (error: any) => {
    toast.add({ severity: 'error', summary: 'Upload Error', detail: error.message, life: 3000 });
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
        value: combination[idx]
      }));
      const variantName = `${product.name}-${combination.join('-')}`;
      return {
        name: variantName,
        sku: `${product.sku}-${combination.join('-')}`,
        price: product.price,
        stockQuantity: product.stockQuantity,
        attributes
      };
    });
  };
  
  watch(() => [...variants.value], () => {
    generateCombinations();
  }, { deep: true });
  
  const submitProduct = async () => {
    submitted.value = true;
  
    if (!product.name || !product.sku || !product.categoryId || !product.supplierId || !product.description || !product.price || !product.stockQuantity) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields.', life: 3000 });
      return;
    }
  
    product.productAttributeValues = variants.value
      .filter(variant => variant.attributeId !== 0 && variant.values.length > 0)
      .flatMap(variant =>
        variant.values.map(value => ({
          attributeId: variant.attributeId,
          value,
          variantImages: variant.variantImages.get(value) || []
        }))
      );
  
    try {
      console.log('Submitting product:', product);
      const response = await ProductService.addProduct(product);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Product added successfully', life: 3000 });
      router.push('/documentation');
      console.log('Product submitted:', response);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to submit product', life: 3000 });
    }
  };
  
  // Load initial data
  onMounted(async () => {
    try {
      const [categoriesList, supplierList, productAttributeList, productTagList] = await Promise.all([
        CategoryService.getAllCategories(0, 100),
        SupplierService.getAllSupplier(0, 100),
        ProductAttributeService.getAllProductAttribute(0, 100),
        ProductTagService.getAllTags(0, 100)
      ]);
  
      categories.value = categoriesList.content;
      suppliers.value = supplierList.content;
      productAttributes.value = productAttributeList.content;
      productTag.value = productTagList.content;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load form data', life: 3000 });
    }
  });
  </script>
  

  
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

.variant-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
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
</style>
