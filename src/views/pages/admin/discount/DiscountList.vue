<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { DiscountService } from '../../../../service/DiscountService';
import type { DiscountRequest, DiscountResponse } from "../../../../model/discount";
  import { useToast } from 'primevue/usetoast';

  const ListDiscount = ref<DiscountResponse[]>([]);
  const loading = ref(false);
  const dialogVisible = ref(false);
  const isEditMode = ref(false);
  const editingAttribute = ref<DiscountResponse | null>(null);
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
      const response = await DiscountService.getAllDiscount();
      console.log('API data:', response.data);
      ListDiscount.value = response.data ?? [];
     
    } catch (error) {
      console.error('Lỗi khi lấy thuộc tính sản phẩm:', error);
    } finally {
      loading.value = false;
    }
  };
   onMounted(fetchProducts);

</script>

<template>
  <h3>Danh sách khuyến mãi</h3>
             
    <div class="menuat">
        <RouterLink to="/discountadd">
                  <Button label="New" icon="pi pi-plus" class="p-button-success mr-2 mb-3 mt-3 ml-4" />
              </RouterLink>
    <div class="imandex">
    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
    <Button label="Export" icon="pi pi-upload" class="p-button-help" />
    </div>
  </div>

  <!-- Tìm kiếm riêng, căn phải -->
  <div class="search-wrapper">
    <InputText v-model="searchTerm" placeholder="Tìm kiếm thuộc tính" class="p-inputtext-sm"  />
  </div>
  <DataTable
    :value="ListDiscount"
    :loading="loading"
    dataKey="id"
    :paginator="true"
    :rows="5"
    :rowsPerPageOptions="[5, 10, 20]"
    responsiveLayout="scroll"
    :first="first"
    @page="e => first = e.first"
    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} khuyến mãi"
  >
    <template #header>
      <div class="flex justify-content-between align-items-center">
        <span class="text-xl font-semibold">Danh sách khuyến mãi</span>
      </div>
    </template>

    <Column header="STT" style="width: 80px">
      <template #body="slotProps">
        {{ first + slotProps.index + 1 }}
      </template>
    </Column>

    <Column field="name" header="Tên khuyến mãi" sortable />
    <Column field="discountPercentage" header="Phần trăm giảm" sortable />
    <Column field="countProduct" header="SL sản phẩm" />
    <Column field="status" header="Trạng thái" />
    <Column field="startDate" header="Ngày bắt đầu" />
    <Column field="endDate" header="Ngày kết thúc" />

    <Column header="Hành động" style="width: 120px">flex
      <template #body="slotProps">
        <!-- Thêm nút sửa/xóa nếu cần -->
       
      </template>
    </Column>
  </DataTable>
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
