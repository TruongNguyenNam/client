<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CustomerService } from "../../../../service/admin/CustomerServiceLegacy";
import type { CustomerResponse } from "../../../../model/admin/customer";
import { exportToExcel, importFromExcel, downloadExcelTemplate } from '../../../../utils/excel';
import { useToast } from 'primevue/usetoast';
import type { CustomerRequest } from "../../../../model/admin/customer";
const toast = useToast();
// Tải file mẫu Excel
const downloadCustomerTemplate = () => {
  const exampleData = [
    {
      Name: 'Nguyễn Văn Minh',
      Email: 'minh.nguyen@example.com',
      PhoneNumber: '0911222333',
      Gender: 'MALE',
      ReceiverName: 'Nguyễn Văn Minh',
      ReceiverPhone: '0911222333',
      IsDefault: true,
      AddressStreet2: '12 Đường Trần Hưng Đạo',
      Ward2: 'Phường Bến Nghé',
      District2: 'Quận 1',
      Province2: 'TP.HCM',
      City2: 'Hồ Chí Minh',
      State2: 'Miền Nam',
      Country2: 'Vietnam',
      Zipcode2: '710000',
    },
    {
      Name: 'Trần Thị Mai',
      Email: 'mai.tran@example.com',
      PhoneNumber: '0933444555',
      Gender: 'FEMALE',
      ReceiverName: 'Trần Thị Mai',
      ReceiverPhone: '0933444555',
      IsDefault: false,
      AddressStreet2: '89 Đường Cầu Giấy',
      Ward2: 'Phường Dịch Vọng',
      District2: 'Quận Cầu Giấy',
      Province2: 'Hà Nội',
      City2: 'Hà Nội',
      State2: 'Miền Bắc',
      Country2: 'Vietnam',
      Zipcode2: '110000',
    }
  ];

  exportToExcel(exampleData, 'Template_KhachHang', 'KhachHangTemplate-DayDu');

  toast.add({
    severity: 'info',
    summary: 'Tải mẫu thành công',
    detail: 'File mẫu đã được tải về.',
    life: 3000,
  });
};

