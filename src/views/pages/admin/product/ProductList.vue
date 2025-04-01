<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import type { ProductResponse } from '../../../../model/product';
import { RouterLink } from 'vue-router';

const listProduct = ref<ProductResponse[]>([]);
const loading = ref(false);
const selectedProducts = ref<ProductResponse[]>([]);
const searchTerm = ref('');

// Phân trang
const first = ref(0);
const rows = ref(10);
const totalRecords = ref(0);

// Lấy danh sách sản phẩm cha
const getAllParentProduct = async () => {
  loading.value = true;
  try {
    const products = await ProductService.getAllParentProducts();
    listProduct.value = products;
    totalRecords.value = products.length;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    listProduct.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(getAllParentProduct);

// Thêm method để xóa tìm kiếm
const clearSearch = () => {
  searchTerm.value = '';
  getAllParentProduct(); // Reset về danh sách ban đầu
};

// Cập nhật method tìm kiếm
const searchProducts = async () => {
  if (!searchTerm.value.trim()) {
    await getAllParentProduct();
    return;
  }
  
  loading.value = true;
  try {
    const products = await ProductService.searchProducts(searchTerm.value);
    listProduct.value = products;
    totalRecords.value = products.length;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    listProduct.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

// const deleteSelectedProducts = async () => {
//   try {
//     const selectedIds = selectedProducts.value.map(product => product.id);
//     await ProductService.deleteProducts(selectedIds);
//     await getAllParentProduct();
//     selectedProducts.value = [];
//   } catch (error) {
//     console.error("Lỗi khi xóa sản phẩm:", error);
//   }
// };

const onPageChange = (event: any) => {
  first.value = event.first;
  rows.value = event.rows;
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Danh sách Sản phẩm</h5>
        
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div class="my-2">
              <RouterLink to="/productadd">
                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" />
              </RouterLink>
              <Button label="Delete" 
                      icon="pi pi-trash" 
                      class="p-button-danger" 
                      :disabled="!selectedProducts.length"
                     />
            </div>
          </template>

          <template v-slot:end>
            <Button label="Import" icon="pi pi-upload" class="p-button-help mr-2" />
            <Button label="Export" icon="pi pi-download" class="p-button-info" />
          </template>
        </Toolbar>

        <!-- Thêm phần tìm kiếm ở đây -->
        <div class="flex justify-content-between align-items-center mb-4">
          <Button 
            icon="pi pi-filter-slash" 
            label="Clear" 
            class="p-button-outlined" 
            @click="clearSearch"
          />
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText 
              v-model="searchTerm" 
              placeholder="Tìm kiếm..." 
              @input="searchProducts"
              class="w-full"
            />
          </span>
        </div>

        <DataTable
          v-model:selection="selectedProducts"
          :value="listProduct"
          :paginator="true"
          :rows="rows"
          :totalRecords="totalRecords"
          :first="first"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5,10,20,50]"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} sản phẩm"
          class="p-datatable-gridlines"
          dataKey="id"
          :rowHover="true"
          :loading="loading"
          responsiveLayout="scroll"
          @page="onPageChange"
        >
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-semibold">Sản phẩm</span>
              <ProgressSpinner v-if="loading" style="width: 30px; height: 30px" />
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

          <Column header="Ảnh" style="width: 100px">
            <template #body="{ data }">
              <img :src="data.imageUrl?.[0] || 'https://via.placeholder.com/50'" 
                   :alt="data.name" 
                   class="product-image"
                   v-if="data.imageUrl?.length > 0" />
            </template>
          </Column>

          <Column field="name" header="Tên sản phẩm" sortable style="min-width: 200px"></Column>
          <Column field="categoryName" header="Danh mục" sortable style="min-width: 150px"></Column>
          <Column field="supplierName" header="Nhà cung cấp" sortable style="min-width: 150px"></Column>
          <Column field="sportType" header="Loại thể thao" sortable style="min-width: 150px"></Column>

          <Column header="Thao tác" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <RouterLink :to="`/productupdateparent/${data.id}`">
                  <Button icon="pi pi-pencil" 
                        class="p-button-rounded p-button-success" 
                        v-tooltip.top="'Sửa'" />
                </RouterLink>
                <!-- <Button icon="pi pi-trash" 
                      class="p-button-rounded p-button-danger"
                      @click="deleteSelectedProducts" 
                      v-tooltip.top="'Xóa'" /> -->
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

::v-deep(.p-datatable) {
  .p-paginator-bottom {
    border: none;
    background: transparent;
  }
}

:deep(.p-button.p-button-text) {
  padding: 0.5rem;
  
  &:focus {
    box-shadow: none;
  }
}

.p-input-icon-left {
  width: 300px; // Điều chỉnh độ rộng của ô tìm kiếm
}
</style>