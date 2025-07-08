<template>
    <div>
      <DataTable
        :value="products"
        :dataKey="'id'"
        class="p-datatable-gridlines p-datatable-sm"
        responsiveLayout="scroll"
        selectionMode="single"
        @row-select="onRowSelect"
      >
        <Column header="Hình ảnh" style="width: 100px;">
          <template #body="{ data }">
            <img
              :src="data.imageUrl?.[0] || 'placeholder-image-url'"
              :alt="data.name"
              class="rounded"
              style="width: 60px; height: 60px; object-fit: cover;"
            />
          </template>
        </Column>
        <Column field="name" header="Tên sản phẩm" sortable>
          <template #body="{ data }">
            <span class="font-semibold">{{ data.name }}</span>
          </template>
        </Column>
        <!-- <Column field="categoryName" header="Danh mục" sortable>
          <template #body="{ data }">
            <span class="text-gray-500">{{ data.categoryName }}</span>
          </template>
        </Column> -->
        <Column field="stockQuantity" header="Số lượng tồn" sortable>
          <template #body="{ data }">
            <span>{{ data.stockQuantity }} sản phẩm</span>
          </template>
        </Column>
        <Column field="price" header="Giá" sortable>
          <template #body="{ data }">
            <span class="text-blue-600 font-semibold">{{ data.price.toLocaleString('vi-VN') }} đ</span>
          </template>
        </Column>
        <Column header="Hành động">
          <template #body="{ data }">
            <Button
              icon="pi pi-plus"
              label="Chọn"
              class="p-button-primary p-button-sm"
              @click="selectProduct(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { ProductResponse } from '../../../../model/admin/product';
  import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
  
  const emit = defineEmits<{
    (e: 'select', product: ProductResponse): void;
  }>();
  
  const products = ref<ProductResponse[]>([]);
  
  const getProducts = async () => {
    const response = await ProductService.getAllChildProducts();
    if (response.data) {
      products.value = response.data;
    }
  };
  
  const selectProduct = (product: ProductResponse) => {
    emit('select', product);
  };
  
  const onRowSelect = (event: { data: ProductResponse }) => {
    selectProduct(event.data);
  };
  
  onMounted(async () => {
    await getProducts();
  });
  </script>
  
  <style scoped>
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    font-weight: 600;
    padding: 1rem;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr) {
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #e9ecef;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem;
  }
  
  :deep(.p-button-sm) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  img {
    border: 1px solid #e5e7eb;
  }
  </style>