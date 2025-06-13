<template>
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h5>Thêm Sản Phẩm Cùng Loại</h5>
  
          <!-- Thông tin sản phẩm cha -->
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
          <div class="variant-details mt-4 surface-card p-4 border-round">
            <h6>Thông tin sản phẩm con</h6>
            <div class="p-fluid formgrid grid">
              <div class="field col-12">
                <label for="variant-images">Hình ảnh sản phẩm con *</label>
                <FileUpload
                  name="variant-images"
                  :multiple="true"
                  accept="image/*"
                  :auto="false"
                  chooseLabel="Chọn ảnh"
                  @select="onVariantImageUpload"
                  :maxFileSize="1000000"
                  @error="onError"
                  :class="{ 'p-invalid': submitted && variant.images.length === 0 }"
                >
                  <template #empty>
                    <div class="flex align-items-center justify-content-center flex-column">
                      <i class="pi pi-cloud-upload border-2 border-circle p-3 text-2xl border-primary-500 text-primary-500 mb-2" />
                      <p class="m-0">Kéo thả ảnh vào đây hoặc click để chọn</p>
                    </div>
                  </template>
                </FileUpload>
                <small class="p-error" v-if="submitted && variant.images.length === 0">Ít nhất một hình ảnh là bắt buộc.</small>
                
                <!-- Hiển thị preview ảnh đã chọn -->
                <div v-if="variant.images.length > 0" class="image-preview mt-3 flex flex-wrap gap-2">
                  <div v-for="(image, idx) in variant.images" :key="idx" class="relative">
                    <img :src="getImageUrl(image)" class="border-2 border-round" style="width: 100px; height: 100px; object-fit: cover" />
                    <Button 
                      icon="pi pi-times" 
                      severity="danger" 
                      rounded 
                      text 
                      class="absolute" 
                      style="right: 0; top: 0; transform: translate(50%, -50%)"
                      @click="removeImage(idx)"
                    />
                  </div>
                </div>
              </div>
  
              <div class="field col-12 md:col-6">
                <label for="variant-price">Giá (VND) *</label>
                <InputNumber
                  id="variant-price"
                  v-model="variant.price"
                  mode="currency"
                  currency="VND"
                  locale="vi-VN"
                  :minFractionDigits="0"
                  :class="{ 'p-invalid': submitted && !variant.price }"
                  class="w-full"
                />
                <small class="p-error" v-if="submitted && !variant.price">Giá là bắt buộc.</small>
              </div>
  
              <div class="field col-12 md:col-6">
                <label for="variant-stock">Số lượng tồn kho *</label>
                <InputNumber
                  id="variant-stock"
                  v-model="variant.stockQuantity"
                  :min="0"
                  :class="{ 'p-invalid': submitted && variant.stockQuantity === null }"
                  class="w-full"
                />
                <small class="p-error" v-if="submitted && variant.stockQuantity === null">Số lượng là bắt buộc.</small>
              </div>
  
              <div class="field col-12">
                <label for="variant-sku">SKU tự động</label>
                <InputText 
                  id="variant-sku"
                  v-model="variant.sku" 
                  disabled 
                  class="w-full"
                />
              </div>
            </div>
          </div>
  
          <!-- Thuộc tính sản phẩm con -->
          <div class="attributes mt-4 surface-card p-4 border-round">
            <div class="flex align-items-center justify-content-between mb-3">
              <h6 class="m-0">Thuộc tính sản phẩm con</h6>
              <Button
                label="Thêm thuộc tính"
                icon="pi pi-plus"
                severity="secondary"
                outlined
                size="small"
                @click="addAttribute"
                :disabled="attributes.length >= productAttributes.length || isSubmitting"
              />
            </div>
  
            <div v-if="attributes.length === 0" class="text-center py-4 border-2 border-dashed border-round">
              <p class="text-color-secondary">Chưa có thuộc tính nào được thêm</p>
            </div>
  
            <div v-for="(attribute, index) in attributes" :key="index" class="attribute-row mb-3 p-3 border-round surface-ground">
              <div class="grid">
                <div class="field col-12 md:col-5">
                  <label>Tên thuộc tính *</label>
                  <Dropdown
                    v-model="attribute.attributeId"
                    :options="getAvailableAttributes(index)"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Chọn thuộc tính"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !attribute.attributeId }"
                    @change="updateSelections"
                  >
                    <template #option="slotProps">
                      <div :class="{ 'text-color-secondary': isAttributeDisabled(slotProps.option.id, index) }">
                        {{ slotProps.option.name }}
                        <span v-if="isAttributeDisabled(slotProps.option.id, index)" class="text-xs ml-2">(đã chọn)</span>
                      </div>
                    </template>
                  </Dropdown>
                  <small class="p-error" v-if="submitted && !attribute.attributeId">Vui lòng chọn thuộc tính</small>
                </div>
  
                <div class="field col-12 md:col-5">
                  <label>Giá trị *</label>
                  <InputText
                    v-model="attribute.value"
                    placeholder="Nhập giá trị"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !attribute.value }"
                  />
                  <small class="p-error" v-if="submitted && !attribute.value">Vui lòng nhập giá trị</small>
                </div>
  
                <div class="field col-12 md:col-2 flex align-items-end justify-content-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    rounded
                    @click="removeAttribute(index)"
                    v-if="attributes.length > 1"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>
            </div>
  
            <small class="block mt-2 text-color-secondary" v-if="attributes.length >= productAttributes.length">
              Đã đạt tối đa số thuộc tính có thể thêm
            </small>
          </div>
  
          <div class="flex justify-content-end mt-4 gap-2">
            <Button
              label="Hủy bỏ"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="router.push(`/productupdateparent/${parentProductId}`)"
              :disabled="isSubmitting"
            />
            <Button
              label="Lưu sản phẩm"
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
  import { ref, reactive, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useRouter, useRoute } from 'vue-router';
  import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
  import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
  import type { ProductAttributeResponse } from '../../../../model/productAttribute';
  import type { ProductResponse, AddProductChild } from '../../../../model/product';
  
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  
  // State
  const isSubmitting = ref(false);
  const submitted = ref(false);
  const productAttributes = ref<ProductAttributeResponse[]>([]);
  const parentProductId = Number(route.params.id);
  const parentProduct = ref<ProductResponse>({
    id: 0,
  name: '',
  description: '',
  price: null,
  stockQuantity: null,
  sportType: '',
  originalPrice: null,
  sku: '',
  supplierName: '',
  categoryName: '',
  productAttributeValueResponses: [],
  tagName: [],
  imageUrl: [],
  inventories: []
  });
  
  const variant = reactive({
    name: '',
    sku: '',
    price: undefined as number | undefined,
    stockQuantity: undefined as number | undefined,
    images: [] as File[]
  });
  
  const attributes = ref<Array<{
    attributeId: number | null;
    value: string;
  }>>([{ attributeId: null, value: '' }]);
  
  // Methods
  const loadParentProduct = async () => {
    try {
      const productData = await ProductService.getProductById(parentProductId);
      parentProduct.value = productData;
      updateVariantNameAndSku();
    } catch (error: any) {
      showError('Lỗi tải thông tin sản phẩm cha', error);
    }
  };
  
  const loadProductAttributes = async () => {
    try {
      const response = await ProductAttributeService.getAllProductAttribute();
      productAttributes.value = response.data || [];
    } catch (error: any) {
      showError('Lỗi tải danh sách thuộc tính', error);
    }
  };
  
  const isAttributeDisabled = (attributeId: number, currentIndex: number) => {
    return attributes.value.some((attr, index) => 
      index !== currentIndex && attr.attributeId === attributeId
    );
  };
  
  const getAvailableAttributes = (currentIndex: number) => {
    return productAttributes.value.map(attr => ({
      ...attr,
      disabled: isAttributeDisabled(attr.id, currentIndex)
    }));
  };
  
  const updateSelections = () => {
    updateVariantNameAndSku();
  };
  
  const addAttribute = () => {
    if (attributes.value.length < productAttributes.value.length) {
      attributes.value.push({ attributeId: null, value: '' });
    }
  };
  
  const removeAttribute = (index: number) => {
    if (attributes.value.length > 1) {
      attributes.value.splice(index, 1);
      updateVariantNameAndSku();
    }
  };
  
  const updateVariantNameAndSku = () => {
    const validAttributes = attributes.value.filter(a => a.attributeId && a.value.trim());
    
    // Cập nhật tên sản phẩm con
    if (validAttributes.length > 0) {
      const attributeValues = validAttributes.map(a => {
        const attrName = productAttributes.value.find(attr => attr.id === a.attributeId)?.name || '';
        return `${attrName}: ${a.value.trim()}`;
      });
      variant.name = `${parentProduct.value.name} (${attributeValues.join(', ')})`;
    } else {
      variant.name = parentProduct.value.name;
    }
  
    // Cập nhật SKU tự động
    if (validAttributes.length > 0) {
      const skuParts = validAttributes.map(a => a.value.trim().replace(/\s+/g, '-').toLowerCase());
      variant.sku = `${parentProduct.value.sku}-${skuParts.join('-')}`;
    } else {
      variant.sku = parentProduct.value.sku;
    }
  };
  
  const onVariantImageUpload = (event: any) => {
    variant.images = event.files;
  };
  
  const removeImage = (index: number) => {
    variant.images.splice(index, 1);
  };
  
  const getImageUrl = (file: File) => {
    return URL.createObjectURL(file);
  };
  
  const onError = (error: any) => {
    showError('Lỗi tải lên ảnh', error);
  };
  
  const showError = (summary: string, error: any) => {
    toast.add({
      severity: 'error',
      summary,
      detail: error.message || 'Đã xảy ra lỗi',
      life: 5000
    });
  };
  
  const validateForm = () => {
    submitted.value = true;
    
    // Validate hình ảnh
    if (variant.images.length === 0) {
      showError('Lỗi', 'Vui lòng tải lên ít nhất một hình ảnh');
      return false;
    }
  
    // Validate giá và số lượng
    if (!variant.price || variant.price <= 0) {
      showError('Lỗi', 'Vui lòng nhập giá hợp lệ (lớn hơn 0)');
      return false;
    }
  
    if (variant.stockQuantity === undefined || variant.stockQuantity < 0) {
      showError('Lỗi', 'Vui lòng nhập số lượng tồn kho hợp lệ (lớn hơn hoặc bằng 0)');
      return false;
    }
  
    // Validate thuộc tính
    if (attributes.value.length === 0) {
      showError('Lỗi', 'Vui lòng thêm ít nhất một thuộc tính');
      return false;
    }
  
    for (const attr of attributes.value) {
      if (!attr.attributeId) {
        showError('Lỗi', 'Vui lòng chọn đầy đủ thuộc tính');
        return false;
      }
      if (!attr.value.trim()) {
        showError('Lỗi', 'Vui lòng nhập đầy đủ giá trị thuộc tính');
        return false;
      }
    }
  
    return true;
  };
  
  const submitVariant = async () => {
    if (!validateForm()) return;
  
    isSubmitting.value = true;
    
    try {
      const variantForm: AddProductChild = {
        parentProductId,
        productAttributeValues: attributes.value
          .filter(a => a.attributeId && a.value.trim())
          .map(a => ({
            attributeId: a.attributeId!,
            value: a.value.trim()
          })),
        variants: [{
          price: variant.price!,
          stockQuantity: variant.stockQuantity!,
          images: variant.images
        }]
      };
  
      await ProductService.addVariantsToProduct(parentProductId, variantForm, variant.images);
      
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thêm sản phẩm con thành công',
        life: 3000
      });
      
      router.push(`/productupdateparent/${parentProductId}`);
    } catch (error: any) {
      showError('Lỗi khi thêm sản phẩm con', error);
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Lifecycle hooks
  onMounted(async () => {
    await Promise.all([loadParentProduct(), loadProductAttributes()]);
  });
  </script>
  
  <style scoped>
  .card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .attribute-row {
    transition: all 0.2s ease;
    border: 1px solid var(--surface-border);
  }
  
  .attribute-row:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .image-preview img {
    transition: all 0.2s ease;
  }
  
  .image-preview img:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  :deep(.p-fileupload) {
    width: 100%;
  }
  
  :deep(.p-fileupload-content) {
    border: 2px dashed var(--surface-border);
    border-radius: 6px;
    padding: 1rem;
  }
  
  :deep(.p-fileupload-content:hover) {
    border-color: var(--primary-color);
  }
  
  :deep(.p-dropdown .p-dropdown-label) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  :deep(.p-button.p-button-secondary:not(:disabled):hover) {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
  </style>