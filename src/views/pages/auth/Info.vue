<template>
  <div class="info-container">
    <main class="profile-main">
      <form @submit.prevent="updateUser" class="profile-form-two-column">
        <div class="form-left">
          <h1 class="profile-form-title">Hồ Sơ Của Tôi</h1>
          <p class="profile-form-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

          <div class="profile-form-row">
            <label class="profile-label">Tên đăng nhập</label>
            <div class="profile-value">{{ user?.username || 'Chưa có' }}</div>
          </div>

          <div class="profile-form-row">
            <label class="profile-label">Tên</label>
            <div class="profile-value">{{ user?.username || 'Chưa có' }}</div>
            <!-- <input class="profile-input" placeholder="Nhập họ tên" disabled /> -->
          </div>

          <div class="profile-form-row">
            <label class="profile-label">Email</label>
            <div class="profile-value">
              {{ maskedEmail }}
              <!-- <button type="button" class="profile-link">Thay Đổi</button> -->
              <router-link to="/auth/profile/change-email" :class="isActive('/auth/profile/change-email')">
                <a class="profile-link">Đổi Email</a>
              </router-link>
            </div>
          </div>

          <div class="profile-form-row">
            <label class="profile-label">Số điện thoại</label>
            <div class="profile-value">
              {{ maskedPhone }}
              <!-- <button type="button" class="profile-link">Thay Đổi</button> -->
              <router-link
                :to="{ path: '/auth/profile/change-sdt', query: { mode: maskedPhone === '' ? 'add' : 'edit' } }"
                :class="isActive('/auth/profile/change-sdt')">
                <span class="profile-link">
                  {{ maskedPhone === '' ? 'Thêm số điện thoại' : 'Đổi số điện thoại' }}
                </span>
              </router-link>
            </div>
          </div>

          <div class="profile-form-row">
            <label class="profile-label">Giới tính</label>
            <div class="profile-radio-group">
              <label v-for="opt in genderOptions" :key="opt.value" class="profile-radio-label">
                <input type="radio" :value="opt.value" v-model="updateForm.gender" class="profile-radio" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
          <div class="profile-form-row">
            <label class="profile-label"></label>
            <div class="profile-radio-group">
              <span v-if="successMessage" class="profile-success">{{ successMessage }}</span>
            </div>
          </div>

          <div class="profile-form-row">
            <button type="submit" class="profile-save-btn" :disabled="loading">
              {{ loading ? 'Đang lưu...' : 'Lưu' }}
            </button>
            <span v-if="error" class="profile-error">{{ error }}</span>
          </div>
        </div>

        <!-- Avatar bên phải -->
        <div class="form-right">
          <img src="../../../assets/data/Anh/Logo-removebg-preview.png" alt="Avatar" class="avatar-image" />
        </div>
      </form>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { AuthService } from '../../../service/auth/AuthService';
import type { UserResponse } from '../../../service/auth/AuthService';
import { useToast } from 'primevue/usetoast';


const toast = useToast();
const route = useRoute()
const user = ref<UserResponse | null>(null);
const updateForm = ref({
  email: '',
  phoneNumber: '',
  gender: '',

});
const isActive = (path: string): string => {
  return route.path === path
    ? 'text-red-500 font-semibold'
    : 'text-gray-700 hover:text-red-500'
}
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const genderOptions = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },

];

const maskedEmail = computed(() => {
  if (!user.value?.email) return '';
  const parts = user.value.email.split('@');
  return parts[0].slice(0, 2) + '*****@' + parts[1];
});
const maskedPhone = computed(() => {
  if (!user.value?.phoneNumber) return '';
  return '*******' + user.value.phoneNumber.slice(-2);
});

const fetchUserInfo = async () => {
  try {
    const userId = parseInt(sessionStorage.getItem('userId') || '0');
    const response = await AuthService.findByUserId(userId);
    user.value = response.data ?? null;
    updateForm.value.gender = user.value?.gender ?? '';
  } catch (err: any) {
    error.value = 'Không thể lấy thông tin người dùng.';
  }
};

