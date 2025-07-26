<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '../../../../service/admin/ProductServiceLegacy';
import type { ProductResponse, VariantCountDTO } from '../../../../model/admin/product';
import { RouterLink } from 'vue-router';
import { exportToExcel, importFromExcel } from '../../../../utils/excel';
import { useToast } from 'primevue/usetoast';
import * as XLSX from 'xlsx';

const toast = useToast();
const exportAllProducts = async () => {
  try {
    const parentProducts = await ProductService.getAllParentProducts();
    const allAttributeNames = new Set<string>();
    const exportData: any[] = [];
    // Gộp tất cả tên thuộc tính động
    for (const parent of parentProducts) {
      const childProducts = await ProductService.getProductsByParentId(parent.id);
      for (const child of childProducts) {
        if (Array.isArray(child.productAttributeValueResponses)) {
          child.productAttributeValueResponses.forEach((attr: any) => {
            if (attr?.attributeName) {
              allAttributeNames.add(attr.attributeName);
            }
          });
        }
      }
    }
    const attributeList = Array.from(allAttributeNames);
    // Duyệt lần nữa để xuất dữ liệu
    for (const parent of parentProducts) {
      const childProducts = await ProductService.getProductsByParentId(parent.id);
      if (childProducts.length > 0) {
        for (const child of childProducts) {
          const row: Record<string, any> = {
            "Mã SP cha": parent.sku || "",
            "Tên SP cha": parent.name || "",
            "Mã SP con": child.sku || "",
            "Tên SP con": child.name || "",
            "Mô tả SP con": child.description || "",
            "Loại thể thao": parent.sportType || "",
            "Danh mục": parent.categoryName || "",
            "Nhà cung cấp": parent.supplierName || "",
            "Số lượng": child.stockQuantity || 0,
            "Giá": child.price || 0,
            "Nhãn": Array.isArray(child.tagName)
              ? child.tagName.join(", ")
              : typeof child.tagName === "string"
                ? child.tagName
                : "",
          };
          const attributeMap: Record<string, string> = {};
          if (Array.isArray(child.productAttributeValueResponses)) {
            child.productAttributeValueResponses.forEach((attr: any) => {
              if (attr?.attributeName && attr?.value) {
                attributeMap[attr.attributeName] = attr.value;
              }
            });
          }
          attributeList.forEach(attrName => {
            row[attrName] = attributeMap[attrName] || "";
          });
          exportData.push(row);
        }
      } else {
        exportData.push({
          "Mã SP cha": parent.sku || "",
          "Tên SP cha": parent.name || "",
          "Tên SP con": "(Không có biến thể)",
          "Mô tả SP con": "",
          "Loại thể thao": parent.sportType || "",
          "Danh mục": parent.categoryName || "",
          "Nhà cung cấp": parent.supplierName || "",
          "Số lượng": parent.stockQuantity || 0,
          "Giá": "",
          "Nhãn": Array.isArray(parent.tagName)
            ? parent.tagName.join(", ")
            : typeof parent.tagName === "string"
              ? parent.tagName
              : "",
        });
      }
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách sản phẩm");
    XLSX.writeFile(workbook, "SanPham_Full.xlsx");
  } catch (error) {
    console.error("Xuất Excel thất bại:", error);
  }
};

const listProduct = ref<ProductResponse[]>([]);
const loading = ref(false);
const selectedProducts = ref<ProductResponse[]>([]);
const searchTerm = ref('');

// Phân trang
const first = ref(0);
const rows = ref(10);
const totalRecords = ref(0);

// Lấy danh sách sản phẩm cha và số lượng biến thể
const getAllParentProduct = async () => {
  loading.value = true;
  try {
    const [products, variantCounts] = await Promise.all([
      ProductService.getAllParentProducts(),
      ProductService.getVariantCounts(),
    ]);

    // Gán variantCount cho từng sản phẩm cha
    listProduct.value = products.map((product: ProductResponse) => {
      const variant = variantCounts.find((v: VariantCountDTO) => v.parentProductId === product.id);
      return {
        ...product,
        variantCount: variant ? variant.variantCount : 0,
      };
    });
    totalRecords.value = listProduct.value.length;
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

// Tìm kiếm nâng cao với một ô input
const searchProducts = async () => {
  if (!searchTerm.value.trim()) {
    await getAllParentProduct();
    return;
  }

  loading.value = true;
  try {
    const products = await ProductService.searchProducts(searchTerm.value);
    const variantCounts = await ProductService.getVariantCounts();

    listProduct.value = products.map((product: ProductResponse) => {
      const variant = variantCounts.find((v: VariantCountDTO) => v.parentProductId === product.id);
      return {
        ...product,
        variantCount: variant ? variant.variantCount : 0,
      };
    });
    totalRecords.value = listProduct.value.length;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm nâng cao:", error);
    listProduct.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

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
              <Button label="Delete" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedProducts.length" />
            </div>
          </template>

          <template v-slot:end>
            <Button label="Import" icon="pi pi-upload" class="p-button-help mr-2" />
            <Button label="Xuất Excel" icon="pi pi-file-excel" class="p-button-success" @click="exportAllProducts" />

          </template>
        </Toolbar>

        <!-- Thay thế phần tìm kiếm bằng ô input nâng cao -->
        <div class="flex justify-content-between align-items-center mb-4">
          <Button icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="clearSearch" />
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="searchTerm"
              placeholder="Tìm kiếm nâng cao (tên, danh mục, nhà cung cấp, loại thể thao)..." @input="searchProducts"
              class="w-full" />
          </span>
        </div>

        <DataTable v-model:selection="selectedProducts" :value="listProduct" :paginator="true" :rows="rows"
          :totalRecords="totalRecords" :first="first"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} sản phẩm"
          class="p-datatable-gridlines" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll"
          @page="onPageChange">
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-semibold">Sản phẩm</span>
              <ProgressSpinner v-if="loading" style="width: 30px; height: 30px" />
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column header="STT" style="width: 80px">
            <template #body="slotProps">
              {{ first + slotProps.index + 1 }}
            </template>
          </Column>
          <Column header="Ảnh" style="width: 100px">
            <template #body="{ data }">
              <img :src="data.imageUrl?.[0] || 'https://via.placeholder.com/50'" :alt="data.name" class="product-image"
                v-if="data.imageUrl?.length > 0" />
            </template>
          </Column>

          <Column field="name" header="Tên sản phẩm" sortable style="min-width: 200px"></Column>
          <Column field="variantCount" header="Số lượng" sortable style="min-width: 150px"></Column>
          <Column field="categoryName" header="Danh mục" sortable style="min-width: 150px"></Column>
          <Column field="supplierName" header="Nhà cung cấp" sortable style="min-width: 150px"></Column>
          <Column field="sportType" header="Loại thể thao" sortable style="min-width: 150px"></Column>


          <Column header="Thao tác" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <RouterLink :to="`/productupdateparent/${data.id}`">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-success" v-tooltip.top="'Sửa'" />
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