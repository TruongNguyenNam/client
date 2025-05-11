<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Product UPDATE</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName">Product Name</label>
            <InputText 
              id="productName" 
              v-model="product.name" 
              placeholder="Enter product name" 
              :class="{'p-invalid': submitted && !product.name}" 
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
            />
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
            <InputText 
              id="sportType" 
              v-model="product.sportType" 
              placeholder="Enter sport type" 
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
          <div class="field col-12">
            <label for="parentImages">Parent Product Images</label>
            <div v-if="existingImages.length > 0" class="image-preview">
              <img 
                v-for="(img, index) in existingImages" 
                :key="index" 
                :src="img.url" 
                alt="Product Image" 
                style="max-width: 100px; margin: 5px;" 
              />
            </div>
            <FileUpload
              name="parentImages"
              :multiple="true"
              accept="image/*"
              :auto="false"
              chooseLabel="Choose Images"
              @select="onParentImageUpload"
              :maxFileSize="1000000"
              @error="onError"
              :class="{'p-invalid': submitted && !existingImages.length && !parentImages.length}"
            />
            <small class="p-error" v-if="submitted && !existingImages.length && !parentImages.length">At least one parent image is required.</small>
          </div>
        </div>

        <!-- Bảng sản phẩm con -->
        <div class="variants mt-4">
          <h5>Child Products</h5>
          <DataTable 
            :value="childProducts" 
            :paginator="true" 
            :rows="5" 
            :rowsPerPageOptions="[5, 10, 20]"
            responsiveLayout="scroll"
          >
            <!-- <Column field="id" header="ID" sortable></Column> -->
            <Column field="sku" header="SKU" sortable></Column>
            <Column field="name" header="Name" sortable></Column>
            <Column field="sportType" header="Sport Type" sortable></Column>
            <Column header="Images">
              <template #body="slotProps">
                <div class="image-preview">
                  <span v-if="!slotProps.data.images || slotProps.data.images.length === 0">No images</span>
                  <img 
                    v-else
                    v-for="(img, index) in slotProps.data.images" 
                    :key="index" 
                    :src="img" 
                    alt="Child Image" 
                    style="max-width: 50px; margin: 2px;"
                    @error="console.log('Error loading child image:', img)"
                    @load="console.log('Child image loaded:', img)"
                  />
                </div>
              </template>
            </Column>

            <Column header="Thao tác" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <RouterLink :to="`/productupdatechild/${data.id}`">
                  <Button icon="pi pi-pencil" 
                        class="p-button-rounded p-button-success" 
                        v-tooltip.top="'Sửa'" />
                </RouterLink>
                <RouterLink :to="`/productdelete/${data.id}`">
                  <Button icon="pi pi-trash" 
                          class="p-button-rounded p-button-danger"
                          @click="handleDelete(data.id)" 
                          v-tooltip.top="'Xóa'" />
                </RouterLink>
              </div>
            </template>
          </Column>
          </DataTable>
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
            label="Submit Product" 
            icon="pi pi-check" 
            @click="submitProduct" 
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
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { CategoryService } from '../../../../service/CategoryService';
import { SupplierService } from '../../../../service/SupplierService';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import { ProductTagService } from '../../../../service/ProductTagService';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/category';
import type { SupplierResponse } from '../../../../model/supplier';
import type { ProductTagResponse } from '../../../../model/ProductTag';
import type { ProductUpdateParent, ProductResponse } from '../../../../model/product';
import type { ProductAttributeResponse } from '../../../../model/productAttribute';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const categories = ref<CategoryResponse[]>([]);
const suppliers = ref<SupplierResponse[]>([]);
const productAttributes = ref<ProductAttributeResponse[]>([]);
const productTags = ref<ProductTagResponse[]>([]);
const childProducts = ref<ProductResponse[]>([]);
const toast = useToast();
const isSubmitting = ref(false);
const router = useRouter();
const route = useRoute();
const submitted = ref(false);
const parentImages = ref<File[]>([]);
const existingImages = ref<{ id: number; url: string }[]>([]);

const product = reactive<ProductUpdateParent>({
  name: '',
  description: '',
  sportType: '',
  sku: '',
  supplierId: 0,
  categoryId: 0,
  tagId: [],
  parentImages: []
});


const handleDelete = async (id: number) => {
  try {
        const message = await ProductService.deleteProduct(id);

        toast.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail:error, life: 3000 });
      }
    }
  

const loadProductData = async () => {
  const productId = Number(route.params.id);
  if (productId) {
    try {
      const productData: ProductResponse = await ProductService.getProductById(productId);
      
      product.name = productData.name || '';
      product.description = productData.description || '';
      product.sportType = productData.sportType || '';
      product.sku = productData.sku || '';

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

      if (productData.imageUrl && productData.imageUrl.length > 0) {
        existingImages.value = productData.imageUrl.map((url, index) => ({
          id: index + 1, 
          url: url
        }));
      }

      const childProductsData = await ProductService.getProductsByParentId(productId);
      console.log('childProductsData:', childProductsData); 
      childProducts.value = childProductsData.map(child => ({
        ...child,
        images: child.imageUrl || []
      })) || [];
      console.log('childProducts:', childProducts.value);

    } catch (error) {
      console.error('Error loading product:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load product data', 
        life: 3000 
      });
    }
  }
};

// Xử lý upload hình ảnh mới
const onParentImageUpload = (event: any) => {
  parentImages.value = event.files;
  product.parentImages = event.files; 
};

const onError = (event: any) => {
  toast.add({ 
    severity: 'error', 
    summary: 'Upload Error', 
    detail: event.message || 'Failed to upload images.', 
    life: 3000 
  });
};

// Submit form cập nhật sản phẩm cha
const submitProduct = async () => {
  submitted.value = true;
  if (!product.name || !product.sku || !product.supplierId || !product.categoryId || !product.description) {
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
    await ProductService.updateParentProduct(productId, product, parentImages.value);
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Product updated successfully.', 
      life: 3000 
    });
    router.push('/documentation');
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.message || 'Failed to update product.', 
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
</style>