const updateUser = async () => {
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  try {
    const userId = parseInt(sessionStorage.getItem('userId') || '0');
    await AuthService.updateUserInfo(userId, updateForm.value);
    successMessage.value = 'Cập nhật thành công!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật thành công!', life: 3000 });
    await fetchUserInfo();
  } catch (err: any) {
    error.value = 'Lỗi khi cập nhật: ' + (err.message || 'Không xác định');

  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.info-container {
  width: 100%;
  background-color: white;
  margin-bottom: 30px;
}

.profile-layout {
  border: #13c97a 1px solid;
  height: 100%;
  width: 100%;
  display: flex;
  font-family: 'Roboto', Arial, Helvetica, sans-serif;
}

.profile-sidebar {
  border: #13c97a 1px solid;
  width: 280px;
  min-width: 210px;
  background: #fff;
  border-right: 1px solid #ececec;
  padding: 40px 24px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-username {
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}

.sidebar-edit-btn {
  color: #1793e6;
  font-size: 12px;
  background: none;
  border: none;
  margin-bottom: 28px;
  cursor: pointer;
  padding: 0;
}

.profile-menu {
  width: 100%;
}

.profile-menu-section {
  color: #888;
  font-size: 13px;
  margin-bottom: 2px;
  font-weight: 500;
}

.profile-menu-item {
  display: block;
  color: #222;
  font-size: 16px;
  padding: 5px 0 5px 0;
  text-decoration: none;
  border-radius: 2px;
  transition: background 0.1s;
  margin-bottom: 2px;
}

.profile-menu-item.active,
.profile-menu-item:hover {
  color: #ee4d2d;
  background: #fef6f5;
  font-weight: 600;
}

.profile-menu-sale {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  gap: 4px;
}

.sale-badge {
  background: #ee4d2d;
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 6px;
  margin-right: 6px;
}

.sale-new {
  color: #ee4d2d;
  font-weight: 600;
  font-size: 13px;
  margin-left: 5px;
}

/* Main content */
.profile-form {
  background: #fff;
  width: 100%;
  max-width: 680px;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .04);
  padding: 36px 48px 32px 48px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.profile-form-title {
  font-size: 24px;
  font-weight: 500;
  color: #222;
  margin-bottom: 2px;
}

.profile-form-desc {
  padding-bottom: 20px;
  color: #888;
  font-size: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-form-row {

  display: flex;
  align-items: center;
  margin-bottom: 21px;
}

.profile-label {
  text-align: right;
  width: 150px;
  color: #555;
  font-size: 15px;
  font-weight: 500;
  margin-right: 18px;

}

.profile-value {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #222;
  gap: 6px;
}

.profile-input {
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  padding: 9px 12px;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
}

.profile-input:focus {
  border-color: #ee4d2d;
}

.profile-link {
  background: none;
  border: none;
  color: #1793e6;
  font-size: 14px;
  margin-left: 10px;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.profile-link:hover {
  color: #ee4d2d;
}

.profile-radio-group {
  display: flex;
  gap: 24px;
}

.profile-radio-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-right: 13px;
  color: #444;
  font-weight: 400;
}

.profile-radio {
  accent-color: #ee4d2d;
  margin-right: 6px;
}

.profile-save-btn {
  margin-left: 170px;
  margin-top: 30px;
  min-width: 120px;
  background: #ee4d2d;
  color: #fff;
  font-size: 15px;
  padding: 11px 0;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  margin-right: 18px;
  cursor: pointer;
  transition: background 0.18s;
}

.profile-save-btn:disabled {
  background: #ffb199;
  cursor: not-allowed;
}

.profile-success {
  color: #13c97a;
  font-size: 15px;
  margin-left: 12px;
}

.profile-error {
  color: #ee4d2d;
  font-size: 15px;
  margin-left: 12px;
}

@media (max-width: 900px) {
  .profile-form {
    padding: 20px 10px;
  }

  .profile-main {
    background-color: whitesmoke;
    padding: 30px 0;
  }

  .profile-sidebar {
    padding: 30px 10px 0 10px;
  }
}

.profile-form-two-column {
  background: white;
  width: 100%;
  /* <-- chiếm toàn bộ chiều rộng bên phải */
  height: 100%;
  display: flex;
  padding: 36px 48px 0px 48px;
  gap: 32px;
  margin: 0;
  /* <-- loại bỏ margin giữa form và khung ngoài */
  box-sizing: border-box;
}

.profile-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: stretch;
  /* <-- khối form kéo full chiều ngang */
  width: 100%;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.form-left {
  flex: 1.5;
}

.form-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 30px;
}

.avatar-image {
  width: 350px;
  height: 350px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;

}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #eaeaea;
  margin-bottom: 16px;
}

.avatar-input {
  display: none;
}

.choose-avatar-btn {
  background: #fff;
  border: 1px solid #ccc;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.avatar-note {
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>