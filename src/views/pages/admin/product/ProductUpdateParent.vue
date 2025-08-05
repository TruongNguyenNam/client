<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Cập nhật sản phẩm</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="productName">Tên sản phẩm</label>
            <InputText 
              id="productName" 
              v-model="product.name" 
              placeholder="nhập tên sản phẩm" 
              :class="{'p-invalid': submitted && !product.name}" 
            />
            <small class="p-error" v-if="submitted && !product.name">Tên sản phẩm là bắt buộc.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="sku">Mã sản phẩm</label>
            <InputText 
              id="sku" 
              v-model="product.sku" 
              placeholder="nhập mã sản phẩm" 
              :class="{'p-invalid': submitted && !product.sku}" 
              disabled
            />
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
            <InputText 
              id="sportType" 
              v-model="product.sportType" 
              placeholder="nhập loại sản phẩm" 
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="productTag">Thẻ</label>
            <MultiSelect
              id="productTag"
              v-model="product.tagId"
              :options="productTags"
              optionLabel="name"
              optionValue="id"
              placeholder="chọn thẻ"
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
              placeholder="nhập mô tả sản phẩm"
              :class="{'p-invalid': submitted && !product.description}"
            />
            <small class="p-error" v-if="submitted && !product.description">Mô tả là bắt buộc.</small>
          </div>
          <div class="field col-12">
            <label for="parentImages">Hình ảnh sản phẩm</label>
            <div v-if="existingImages.length > 0" class="image-preview">
              <div v-for="(img, index) in existingImages" :key="index" class="image-container">
                <img 
                  :src="img.url" 
                  alt="Child Product Image" 
                  style="max-width: 100px; margin: 5px;" 
                  @error="handleImageError(index)"
                />
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  class="delete-image-btn"
                  @click="deleteImages(index)"
                />
              </div>
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
            <small class="p-error" v-if="submitted && !existingImages.length && !parentImages.length">Ít nhất một hình ảnh sản phẩm là bắt buộc.</small>
          </div>
        </div>

        <!-- Bảng sản phẩm con -->
        <div class="variants mt-4">
          <div class="flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Sản phẩm chi tiết</h5>
            <RouterLink :to="`/addvariantsdetails/${route.params.id}`">
              <Button label="Thêm sản phẩm chi tiết" icon="pi pi-plus" class="short-add-btn" />
            </RouterLink>
          </div>
          <DataTable 
            :value="childProducts" 
            :paginator="true" 
            :rows="5" 
            :rowsPerPageOptions="[5, 10, 20]"
            responsiveLayout="scroll"
          >
            <Column field="sku" header="Mã sản phẩm" sortable></Column>
            <Column field="name" header="Tên sản phẩm" sortable></Column>
            <Column field="sportType" header="Loại thể thao" sortable></Column>
            <Column header="Hình ảnh">
              <template #body="slotProps">
                <div class="image-preview">
                  <span v-if="!slotProps.data.images || slotProps.data.images.length === 0">Không có hình ảnh</span>
                  <img 
                    v-else
                    v-for="(img, index) in slotProps.data.images" 
                    :key="index" 
                    :src="img" 
                    alt="Child Image" 
                    style="max-width: 50px; margin: 2px;"
                    @error="console.log('Lỗi tải hình ảnh:', img)"
                    @load="console.log('Hình ảnh tải:', img)"
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
                  <Button icon="pi pi-trash" 
                          class="p-button-rounded p-button-danger"
                          @click="confirmDelete(data.id)" 
                          v-tooltip.top="'Xóa'" />
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
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Xác nhận xóa" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
        <span>Bạn có chắc chắn muốn xóa sản phẩm này không?</span>
      </div>
      <template #footer>
        <Button label="Không" icon="pi pi-times" @click="deleteDialog = false" text />
        <Button label="Có" icon="pi pi-check" @click="handleDelete" text :loading="isDeleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { CategoryService } from '../../../../service/admin/CategoryService';
