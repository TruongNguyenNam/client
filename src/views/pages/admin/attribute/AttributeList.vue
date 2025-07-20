<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
  import type { ProductAttributeResponse, ProductAttributeRequest } from '../../../../model/admin/productAttribute';
  import { useToast } from 'primevue/usetoast';

  const listProduct = ref<ProductAttributeResponse[]>([]);
  const loading = ref(false);
  const dialogVisible = ref(false);
  const isEditMode = ref(false);
  const editingAttribute = ref<ProductAttributeResponse | null>(null);
  const first = ref(0);

  const name = ref('');
  const description = ref('');
  const toast = useToast();

  // Tìm kiếm
  const searchTerm = ref('');

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

 // Tìm kiếm
  const searchByName = async () => {
    if (!searchTerm.value) {
      fetchProducts(); // Nếu không có từ khóa, gọi lại hàm lấy toàn bộ danh sách
      return;
    }
    loading.value = true;
    try {
      const data = await ProductAttributeService.searchProductAttribute(searchTerm.value);
      listProduct.value = data ?? []; // Cập nhật danh sách sản phẩm từ API
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: `Đã xảy ra lỗi khi tìm kiếm: ${error.message}`, life: 3000 });
      } else {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Đã xảy ra lỗi không xác định', life: 3000 });
      }
    } finally {
      loading.value = false;
    }
  };


  // Lọc danh sách thuộc tính theo tên
  const filteredListProduct = computed(() => {
    if (!searchTerm.value) {
      return listProduct.value;
    }
    return listProduct.value.filter(product =>
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  });

  // Mở dialog thêm mới
  const openAddDialog = () => {
    isEditMode.value = false;
    name.value = '';
    description.value = '';
    dialogVisible.value = true;
  };

  // Mở dialog chỉnh sửa
  const openEditDialog = async (id: number) => {
    if (!id) {
      console.error('ID không hợp lệ:', id);
      return; // Không thực hiện tiếp nếu ID không hợp lệ
    }

    try {
      const response = await ProductAttributeService.getProductAttributeById(id);
      if (response.data) {
        isEditMode.value = true;
        editingAttribute.value = response.data;
        name.value = response.data.name;
        description.value = response.data.description;
        dialogVisible.value = true;
      }
    } catch (error) {
      console.error('Không lấy được dữ liệu thuộc tính:', error);
    }
  };

 const saveAttribute = async () => {
  // Kiểm tra nếu name hoặc description trống
  if (!name.value.trim()) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên thuộc tính không được để trống', life: 3000 });
    return; // Dừng lại không gửi yêu cầu
  }

  if (!description.value.trim()) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mô tả không được để trống', life: 3000 });
    return; // Dừng lại không gửi yêu cầu
  }

  // Kiểm tra trùng tên trong danh sách thuộc tính
  const isDuplicate = listProduct.value.some(product =>
    product.name.toLowerCase() === name.value.trim().toLowerCase() && 
    (isEditMode.value ? product.id !== editingAttribute.value?.id : true) // Bỏ qua ID hiện tại khi cập nhật
  );

  if (isDuplicate) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên thuộc tính đã tồn tại', life: 3000 });
    return; // Dừng lại không gửi yêu cầu nếu trùng tên
  }

  // Tạo payload và tiếp tục lưu hoặc cập nhật
  const payload: ProductAttributeRequest = {
    name: name.value.trim(),
    description: description.value.trim(),
  };

  try {
    if (isEditMode.value && editingAttribute.value) {
      // Cập nhật thuộc tính
      await ProductAttributeService.updateProductAttribute(editingAttribute.value.id, payload);
      toast.add({ severity: 'success', summary: 'Cập nhật thành công', life: 3000 });
    } else {
      // Lưu thuộc tính mới
      await ProductAttributeService.saveProductAttribute(payload);
      toast.add({ severity: 'success', summary: 'Thêm mới thành công', life: 3000 });
    }

    dialogVisible.value = false;
    fetchProducts(); // Lấy lại danh sách thuộc tính
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: data.message || 'Dữ liệu không hợp lệ', 
          life: 3000 
        });
      } else if (status === 401) {
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Vui lòng đăng nhập lại', 
          life: 3000 
        });
      } else if (status === 500) {
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Lỗi hệ thống, vui lòng thử lại sau', 
          life: 3000 
        });
      } else {
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Đã xảy ra lỗi khi xử lý yêu cầu', 
          life: 3000 
        });
      }
    } else {
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Không thể kết nối đến server', 
        life: 3000 
      });
      console.error('Lỗi khi gọi API:', error);
    }
  }
};

  onMounted(fetchProducts);
</script>

<template>
  <div class="card">
    <h2 class="mb-3">Danh sách Thuộc tính sản phẩm</h2>
     
                    
                 
    <div class="menuat">
    <Button label="New" icon="pi pi-plus" class="p-button-success mr-2 mb-3 mt-3 ml-4" @click="openAddDialog" />
    <div class="imandex">
    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
    <Button label="Export" icon="pi pi-upload" class="p-button-help" />
    </div>
  </div>

  <!-- Tìm kiếm riêng, căn phải -->
  <div class="search-wrapper">
    <InputText v-model="searchTerm" placeholder="Tìm kiếm thuộc tính" class="p-inputtext-sm" @input="searchByName" />
  </div>
    <DataTable
      :value="listProduct"
      :loading="loading"
      dataKey="id"
      :paginator="true"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20]"
      responsiveLayout="scroll"
      :first="first"
      @page="e => first = e.first"
      currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} thuộc tính"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <span class="text-xl font-semibold">Thuộc tính</span>
        </div>
      </template>
      <Column header="STT" style="width: 80px">
        <template #body="slotProps">
          {{ first + slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="name" header="Tên thuộc tính" sortable />
      <Column field="description" header="Mô tả" sortable />
      <Column header="Thao Tác" style="width: 120px">
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

    <!-- Dialog thêm/cập nhật -->
    <Dialog v-model:visible="dialogVisible" modal :header="isEditMode ? 'Cập nhật thuộc tính' : 'Thêm thuộc tính mới'" :style="{ width: '450px' }">
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
        <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveAttribute" />
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

.menuat {
  background-color: rgb(234, 232, 232);
  border-radius: 5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
}
.imandex {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}


.search-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.search-wrapper .p-inputtext-sm {
  width: 250px;
  height: 2.5rem;
  padding: 0.5rem;
  box-sizing: border-box;
}

</style>
