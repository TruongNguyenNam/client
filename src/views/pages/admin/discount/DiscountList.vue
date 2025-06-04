<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { DiscountService } from '../../../../service/DiscountService';
import type { DiscountResponse } from '../../../../model/discount';
import router from '../../../../router';

const ListDiscount = ref<DiscountResponse[]>([]);
const loading = ref(false);
const first = ref(0);
const searchTerm = ref('');
const filterStatus = ref<string | null>(null);
const toast = useToast();

// Lấy toàn bộ danh sách khuyến mãi
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await DiscountService.getAllDiscount();
    ListDiscount.value = response.data ?? [];
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể lấy danh sách khuyến mãi',
      life: 3000,
    });
    console.error('Lỗi khi lấy danh sách khuyến mãi:', error);
  } finally {
    loading.value = false;
  }
};

// Tìm kiếm theo tên
const searchDiscountByName = async (name: string) => {
  if (!name || name.trim() === '') {
    if (filterStatus.value) {
      await filterByStatus(filterStatus.value);
    } else {
      await fetchProducts();
    }
    return;
  }

  loading.value = true;
  try {
    const response = await DiscountService.searchByName(name);
    ListDiscount.value = response.data ?? [];
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không tìm thấy khuyến mãi',
      life: 3000,
    });
    console.error('Lỗi tìm kiếm khuyến mãi:', error);
  } finally {
    loading.value = false;
  }
};

// Lọc theo trạng thái (sử dụng API trực tiếp)
const filterByStatus = async (status: string) => {
  loading.value = true;
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/admin/discount/filterStatus/${status}`);
    ListDiscount.value = response.data ?? [];
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể lọc khuyến mãi theo trạng thái',
      life: 3000,
    });
    console.error('Lỗi lọc trạng thái khuyến mãi:', error);
  } finally {
    loading.value = false;
  }
};

// Thay đổi trạng thái
const toggleStatus = async (id: number) => {
  try {
    await DiscountService.updateStatus(id);

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thay đổi trạng thái thành công',
      life: 3000,
    });

    if (filterStatus.value) {
      await filterByStatus(filterStatus.value);
    } else {
      await fetchProducts();
    }
  }
  catch (err: any) {
    let msg = 'Đã xảy ra lỗi khi gửi dữ liệu.';
    if (err.response?.status === 400 && err.response.data?.message) msg = err.response.data.message;
    else if (err.response?.status === 405) msg = 'Phương thức không được hỗ trợ (405).';
    else if (err.response?.data?.error) msg = err.response.data.error;

    toast.add({ severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 });
  }
};

// Watch thay đổi ô tìm kiếm
watch(searchTerm, (newVal) => {
  searchDiscountByName(newVal);
});

// Watch thay đổi filter trạng thái
watch(filterStatus, async (newStatus) => {
  if (!newStatus) {
    if (searchTerm.value.trim() === '') {
      await fetchProducts();
    } else {
      await searchDiscountByName(searchTerm.value);
    }
  } else {
    await filterByStatus(newStatus);
  }
});

onMounted(fetchProducts);
</script>

<template>
  <Toast />

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

  <div class="search-wrapper" style="display:flex; justify-content:flex-end; gap:1rem; margin-bottom:1rem; align-items:center;">
    <InputText v-model="searchTerm" placeholder="Tìm kiếm khuyến mãi" class="p-inputtext-sm" />

    <Dropdown
      v-model="filterStatus"
      :options="[
        { label: 'Tất cả', value: null },
        { label: 'Chưa bắt đầu', value: 'PENDING' },
        { label: 'Đang áp dụng', value: 'ACTIVE' },
        { label: 'Tạm ngưng', value: 'INACTIVE' },
        { label: 'Đã hết hạn', value: 'EXPIRED' }
      ]"
      optionLabel="label"
      optionValue="value"
      placeholder="Lọc trạng thái"
      class="p-inputtext-sm"
      style="width: 180px"
      showClear
    />
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

    <Column header="Hành động" style="width: 180px">
      <template #body="slotProps">
        <div class="flex align-items-center gap-2">
          <RouterLink :to="`/discountupdate/${slotProps.data.id}`">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success" v-tooltip.top="'Sửa'" />
          </RouterLink>
          <Button
            icon="pi pi-refresh"
            class="p-button-rounded p-button-warning"
            v-tooltip.top="'Thay đổi trạng thái'"
            @click="toggleStatus(slotProps.data.id)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>

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

.p-dropdown {
  height: 2.5rem; /* chỉnh lại chiều cao */
  display: flex;
  align-items: center; /* giúp chữ canh giữa chiều dọc */
  font-size: 14px; /* tùy chỉnh font */
  line-height: 1.5; /* tránh bị thụt */
  padding: 0 0.5rem; /* tránh chữ sát mép */
  box-sizing: border-box;
}

.p-dropdown-label {
  line-height: 1.5;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 0 !important;
  display: flex;
  align-items: center;
  height: 100%;
}

.p-dropdown-items .p-dropdown-item {
  font-size: 14px;
  padding: 0.5rem 1rem;
  line-height: 1.5;
}

</style>