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

          <!-- Upload ảnh -->
          <div class="field col-12">
            <label for="productImage">Product Images</label>
            <FileUpload
              ref="fileUploadRef"
              name="productImage"
              :url="null"
              :multiple="true"
              accept="image/*"
              :auto="false"
              chooseLabel="Choose Images"
              @select="onImageUpload"
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
              <InputText
                v-model="variant.value"
                placeholder="Enter value"
                class="variant-input"
              />
            </div>
            <Button icon="pi pi-trash" severity="danger" @click="removeVariant(index)" />
          </div>
          <Button label="Add Attribute" icon="pi pi-plus" @click="addVariant" class="mt-2" />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-content-end mt-4">
          <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" />
          <Button label="Submit Product" icon="pi pi-check" @click="submitProduct" />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { CategoryService } from '../../../../service/CategoryService';
import { SupplierService } from '../../../../service/SupplierService';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductImageService } from '../../../../service/ProductImageService';
import { ProductTagService } from '../../../../service/ProductTagService';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/category';
import type { SupplierResponse } from '../../../../model/supplier';
import type { ProductTagResponse } from '../../../../model/ProductTag';
// Interfaces
interface ProductAttributeValue {
    attributeId: number;
    productId?: number;
    value: string;
}

interface ProductAttribute {
    id: number;
    name: string;
    description: string | null;
}

interface ProductRequest {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    sportType: string;
    sku: string;
    supplierId: number;
    categoryId: number;
    tagId: number[];
    productAttributeValues: ProductAttributeValue[];
    productImageIds: number[];
    inventoryIds: number[];
}

const toast = useToast();
const submitted = ref(false);

// Form data
const product = reactive<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    sportType: '',
    sku: '',
    supplierId: 0,
    categoryId: 0,
    tagId: [],
    productAttributeValues: [],
    productImageIds: [],
    inventoryIds: []
});

// Refs
const variants = ref<ProductAttributeValue[]>([]);
const fileUploadRef = ref();
const categories = ref<CategoryResponse[]>([]);
const suppliers = ref<SupplierResponse[]>([]);
const productAttributes = ref<ProductAttribute[]>([]);
const productTag = ref<ProductTagResponse[]>([]);
const uploadedImageIds = ref<number[]>([]);

// Methods
const addVariant = () => {
    variants.value.push({
        attributeId: 0,
        value: ''
    });
};

const removeVariant = (index: number) => {
    variants.value.splice(index, 1);
};

const onImageUpload = async (event: any) => {
    const selectedFiles = event.files;
    try {
        const imageIds = await ProductImageService.uploadProductImages(selectedFiles);
        uploadedImageIds.value = [...uploadedImageIds.value, ...imageIds];
        toast.add({ severity: 'success', summary: 'Success', detail: 'Images uploaded successfully', life: 3000 });
    } catch (error) {
        console.error('Error uploading images:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload images', life: 3000 });
    }
};

const onError = (error: any) => {
    toast.add({ severity: 'error', summary: 'Upload Error', detail: error.message, life: 3000 });
};

const submitProduct = async () => {
    submitted.value = true;

    // Validate fields
    if (!product.name || !product.sku || !product.categoryId || !product.supplierId || !product.description || !product.price || !product.stockQuantity) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields.', life: 3000 });
        return;
    }

    // Prepare product attributes
    product.productAttributeValues = variants.value
        .filter(variant => variant.attributeId !== 0)
        .map(variant => ({
            attributeId: variant.attributeId,
            value: variant.value
        }));

    // Add uploaded image ids
    product.productImageIds = uploadedImageIds.value;

    try {
        console.log('Submitting product:', product);
        const response = await ProductService.addProduct(product);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Product added successfully', life: 3000 });
        console.log('Product submitted:', response);
    } catch (error) {
        console.error('Submit error:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit product', life: 3000 });
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

        console.log('Product Attributes loaded:', productAttributes.value);
    } catch (error) {
        console.error('Error fetching data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load form data', life: 3000 });
    }
});
</script>

<style scoped>
.variants {
    margin-top: 2rem;
}

.variant-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.variant-select {
    flex: 2;
}

.variant-values {
    flex: 3;
}

.variant-input {
    width: 100%;
}

:deep(.p-fileupload-content) {
    padding: 2rem;
}

:deep(.p-fileupload-row) {
    margin: 0.5rem 0;
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
</style>
