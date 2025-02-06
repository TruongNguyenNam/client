<template>
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h5>Update Product</h5>
          <div class="p-fluid formgrid grid">
            <!-- Product Name -->
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
  
            <!-- Category -->
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
  
            <!-- Description -->
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
  
            <!-- Price -->
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
  
            <!-- Stock Quantity -->
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
  
            <!-- Current Images -->
            <div class="field col-12" v-if="existingImages.length > 0">
              <label>Current Images</label>
              <div class="existing-images-grid">
                <div v-for="image in existingImages" :key="image.id" class="image-container">
                  <img :src="image.url" :alt="product.name" class="product-image" />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-danger image-delete-btn"
                    @click="removeExistingImage(image.id)"
                  />
                </div>
              </div>
            </div>
  
            <!-- Upload New Images -->
            <div class="field col-12">
              <label for="productImage">Add New Images</label>
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
  
          <!-- Product Attributes -->
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
  
          <!-- Submit Buttons -->
          <div class="flex justify-content-end mt-4">
            <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="navigateBack" />
            <Button label="Update Product" icon="pi pi-check" @click="updateProduct" />
          </div>
        </div>
      </div>
      <Toast />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useRoute, useRouter } from 'vue-router';
  import { CategoryService } from '../../../../service/CategoryService';
  import { SupplierService } from '../../../../service/SupplierService';
  import { ProductService } from '../../../../service/ProductServiceLegacy';
  import { ProductImageService } from '../../../../service/ProductImageService';
  import { ProductTagService } from '../../../../service/ProductTagService';
  import { ProductAttributeService } from '../../../../service/ProductAttribueService';
  import type { CategoryResponse } from '../../../../model/category';
  import type { SupplierResponse } from '../../../../model/supplier';
  import type { ProductTagResponse } from '../../../../model/ProductTag';
  // import type { ProductResponse, ProductAttributeValueResponse } from '../../../../model/product';
  
  
 interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number | null; // Changed to match Double
    stockQuantity: number | null; // Changed to match Integer
    sportType: string;
    sku: string;
    supplierName: string;
    categoryName: string;
    sportTypeName: string[]; // Added new property
    productAttributeValueResponses: ProductAttributeValueResponse[]; // Changed type
    tagName: string[]; 
    imageUrl: string[]; // Changed to lowercase 'u'
    inventories: InventoryResponse[]; // Added new property
}
 interface ProductAttributeValueResponse {
    id: number; // Changed to Long
    attributeName: string; // Added new property
    productId: number; // Changed to Long
    value: string;
}

 interface InventoryResponse {
    id: number; // Changed to Long
    productName: string; // Added new property
    stockQuantity: string; // Changed to String
}



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
  
  interface ProductImage {
      id: number;
      url: string;
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
  const route = useRoute();
  const router = useRouter();
  const submitted = ref(false);
  const productId = ref<number>(parseInt(route.params.id as string));
  
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
  const existingImages = ref<ProductImage[]>([]);
  
  // Methods
  const loadProductData = async () => {
      try {
          const productData: ProductResponse = await ProductService.getProductById(productId.value);
          
          // Update form data
          Object.assign(product, {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              stockQuantity: productData.stockQuantity,
              sportType: productData.sportType,
              sku: productData.sku,
              supplierId: suppliers.value.find(s => s.name === productData.supplierName)?.id || 0,
              categoryId: categories.value.find(c => c.name === productData.categoryName)?.id || 0,
              tagId: productData.tagName.map(name => productTag.value.find(t => t.name === name)?.id || 0).filter(id => id !== 0),
          });
  
          // Load existing images
          if (productData.imageUrl) {
              existingImages.value = productData.imageUrl.map((url) => ({
                  id: uploadedImageIds.value[0] || 0, // Temporary fix - should get proper image IDs
                  url
              }));
          }
  
          // Load existing attributes
          if (productData.productAttributeValueResponses) {
              variants.value = productData.productAttributeValueResponses.map((attr: ProductAttributeValueResponse) => ({
                  attributeId: attr.id,
                  value: attr.value
              }));
          }
  
      } catch (error) {
          console.error('Error loading product:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product data', life: 3000 });
      }
  };
  
  const addVariant = () => {
      variants.value.push({
          attributeId: 0,
          value: ''
      });
  };
  
  const removeVariant = (index: number) => {
      variants.value.splice(index, 1);
  };
  
  const removeExistingImage = (imageId: number) => {
      existingImages.value = existingImages.value.filter(img => img.id !== imageId);
      product.productImageIds = existingImages.value.map(img => img.id);
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
  
  const navigateBack = () => {
      router.push('/products');
  };
  
  const updateProduct = async () => {
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
  
      // Combine existing and new image IDs
           product.productImageIds = [
          ...existingImages.value.map(img => img.id),
          ...uploadedImageIds.value
      ];
  
      try {
          await ProductService.updateProduct(productId.value, product);
          toast.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully', life: 3000 });
          router.push('/products');
      } catch (error) {
          console.error('Update error:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product', life: 3000 });
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
  
          // Load product data after loading reference data
          await loadProductData();
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
  
  .existing-images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
  }
  
  .image-container {
      position: relative;
      width: 150px;
      height: 150px;
  }
  
  .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
  }
  
  .image-delete-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 2rem;
      height: 2rem;
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