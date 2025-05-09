<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Update Child Product</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName">Product Name</label>
            <InputText 
              id="productName" 
              v-model="product.name" 
              placeholder="Enter product name" 
              :class="{'p-invalid': submitted && !product.name}" 
              disabled
            />
            <small class="p-error" v-if="submitted && !product.name">Product name is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sku">SKU</label>
            <InputText 
              id="sku" 
              v-model="product.sku" 
              placeholder="Enter SKU" 
              :class="{'p-invalid': submitted && !product.sku}" 
              disabled
            />
            <small class="p-error" v-if="submitted && !product.sku">SKU is required.</small>
          </div>
          <!-- CategoryName -->
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
              disabled
            />
            <small class="p-error" v-if="submitted && !product.categoryId">Category is required.</small>
          </div>

          <div class="field col-12 md:col-6">
            <label for="sportType">Sport Type</label>
            <InputText 
              id="sportType" 
              v-model="product.sportType" 
              placeholder="Enter sport type" 
              disabled
            />
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
              disabled
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
              disabled
            />
            <small class="p-error" v-if="submitted && !product.supplierId">Supplier is required.</small>
          </div>

          <!-- Description -->
          <div class="field col-12">
            <label for="description">Description</label>
            <Textarea 
              id="description" 
              v-model="product.description" 
              rows="4" 
              placeholder="Enter product description"
              :class="{'p-invalid': submitted && !product.description}"
            />
            <small class="p-error" v-if="submitted && !product.description">Description is required.</small>
          </div>

          <!-- Price -->
          <div class="field col-12 md:col-6">
            <label for="price">Price</label>
            <InputNumber 
              id="price" 
              v-model="product.price" 
              mode="currency" 
              currency="VND" 
              locale="vi-VN"
              :min="0"
              :class="{'p-invalid': submitted && product.price === null}"
            />
            <small class="p-error" v-if="submitted && product.price === null">Price is required.</small>
          </div>

          <!-- Stock Quantity -->
          <div class="field col-12 md:col-6">
            <label for="stockQuantity">Stock Quantity</label>
            <InputNumber 
              id="stockQuantity" 
              v-model="product.stockQuantity" 
              :min="0"
              :class="{'p-invalid': submitted && product.stockQuantity === null}"
            />
            <small class="p-error" v-if="submitted && product.stockQuantity === null">Stock quantity is required.</small>
          </div>

          <!-- Images -->
          <div class="field col-12">
            <label for="images">Images</label>
            <div v-if="existingImages.length > 0" class="image-preview">
              <img 
                v-for="(img, index) in existingImages" 
                :key="index" 
                :src="img.url" 
                alt="Child Product Image" 
                style="max-width: 100px; margin: 5px;" 
                @error="handleImageError(index)"
              />
            </div>
            <FileUpload
              name="images"
              :multiple="true"
              accept="image/*"
              :auto="false"
              chooseLabel="Choose Images"
              @select="onImageUpload"
              :maxFileSize="1000000"
              @error="onError"
              :class="{'p-invalid': submitted && !existingImages.length && !newImages.length}"
            />
            <small class="p-error" v-if="submitted && !existingImages.length && !newImages.length">At least one image is required.</small>
          </div>

          <!-- Product Attributes -->
          <div class="field col-12">
            <label for="productAttributes">Product Attributes</label>
            <div v-for="(attr, index) in product.productAttributeValues" :key="index" class="p-fluid formgrid grid">
              <div class="field col-12 md:col-5">
                <Dropdown
                  v-model="attr.attributeId"
                  :options="productAttributes"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Attribute"
                  :class="{'p-invalid': submitted && !attr.attributeId}"
                />
                <small class="p-error" v-if="submitted && !attr.attributeId">Attribute is required.</small>
              </div>
              <div class="field col-12 md:col-5">
                <InputText 
                  v-model="attr.value" 
                  placeholder="Enter attribute value"
                  :class="{'p-invalid': submitted && !attr.value}"
                />
                <small class="p-error" v-if="submitted && !attr.value">Value is required.</small>
              </div>
              <div class="field col-12 md:col-2">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  @click="removeAttribute(index)" 
                />
              </div>
            </div>
            <Button 
              label="Add Attribute" 
              icon="pi pi-plus" 
              severity="secondary" 
              class="add-attribute-btn"
              @click="addAttribute" 
            />
          </div>
        </div>

        <div class="flex justify-content-end mt-4">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            severity="secondary" 
            class="mr-2" 
            @click="router.push('/documentation')" 
          />
          <Button 
            label="Update Child Product" 
            icon="pi pi-check" 
            @click="submitChildProduct" 
            :loading="isSubmitting" 
          />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import { CategoryService } from '../../../../service/CategoryService';
