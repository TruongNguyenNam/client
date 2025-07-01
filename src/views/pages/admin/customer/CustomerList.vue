<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CustomerService } from "../../../../service/admin/CustomerServiceLegacy";
import type { CustomerResponse } from "../../../../model/admin/customer";

const customers = ref<CustomerResponse[]>([]);
const loading = ref<boolean>(true);
const totalRecords = ref<number>(0);
const searchTerm = ref<string>('');
const lazyParams = ref({
  page: 0,
  size: 5,
});

const selectedCustomers = ref<CustomerResponse[]>([]);

const router = useRouter();

const loadCustomers = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await CustomerService.getAllUsers();
    customers.value = Array.isArray(response.data) ? response.data : [];
    totalRecords.value = customers.value.length;
  } catch (error) {
    customers.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

const onPage = (event: { page: number; rows: number }) => {
  lazyParams.value.page = event.page;
  lazyParams.value.size = event.rows;
};

const addCustomer = () => {
  router.push("/customerAdd");
};

const editCustomer = (customerData: CustomerResponse) => {
  router.push(`/customers/edit/${customerData.id}`);
};

onMounted(loadCustomers);

const clearSearch = (): void => {
  searchTerm.value = '';
  loadCustomers();
  lazyParams.value.page = 0;
};

//tìm kiếm theo tên hoặc số điện thoại
// const searchCustomers = async (): Promise<void> => {
//   if (!searchTerm.value.trim()) {
//     await loadCustomers();
//     lazyParams.value.page = 0;
//     return;
//   }
//   loading.value = true;
//   try {
//     const response = await CustomerService.getCustomersByNameOrPhone(searchTerm.value);
//     customers.value = Array.isArray(response.data) ? response.data : [];
//     totalRecords.value = customers.value.length;
//     lazyParams.value.page = 0;
//   } catch (error) {
//     customers.value = [];
//     totalRecords.value = 0;
//   } finally {
//     loading.value = false;
//   }
// };

// let searchTimeout: ReturnType<typeof setTimeout> | null = null;
// const debouncedSearch = () => {
//   if (searchTimeout) clearTimeout(searchTimeout);
//   searchTimeout = setTimeout(() => { searchCustomers(); }, 500);
// };

const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getCustomerStatus = (customer: CustomerResponse) => {
  return { text: customer.active === true ? 'Hoạt động' : 'Không hoạt động', severity: customer.active === false ? 'warning' : 'success' };
};

const formatGender = (gender: string | null | undefined) => {
  if (!gender) return '';
  if (gender === 'MALE') return 'Nam';
  if (gender === 'FEMALE') return 'Nữ';
  return 'Khác';
};

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Danh sách khách hàng</h5>
        <Toolbar class="mb-4">
          <template v-slot:start>
            <Button label="Thêm mới" icon="pi pi-plus" class="p-button-success mr-2" @click="addCustomer" />
          </template>
          <template v-slot:end>
            <Button label="Nhập" icon="pi pi-upload" class="p-button-help mr-2" />
            <Button label="Xuất" icon="pi pi-download" class="p-button-info" />
          </template>
        </Toolbar>
        <div class="flex align-items-center justify-content-between mb-4">
          <Button icon="pi pi-filter-slash" label="Xóa bộ lọc" class="p-button-outlined mr-2" @click="clearSearch" />
          <div class="search-bar-vertical">
            <InputText v-model="searchTerm" placeholder="Tìm theo tên hoặc SĐT..." class="search-input-box"
              @keyup="" />
          </div>
        </div>
        <DataTable v-model:selection="selectedCustomers" :value="customers" :paginator="true"
          :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
          emptyMessage="Không tìm thấy khách hàng nào." :loading="loading" @page="onPage"
          :rowsPerPageOptions="[5, 10, 20, 50]" :globalFilterFields="['username', 'email', 'phoneNumber']">
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-semibold">Danh sách khách hàng</span>
            </div>
          </template>
          <Column selectionMode="multiple" headerStyle="width: 3em" />
          <Column field="username" header="Tên khách hàng" />
          <Column field="email" header="Email" />
          <Column field="phoneNumber" header="Số điện thoại" />
          <Column header="Địa chỉ">
            <template #body="slotProps">
              {{
                [
                  slotProps.data.addressStreet,
                  slotProps.data.addressWard,
                  slotProps.data.addressDistrict,
                  slotProps.data.addressProvince,
                  slotProps.data.addressCity
                ].filter(Boolean).join(', ')
              }}
            </template>
          </Column>
          <Column field="gender" header="Giới tính">
            <template #body="slotProps">
              {{ formatGender(slotProps.data.gender) }}
            </template>
          </Column>
          <Column field="status" header="Trạng thái" sortable>
            <template #body="slotProps">
              <Tag :value="getCustomerStatus(slotProps.data).text"
                :severity="getCustomerStatus(slotProps.data).severity" />
            </template>
          </Column>
          <Column header="Thao Tác">
            <template #body="slotProps">
              <div class="flex">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                  @click="editCustomer(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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

.search-bar-vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar-vertical :deep(.p-inputtext),
.search-bar-vertical :deep(.p-inputnumber-input),
.search-bar-vertical :deep(.p-inputwrapper),
.search-bar-vertical :deep(.p-calendar) {
  border-radius: 8px !important;
  border: 1px solid #ccc !important;
  background: #fff !important;
  box-shadow: none !important;
  margin: 0 !important;
}

.search-bar-vertical :deep(.p-inputtext:focus),
.search-bar-vertical :deep(.p-inputnumber-input:focus),
.search-bar-vertical :deep(.p-calendar:focus) {
  border-color: #007ad9 !important;
  box-shadow: 0 0 0 2px rgba(0, 122, 217, 0.08) !important;
  outline: none !important;
}

.filter-input {
  width: 140px;
  min-width: 90px;
  max-width: 170px;
}

.filter-separator {
  min-width: 16px;
  text-align: center;
  color: #888;
  font-weight: 500;
  user-select: none;
}

.search-input-box {
  width: 230px;
  min-width: 120px;
}

.custom-dialog {
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  position: relative;
}

.field-label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.p-input-icon-left {
  width: 100%;
}

.field-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.field-input:focus {
  border-color: #007ad9;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 122, 217, 0.5);
}

.cancel-button {
  color: #f44336;
}

.save-button {
  background-color: #007ad9;
  border-color: #007ad9;
  color: #fff;
}

.save-button:hover {
  background-color: #005bb5;
  border-color: #005bb5;
}
</style>