import { SupplierService } from '../../../../service/admin/SupplierService';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import { ProductTagService } from '../../../../service/admin/ProductTagService';
import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
import type { CategoryResponse } from '../../../../model/admin/category';
import type { SupplierResponse } from '../../../../model/admin/supplier';
import type { ProductTagResponse } from '../../../../model/admin/ProductTag';
import type { ProductUpdateParent, ProductResponse } from '../../../../model/admin/product';
import type { ProductAttributeResponse } from '../../../../model/admin/productAttribute';
import { ProductImageService } from '../../../../service/admin/ProductImageService';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

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
const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);
const isDeleting = ref(false);

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

const confirmDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (deleteId.value === null) return;

  isDeleting.value = true;
  try {
    const message = await ProductService.deleteProduct(deleteId.value);
    await loadProductData(); // Làm mới dữ liệu sau khi xóa
    toast.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
    deleteDialog.value = false;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error|| 'Lỗi khi xóa sản phẩm', life: 3000 });
  } finally {
    isDeleting.value = false;
    deleteId.value = null;
  }
};

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
      childProducts.value = childProductsData.map(child => ({
        ...child,
        images: child.imageUrl || []
      })) || [];
    } catch (error) {
      console.error('Error loading product:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Lỗi tải dữ liệu sản phẩm', 
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
    summary: 'Lỗi', 
    detail: event.message || 'Lỗi tải hình ảnh.', 
    life: 3000 
  });
};

const handleImageError = (index: number) => {
  console.log('Lỗi tải hình ảnh:', existingImages.value[index].url);
};

const deleteImages = async (index: number) => {
  try {
    const productId = Number(route.params.id);
    await ProductImageService.deleteProductImagesByProductId(productId);
    existingImages.value = [];
    toast.add({ 
      severity: 'success', 
      summary: 'Thành công', 
      detail: 'Đã xóa tất cả ảnh của sản phẩm.', 
      life: 3000 
    });
  } catch (error: any) {
    console.error('Error deleting images:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: error.message || 'Lỗi khi xóa ảnh.', 
      life: 3000 
    });
  }
};

// Submit form cập nhật sản phẩm cha
const submitProduct = async () => {
  submitted.value = true;
  
  if (!product.name || !product.sku || !product.supplierId || !product.categoryId || !product.description) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Lỗi', 
      detail: 'Vui lòng điền đầy đủ các trường bắt buộc.',      
      life: 3000 
    });
    return;
  }

  if (existingImages.value.length === 0 && parentImages.value.length === 0) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Lỗi', 
      detail: 'Vui lòng chọn ít nhất một hình ảnh sản phẩm.', 
      life: 3000 
    });
    return;
  }

  isSubmitting.value = true;
  
  try {
    const productId = Number(route.params.id);
    const formData = new FormData();

    const productData = {
      name: product.name,
      description: product.description,
      sportType: product.sportType,
      sku: product.sku,
      supplierId: product.supplierId,
      categoryId: product.categoryId,
      tagId: Array.isArray(product.tagId) ? product.tagId : [product.tagId].filter(Boolean)
    };

    formData.append('product', JSON.stringify(productData));

    if (parentImages.value.length > 0) {
      parentImages.value.forEach((file) => {
        formData.append('parentImages', file);
      });
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? value.name : value);
    }

    await ProductService.updateParentProduct(productId, formData);
    
    toast.add({ 
      severity: 'success', 
      summary: 'Thành công', 
      detail: 'Cập nhật sản phẩm thành công.', 
      life: 3000 
    });
    
    router.push('/documentation');
  } catch (error: any) {
    console.error('Error submitting product:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: error.message || 'Lỗi cập nhật sản phẩm.', 
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
      summary: 'Lỗi', 
      detail: error.message || 'Lỗi tải dữ liệu. Vui lòng thử lại sau.', 
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
.short-add-btn {
  width: 195px;
  border-radius: 10px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.image-container {
  position: relative;
  display: inline-block;
  margin: 5px;
}

.delete-image-btn {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
}
</style>