import { SupplierService } from '../../../../service/SupplierService';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductTagService } from '../../../../service/ProductTagService';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/category';
import type { SupplierResponse } from '../../../../model/supplier';
import type { ProductTagResponse } from '../../../../model/ProductTag';
import type { ProductUpdateChild, ProductResponse } from '../../../../model/product';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';

const product = reactive<ProductUpdateChild>({
  name: '',
  description: '',
  sportType: '',
  sku: '',
  price: 0,
  stockQuantity: 0,
  supplierId: 0,
  categoryId: 0,
  tagId: [],
  productAttributeValues: [],
  images: []
});

const route = useRoute();
const router = useRouter();
const categories = ref<CategoryResponse[]>([]);
const suppliers = ref<SupplierResponse[]>([]);
const productAttributes = ref<ProductAttributeResponse[]>([]);
const productTags = ref<ProductTagResponse[]>([]);
const toast = useToast();
const isSubmitting = ref(false);
const submitted = ref(false);
const existingImages = ref<{ id: number; url: string }[]>([]);
const newImages = ref<File[]>([]);

const loadProductData = async () => {
  const productId = Number(route.params.id);
  if (productId) {
    try {
      const productData: ProductResponse = await ProductService.getProductById(productId);
      product.name = productData.name || '';
      product.sportType = productData.sportType || '';
      product.sku = productData.sku || '';
      product.description = productData.description || '';
      product.price = productData.price || 0;
      product.stockQuantity = productData.stockQuantity || 0;

      const supplier = suppliers.value.find(s => s.name === productData.supplierName);
      product.supplierId = supplier ? supplier.id : 0;

      const category = categories.value.find(c => c.name === productData.categoryName);
      product.categoryId = category ? category.id : 0;

      if (productData.tagName && productData.tagName.length > 0) {
        product.tagId = productData.tagName
          .map(name => {
            const tag = productTags.value.find(t => t.name === name);
            return tag ? tag.id : null;
          })
          .filter((id): id is number => id !== null);
      } else {
        product.tagId = [];
      }

      if (productData.productAttributeValueResponses && productData.productAttributeValueResponses.length > 0) {
        product.productAttributeValues = productData.productAttributeValueResponses.map(attr => {
          const matchingAttribute = productAttributes.value.find(pa => pa.name === attr.attributeName);
          console.log('Mapping attribute:', attr.attributeName, 'to ID:', matchingAttribute ? matchingAttribute.id : 'Not found');
          return {
            attributeId: matchingAttribute ? matchingAttribute.id : 0,
            value: attr.value
          };
        });
      } else {
        product.productAttributeValues = [];
      }
      console.log('product.productAttributeValues:', product.productAttributeValues);

      if (productData.imageUrl && productData.imageUrl.length > 0) {
        existingImages.value = productData.imageUrl.map((url, index) => ({
          id: index + 1,
          url: url
        }));
      }

    } catch (error) {
      console.error('Error loading child product:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load child product data', 
        life: 3000 
      });
    }
  }
};

const onImageUpload = (event: any) => {
  newImages.value = event.files;
  product.images = event.files;
};

const onError = (event: any) => {
  toast.add({ 
    severity: 'error', 
    summary: 'Upload Error', 
    detail: event.message || 'Failed to upload images.', 
    life: 3000 
  });
};

const handleImageError = (index: number) => {
  console.log(`Failed to load image at index ${index}: ${existingImages.value[index].url}`);
  existingImages.value.splice(index, 1);
};

const addAttribute = () => {
  product.productAttributeValues.push({ attributeId: 0, value: '' });
};

const removeAttribute = (index: number) => {
  product.productAttributeValues.splice(index, 1);
};

const submitChildProduct = async () => {
  submitted.value = true;

  if (!product.description || product.price === null || product.stockQuantity === null || 
      product.productAttributeValues.some(attr => !attr.attributeId || !attr.value) || 
      (!existingImages.value.length && !newImages.value.length)) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Validation Error', 
      detail: 'Please fill in all required fields.', 
      life: 3000 
    });
    return;
  }

  isSubmitting.value = true;
  try {
    const productId = Number(route.params.id);
    console.log('Submitting child product:', {
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      productAttributeValues: product.productAttributeValues,
      images: newImages.value
    });
    await ProductService.updateChildProduct(productId, product, newImages.value);
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Child product updated successfully.', 
      life: 3000 
    });
    router.push('/documentation');
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.message || 'Failed to update child product.', 
      life: 3000 
    });
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

    console.log('productAttributes:', productAttributes.value);

    await loadProductData();
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

<style scoped>
.image-preview {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.add-attribute-btn {
  margin-top: 10px;
  padding: 8px 16px; 
  font-size: 14px; 
  border-radius: 5px;
  width: 200px;
  height: 40px;
}
</style>