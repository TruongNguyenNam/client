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
          <InputText v-model="filters.global.value" placeholder="Tìm theo tên, email, số điện thoại..."
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
        <!-- <Column field="addressDistrict" header="Quận/Huyện" />
        <Column field="addressProvince" header="Tỉnh/TP" /> -->
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
      <div class="form-title">Thông Tin Khách Hàng</div>
      <form class="customer-form" @submit.prevent="submitCustomer">
        <div class="form-row">
          <div class="form-group">
            <label for="username">Tên Khách Hàng</label>
            <input id="username" v-model="customer.username" type="text" placeholder="Nhập tên khách hàng" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="customer.email" type="email" placeholder="Nhập địa chỉ email" required />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="phoneNumber">Số Điện Thoại</label>
            <input id="phoneNumber" v-model="customer.phoneNumber" type="text" placeholder="Nhập số điện thoại"
              required />
            <div v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</div>
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
        <!-- Người nhận + SĐT người nhận -->
        <div class="form-title">Địa Chỉ</div>
        <div class="form-row">
          <div class="form-group">
            <label for="receiverName">Tên người nhận</label>
            <input id="receiverName" v-model="customer.receiverName" type="text" placeholder="Nhập tên người nhận" />
          </div>
          <div class="form-group">
            <label for="receiverPhone">SĐT người nhận</label>
            <input id="receiverPhone" v-model="customer.receiverPhone" type="text" placeholder="Nhập SĐT người nhận" />
            <div v-if="errors.receiverPhone" class="error-message">{{ errors.receiverPhone }}</div>
          </div>
        </div>

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
  street: "",
  receiverName: "",
  receiverPhone: ""
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

const errors = ref<{ [key: string]: string }>({});

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone: string) {
  return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}
const submitCustomer = async () => {
  errors.value = {};

  // Kiểm tra rỗng & định dạng
  if (!customer.value.username.trim()) {
    errors.value.username = "Tên khách hàng không được để trống";
  }
  if (!validateEmail(customer.value.email)) {
    errors.value.email = "Email không hợp lệ";
  }
  if (!validatePhone(customer.value.phoneNumber)) {
    errors.value.phoneNumber = "Số điện thoại không hợp lệ";
  }
  if (!customer.value.gender) {
    errors.value.gender = "Vui lòng chọn giới tính";
  }
  if (!customer.value.province) {
    errors.value.province = "Vui lòng chọn tỉnh/thành";
  }
  if (!customer.value.district) {
    errors.value.district = "Vui lòng chọn quận/huyện";
  }
  if (!customer.value.ward) {
    errors.value.ward = "Vui lòng chọn phường/xã";
  }
  if (customer.value.receiverPhone && !validatePhone(customer.value.receiverPhone)) {
    errors.value.receiverPhone = "SĐT người nhận không hợp lệ";
  }

  // Kiểm tra trùng email
  const emailExists = customers.value.some(
    c => c.email.toLowerCase() === customer.value.email.toLowerCase()
  );
  if (emailExists) {
    errors.value.email = "Email này đã tồn tại";
  }

  // Kiểm tra trùng số điện thoại
  const phoneExists = customers.value.some(
    c => c.phoneNumber === customer.value.phoneNumber
  );
  if (phoneExists) {
    errors.value.phoneNumber = "Số điện thoại này đã tồn tại";
  }
if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các thông tin.',
            life: 3000
        });
        return;
    }
  // Nếu có lỗi thì return
  if (Object.keys(errors.value).length > 0) return;

  const address = {
    street: customer.value.street,
    ward: wardOptions.value.find(w => w.level3_id === customer.value.ward)?.name || "",
    district: districtOptions.value.find(d => d.level2_id === customer.value.district)?.name || "",
    province: provinceOptions.find(p => p.level1_id === customer.value.province)?.name || "",
    city: "",
    state: "",
    country: "Việt Nam",
    zipcode: "",
    isDefault: true,
    receiverName: customer.value.receiverName || customer.value.username,
    receiverPhone: customer.value.receiverPhone || customer.value.phoneNumber
  };

  try {
    await CustomerService.createCustomer({
      username: customer.value.username,
      email: customer.value.email,
      phoneNumber: customer.value.phoneNumber,
      gender: customer.value.gender as Gender,
      role: "CUSTOMER",
      active: true,
      address
    });

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm khách hàng thành công!',
      life: 3000
    });

    customer.value = {
      username: "",
      email: "",
      phoneNumber: "",
      gender: "",
      province: "",
      district: "",
      ward: "",
      street: "",
      receiverName: "",
      receiverPhone: ""
    };

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
    console.error(error.response?.data || error);
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
  font-size: 1.5rem;
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
.error-message {
    color: #e11d48;
    font-size: 0.96rem;
    margin-top: 5px;
    margin-bottom: 2px;
}
</style>