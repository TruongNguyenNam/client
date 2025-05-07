<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductAttributeService } from '../../../../service/ProductAttribueService';
import type { ProductAttributeResponse, ProductAttributeRequest } from '../../../../model/productAttribute';
import { useToast } from 'primevue/usetoast';

const listProduct = ref<ProductAttributeResponse[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editingAttribute = ref<ProductAttributeResponse | null>(null);

const name = ref('');
const description = ref('');
const toast = useToast();

// Lấy toàn bộ danh sách thuộc tính
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await ProductAttributeService.getAllProductAttribute();
    listProduct.value = response.data ?? [];
  } catch (error) {
    console.error('Lỗi khi lấy thuộc tính sản phẩm:', error);
  } finally {
    loading.value = false;
  }
};

// Mở dialog và nạp dữ liệu thuộc tính
const openEditDialog = async (id: number) => {
  try {
    const response = await ProductAttributeService.getProductAttributeById(id);
    if (response.data) {
      editingAttribute.value = response.data;
      name.value = response.data.name;
      description.value = response.data.description;
      dialogVisible.value = true;
    } else {
      console.error('Không tìm thấy thuộc tính.');
    }
  } catch (error) {
    console.error('Không lấy được dữ liệu thuộc tính:', error);
  }
};

// Gọi API cập nhật thuộc tính
const saveChanges = async () => {
  if (!editingAttribute.value) return;

  const updated: ProductAttributeRequest = {
    name: name.value,
    description: description.value,
  };

  try {
    await ProductAttributeService.updateProductAttribute(editingAttribute.value.id, updated);
    toast.add({ severity: 'success', summary: 'Cập nhật thành công', life: 3000 });
    dialogVisible.value = false;
    fetchProducts(); // Cập nhật lại danh sách
  } catch (error) {
    if (error instanceof Error) {
      console.error('Lỗi:', error.message);
    } else {
      console.error('Lỗi không xác định:', error);
    }
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div class="card">
    <h2 class="mb-3">Danh sách Thuộc tính sản phẩm</h2>

    <RouterLink to="/atributeadd">
      <Button label="New" icon="pi pi-plus" class="p-button-success mr-2 mb-3" />
    </RouterLink>

    <DataTable
      :value="listProduct"
      :loading="loading"
      dataKey="id"
      :paginator="true"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20]"
      responsiveLayout="scroll"
      currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} thuộc tính"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <span class="text-xl font-semibold">Thuộc tính</span>
        </div>
      </template>

      <Column field="id" header="ID" style="width: 100px" sortable />
      <Column field="name" header="Tên thuộc tính" sortable />
      <Column field="description" header="Mô tả" sortable />
      <Column header="Hành động" style="width: 120px">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success"
            v-tooltip.top="'Sửa'"
            @click="openEditDialog(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog cập nhật -->
    <Dialog v-model:visible="dialogVisible" modal header="Cập nhật thuộc tính" :style="{ width: '450px' }">
      <div class="p-fluid">
        <div class="field mb-3">
          <label for="name">Tên thuộc tính</label>
          <InputText id="name" v-model="name" />
        </div>

        <div class="field mb-3">
          <label for="description">Mô tả</label>
          <Textarea id="description" v-model="description" rows="3" />
        </div>
      </div>

      <template #footer>
        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="dialogVisible = false" />
        <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveChanges" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