// Xuất danh sách khách hàng ra Excel
const exportCustomers = () => {
  if (!customers.value.length) {
    toast.add({
      severity: 'warn',
      summary: 'Không có dữ liệu',
      detail: 'Danh sách khách hàng trống',
      life: 3000
    });
    return;
  }

  const data = customers.value.map(c => {
    const defaultAddress = c.addresses?.find(addr => addr.isDefault);
    const fullAddress = defaultAddress
      ? [
        defaultAddress.street,
        defaultAddress.ward,
        defaultAddress.district,
        defaultAddress.province,
        defaultAddress.city
      ]
        .filter(Boolean)
        .join(', ')
      : '—';

    console.log(`📦 ${c.username} => ${fullAddress}`);

    return {
      Name: c.username,
      Email: c.email,
      PhoneNumber: c.phoneNumber,
      Address: fullAddress,
      Gender: c.gender
    };
  });

  exportToExcel(data, 'DanhSachKhachHang');
  toast.add({
    severity: 'success',
    summary: 'Xuất thành công',
    detail: 'Đã xuất file Excel',
    life: 3000
  });
};
// Import danh sách khách hàng từ Excel
const importCustomers = async (event: any) => {
  const file = event.files?.[0];
  if (!file) return;

  try {
    const importedData = await importFromExcel(file);
    let added = 0;

    for (const item of importedData) {
      if (item.Name && item.Email && item.PhoneNumber) {
        const gender = item.Gender?.toUpperCase() || 'OTHER';

        const customerData: CustomerRequest = {
          username: item.Name?.trim(),
          email: item.Email?.trim(),
          phoneNumber: item.PhoneNumber?.trim(),
          gender: ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : 'OTHER',
          role: 'CUSTOMER',
          address: {
            receiverName: item.ReceiverName?.trim() || '',
            receiverPhone: item.ReceiverPhone?.trim() || '',
            isDefault: item.IsDefault ?? false,
            street: item.AddressStreet2?.trim() || '',
            ward: item.Ward2?.trim() || '',
            district: item.District2?.trim() || '',
            province: item.Province2?.trim() || '',
            city: item.City2?.trim() || '',
            state: item.State2?.trim() || '',
            country: item.Country2?.trim() || '',
            zipcode: item.Zipcode2?.trim() || '',
          },
        };

        try {
          await CustomerService.createCustomer(customerData);
          added++;
        } catch (error) {
          console.error(" Lỗi tạo khách hàng:", customerData, error);
        }
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Import thành công',
      detail: `Đã thêm ${added} khách hàng`,
      life: 3000,
    });

    await loadCustomers();
  } catch (err) {
    console.error("Lỗi khi import Excel:", err);
    toast.add({
      severity: 'error',
      summary: 'Lỗi import',
      detail: 'Vui lòng kiểm tra lại file hoặc định dạng cột',
      life: 4000,
    });
  }
};


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
const searchCustomers = async (): Promise<void> => {
  if (!searchTerm.value.trim()) {
    await loadCustomers();
    lazyParams.value.page = 0;
    return;
  }
  loading.value = true;
  try {
    const response = await CustomerService.searchCustomers(searchTerm.value);
    customers.value = Array.isArray(response.data) ? response.data : [];
    totalRecords.value = customers.value.length;
    lazyParams.value.page = 0;
  } catch (error) {
    customers.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { searchCustomers(); }, 500);
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
            <Button label="Tải mẫu" icon="pi pi-download" class="p-button-secondary mr-2"
              @click="downloadCustomerTemplate" />
            <FileUpload mode="basic" accept=".xlsx" :auto="true" :maxFileSize="1000000" chooseLabel="Nhập Excel"
              class="mr-2 inline-block" @select="importCustomers" />
            <Button label="Xuất Excel" icon="pi pi-upload" class="p-button-help" @click="exportCustomers" />
          </template>

        </Toolbar>
        <div class="flex align-items-center justify-content-between mb-4">
          <Button icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mr-2" @click="clearSearch" />
          <div class="search-bar-vertical">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText v-model="searchTerm" placeholder="Tìm theo Tên, Email hoặc SĐT" class="search-input-box"
                @keyup="debouncedSearch" />
            </span>
          </div>
        </div>
        <DataTable v-model:selection="selectedCustomers" :value="customers" :paginator="true"
          :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
          emptyMessage="Không tìm thấy khách hàng nào." :loading="loading" @page="onPage"
          :rowsPerPageOptions="[5, 10, 20, 50]" class="p-datatable-gridlines" :rowHover="true"
          :globalFilterFields="['username', 'email', 'phoneNumber']">
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-semibold">Danh sách khách hàng</span>
            </div>
          </template>
          <Column selectionMode="multiple" headerStyle="width: 3em" />
          <Column header="STT" style="width: 4rem">
            <template #body="slotProps">
              {{ lazyParams.page * lazyParams.size + slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="username" header="Tên khách hàng" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="phoneNumber" header="Số điện thoại" sortable />
          <Column header="Địa chỉ mặc định" sortable>
            <template #body="slotProps">
              {{
                (() => {
                  const defaultAddress = slotProps.data.addresses?.find((addr: any) => addr.isDefault);
                  if (!defaultAddress) return '—';
                  return [
                    defaultAddress.street,
                    defaultAddress.ward,
                    defaultAddress.district,
                    defaultAddress.province,
                    defaultAddress.city
                  ].filter(Boolean).join(', ');
                })()
              }}
            </template>

          </Column>
          <Column field="gender" header="Giới tính" sortable>
            <template #body="slotProps">
              {{ formatGender(slotProps.data.gender) }}
            </template>
          </Column>
          <Column field="status" header="Trạng thái">
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
  width: 250px;
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