<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-4xl space-y-8">
      <!-- Thông tin người dùng -->
      <div class="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Thông tin cá nhân</h1>

        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6">
          {{ error }}
        </div>
        <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded mb-6">
          {{ successMessage }}
        </div>

        <div v-if="user" class="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          <div class="space-y-3">
            <p><strong class="font-medium">Tên:</strong> {{ user.username }}</p>
            <p><strong class="font-medium">Email:</strong> {{ user.email }}</p>
            <p><strong class="font-medium">Vai trò:</strong> {{ user.role }}</p>
          </div>
          <div class="space-y-3">
            <p><strong class="font-medium">Số điện thoại:</strong> {{ user.phoneNumber || 'Chưa cập nhật' }}</p>
            <p><strong class="font-medium">Giới tính:</strong> {{ user.gender || 'Chưa cập nhật' }}</p>
            <p>
              <strong class="font-medium">Địa chỉ:</strong>
              <span v-if="user.address">
                {{ user.address.addressStreet || '' }}, {{ user.address.addressWard || '' }},
                {{ user.address.addressDistrict || '' }}, {{ user.address.addressProvince || '' }},
                {{ user.address.addressCity || '' }}, {{ user.address.addressCountry || '' }}
                {{ user.address.addressZipcode || '' }}
              </span>
              <span v-else>Chưa cập nhật</span>
            </p>
            <p><strong class="font-medium">Trạng thái:</strong> {{ user.isActive ? 'Kích hoạt' : 'Chưa kích hoạt' }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-6">Đang tải thông tin...</div>
      </div>

      <!-- Form cập nhật -->
      <div class="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Cập nhật thông tin</h2>

        <form @submit.prevent="updateUser" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Email</label>
              <InputText v-model="updateForm.email" class="form-input" />
            </div>
            <div>
              <label class="form-label">Số điện thoại</label>
              <InputText v-model="updateForm.phoneNumber" class="form-input" />
            </div>
            <div>
              <label class="form-label">Giới tính</label>
              <Dropdown
                v-model="updateForm.gender"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn giới tính"
                class="form-input"
              />
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Địa chỉ</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputText v-model="updateForm.address.addressStreet" placeholder="Địa chỉ chi tiết" class="form-input" />
              <Dropdown
                v-model="updateForm.address.addressProvince"
                :options="provinceOptions"
                optionLabel="name"
                optionValue="name"
                placeholder="Tỉnh/Thành phố"
                class="form-input"
                @change="onProvinceChange"
              />
              <Dropdown
                v-model="updateForm.address.addressDistrict"
                :options="districtOptions"
                optionLabel="name"
                optionValue="name"
                placeholder="Quận/Huyện"
                class="form-input"
                :disabled="!updateForm.address.addressProvince"
                @change="onDistrictChange"
              />
              <Dropdown
                v-model="updateForm.address.addressWard"
                :options="wardOptions"
                optionLabel="name"
                optionValue="name"
                placeholder="Phường/Xã"
                class="form-input"
                :disabled="!updateForm.address.addressDistrict"
              />
              <InputText v-model="updateForm.address.addressCity" placeholder="Thành phố" class="form-input" />
              <InputText v-model="updateForm.address.addressCountry" placeholder="Quốc gia" class="form-input" />
              <InputText v-model="updateForm.address.addressZipcode" placeholder="Mã bưu điện" class="form-input" />
            </div>
          </div>

          <div class="text-center pt-4">
            <Button
              type="submit"
              label="Cập nhật"
              icon="pi pi-check"
              :loading="loading"
              class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import provincesData from '../../../assets/data/vietnam_provinces.json';
import { AuthService } from '../../../service/auth/AuthService';
import type { UserResponse, UpdateUserForm } from '../../../service/auth/AuthService';
import { useRouter } from 'vue-router';

const router = useRouter();

const user = ref<UserResponse | null>(null);
const updateForm = ref<UpdateUserForm>({
  email: '',
  phoneNumber: '',
  gender: '',
  address: {
    id: 0,
    addressStreet: '',
    addressWard: '',
    addressCity: '',
    addressState: '',
    addressCountry: '',
    addressZipcode: '',
    addressDistrict: '',
    addressProvince: '',
  },
});
const error = ref('');
const successMessage = ref('');
const loading = ref(false);

const genderOptions = ref([
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
]);

const provinceOptions = ref(provincesData.data);
const districtOptions = ref<any[]>([]);
const wardOptions = ref<any[]>([]);

const userId = ref<number>(parseInt(sessionStorage.getItem('userId') || '0'));

const onProvinceChange = () => {
  const province = provinceOptions.value.find(p => p.name === updateForm.value.address.addressProvince);
  districtOptions.value = province?.level2s || [];
  updateForm.value.address.addressDistrict = '';
  updateForm.value.address.addressWard = '';
  wardOptions.value = [];
};

const onDistrictChange = () => {
  const district = districtOptions.value.find(d => d.name === updateForm.value.address.addressDistrict);
  wardOptions.value = district?.level3s || [];
  updateForm.value.address.addressWard = '';
};

const fetchUserInfo = async () => {
  if (!userId.value || isNaN(userId.value)) {
    error.value = 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.';
    router.push('/auth/login');
    return;
  }
  try {
    const response = await AuthService.findByUserId(userId.value);
    if (response.data) {
      user.value = response.data;
      const u = user.value;
      updateForm.value.email = u.email || '';
      updateForm.value.phoneNumber = u.phoneNumber || '';
      updateForm.value.gender = u.gender || '';
      updateForm.value.address = u.address || updateForm.value.address;

      if (u.address?.addressProvince) {
        districtOptions.value = provinceOptions.value.find(p => p.name === u.address?.addressProvince)?.level2s || [];
      }
      if (u.address?.addressDistrict) {
        wardOptions.value = districtOptions.value.find(d => d.name === u.address?.addressDistrict)?.level3s || [];
      }
    } else {
      error.value = 'Không tìm thấy thông tin người dùng.';
    }
  } catch (err: any) {
    error.value = 'Lỗi khi lấy thông tin người dùng: ' + (err.message || 'Không xác định');
    router.push('/auth/login');
  }
};

const updateUser = async () => {
  if (!userId.value || isNaN(userId.value)) {
    error.value = 'Không tìm thấy ID người dùng.';
    return;
  }
  loading.value = true;
  try {
    const response = await AuthService.updateUserAddress(userId.value, updateForm.value);
    if (response.data) {
      user.value = response.data;
      successMessage.value = response.data.message || 'Cập nhật thành công!';
      error.value = '';
      sessionStorage.setItem('userInfo', JSON.stringify(response.data));
    } else {
      error.value = 'Cập nhật thất bại: Không nhận được dữ liệu.';
    }
  } catch (err: any) {
    error.value = 'Lỗi khi cập nhật thông tin: ' + (err.message || 'Không xác định');
    successMessage.value = '';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1.5;
}
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200;
}
</style>