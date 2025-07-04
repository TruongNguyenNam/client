<template>
  <Dialog v-model:visible="visible" modal header="Chọn khách hàng" :style="{ width: '60vw' }">
    <Toast />

    <div class="mb-3 flex gap-2">
      <Button label="Danh sách khách hàng" icon="pi pi-list" class="p-button-secondary" @click="currentTab = 'list'" />
      <Button label="Thêm khách hàng" icon="pi pi-user-plus" class="p-button-success" @click="currentTab = 'form'" />
    </div>

    <!-- Danh sách khách hàng -->
    <div v-if="currentTab === 'list'">
      <div class="mb-3">
        <span class="p-input-icon-left w-\">
          <i class="pi pi-search" />
          <InputText  v-model="filters.global.value" placeholder="Tìm theo tên, email, số điện thoại..."
            class="search-input-box w-full" />
        </span>
      </div>

      <DataTable :value="customers" v-model:filters="filters" v-model:selection="selectedCustomer"
        selectionMode="single" dataKey="id" :paginator="true" :rows="5" :loading="loading"
        :globalFilterFields="['username', 'email', 'phoneNumber']" responsiveLayout="scroll">
        <Column field="id" header="ID" style="min-width: 4rem" />
        <Column field="username" header="Tên người dùng" style="min-width: 10rem" />
        <Column field="email" header="Email" style="min-width: 14rem" />
        <Column field="phoneNumber" header="SĐT" style="min-width: 10rem" />
        <Column field="addressDistrict" header="Quận/Huyện" />
        <Column field="addressProvince" header="Tỉnh/TP" />
        <Column field="active" header="Trạng thái">
          <template #body="{ data }">
            <Tag :value="data.active ? 'Hoạt động' : 'Không hoạt động'"
              :severity="data.active ? 'success' : 'danger'" />
          </template>
        </Column>
      </DataTable>
    </div>


    <!-- Form thêm khách hàng -->
    <div v-else>
      <form class="customer-form" @submit.prevent="submitCustomer">
        <div class="form-row">
          <div class="form-group">
            <label for="username">Tên Khách Hàng</label>
            <input id="username" v-model="customer.username" type="text" placeholder="Nhập tên khách hàng" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="customer.email" type="email" placeholder="Nhập địa chỉ email" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="phoneNumber">Số Điện Thoại</label>
            <input id="phoneNumber" v-model="customer.phoneNumber" type="text" placeholder="Nhập số điện thoại"
              required />
          </div>
          <div class="form-group">
            <label for="gender">Giới Tính</label>
            <select id="gender" v-model="customer.gender" required>
              <option value="" disabled>Chọn giới tính</option>
              <option v-for="g in genderOptions" :value="g.value" :key="g.value">{{ g.label }}</option>
            </select>
          </div>
        </div>
        <!-- Địa chỉ dạng cấp -->
        <div class="form-row">
          <div class="form-group">
            <label for="province">Tỉnh/Thành phố</label>
            <select id="province" v-model="customer.province" required>
              <option value="">Chọn tỉnh/thành</option>
              <option v-for="p in provinceOptions" :key="p.level1_id" :value="p.level1_id">{{ p.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="district">Quận/Huyện</label>
            <select id="district" v-model="customer.district" :disabled="!customer.province" required>
              <option value="">Chọn quận/huyện</option>
              <option v-for="d in districtOptions" :key="d.level2_id" :value="d.level2_id">{{ d.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="ward">Phường/Xã</label>
            <select id="ward" v-model="customer.ward" :disabled="!customer.district" required>
              <option value="">Chọn phường/xã</option>
              <option v-for="w in wardOptions" :key="w.level3_id" :value="w.level3_id">{{ w.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-group full-width">
          <label for="street">Địa chỉ chi tiết (số nhà, ngõ...)</label>
          <input id="street" v-model="customer.street" type="text" placeholder="Nhập chi tiết địa chỉ" />
        </div>
        <div class="form-group full-width">
          <label>Địa chỉ đầy đủ</label>
          <input :value="fullAddress" type="text" readonly placeholder="" />
        </div>
        <div class="form-actions">
          <button class="btn btn-submit" type="submit">
            <span class="icon">✔</span>
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </form>
    </div>

    <template #footer>
      <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Chọn" icon="pi pi-check" class="p-button-primary" :disabled="!selectedCustomer"
        @click="selectCustomer" v-if="currentTab === 'list'" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import type { CustomerResponse } from '../../../../model/admin/customer';
import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import type { Gender } from "../../../../model/admin/customer";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'selected']);

const visible = ref(props.modelValue);
const loading = ref(false);
const toast = useToast();

const currentTab = ref<'list' | 'form'>('list');
const customers = ref<CustomerResponse[]>([]);
const customer = ref({
  username: "",
  email: "",
  phoneNumber: "",
  gender: "",
  province: "",
  district: "",
  ward: "",
  street: ""
});

const genderOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" }
];
const provinceOptions = provincesData.data;
const districtOptions = computed(() =>
  provinceOptions.find(p => p.level1_id === customer.value.province)?.level2s || []
);
const wardOptions = computed(() =>
  districtOptions.value.find(d => d.level2_id === customer.value.district)?.level3s || []
);

// Địa chỉ đầy đủ để hiển thị
const fullAddress = computed(() =>
  [
    customer.value.street,
    wardOptions.value.find(w => w.level3_id === customer.value.ward)?.name,
    districtOptions.value.find(d => d.level2_id === customer.value.district)?.name,
    provinceOptions.find(p => p.level1_id === customer.value.province)?.name
  ].filter(Boolean).join(', ')
);

const selectedCustomer = ref<CustomerResponse | null>(null);


const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
  if (val) {
    getAllCustomers();
  }
});

const getAllCustomers = async () => {
  loading.value = true;
  try {
    const response = await CustomerService.getAllUsers();
    customers.value = response?.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách khách hàng',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const submitCustomer = async () => {
  const address = {
    street: customer.value.street,
    ward: wardOptions.value.find(w => w.level3_id === customer.value.ward)?.name || "",
    district: districtOptions.value.find(d => d.level2_id === customer.value.district)?.name || "",
    province: provinceOptions.find(p => p.level1_id === customer.value.province)?.name || "",
    city: "",
    state: "",
    country: "",
    zipcode: ""
  };
  try {
    await CustomerService.createCustomer({
      username: customer.value.username,
      email: customer.value.email,
      phoneNumber: customer.value.phoneNumber,
      gender: customer.value.gender as Gender,
      role: "CUSTOMER",                 // <-- thêm role mặc định
      active: true,                   // <-- luôn active mặc định khi tạo mới
      address
    });
    // Hiển thị thông báo thành công
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm khách hàng thành công!',
      life: 3000
    });
    // Reset form
    customer.value = {
      username: "",
      email: "",
      phoneNumber: "",
      gender: "",
      province: "",
      district: "",
      ward: "",
      street: ""
    };
    // Chuyển sang tab danh sách và reload lại danh sách
    currentTab.value = 'list';
    await getAllCustomers();
  } catch (err) {
    const error = err as any;
     toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.message || 'Có lỗi xảy ra khi thêm khách hàng!',
      life: 3000
    });
    console.log(error.response?.data || error);
  }
};


const selectCustomer = () => {
  if (selectedCustomer.value) {
    emit('selected', selectedCustomer.value);
    visible.value = false;
  }
};
</script>

<style scoped lang="scss">
.form-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.full-width {
  flex: 100%;
}
.p-input-icon-left {
    width: 100%;
}
label {
  font-size: 1.06rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

input,
select,
textarea {
  padding: 12px;
  font-size: 1.04rem;
  border: 1px solid #DDD;
  border-radius: 7px;
  transition: border-color 0.2s;
  background: #fafbfc;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #6c63ff;
  background: #fff;
}


.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  padding: 10px 26px;
  cursor: pointer;
  transition: background 0.18s;
}

.btn-cancel {
  background: #475569;
  color: #fff;
}

.btn-cancel .icon {
  font-size: 1em;
}

.btn-submit {
  background: #6366f1;
  color: #fff;
}

.btn-submit .icon {
  font-size: 1em;
}

.btn-cancel:hover {
  background: #334155;
}

.btn-submit:hover {
  background: #4f46e5;
}

@media (max-width: 800px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .customer-add-page {
    padding: 18px 8px;
  }
}
</style>