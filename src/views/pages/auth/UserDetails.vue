<template>
  <br> <br> <br> <br>
  <div class="profile-layout">
    <!-- Sidebar -->
    <aside class="profile-sidebar">
      <div class="profile-username">{{ user?.username || 'Tên người dùng' }}</div>
      <button class="sidebar-edit-btn">Sửa Hồ Sơ</button>
      <nav class="profile-menu">
        <div class="profile-menu-section">Tài Khoản Của Tôi</div>
        <a class="profile-menu-item active" href="#">Hồ Sơ</a>
        <a class="profile-menu-item" href="#">Ngân Hàng</a>
        <a class="profile-menu-item" href="#">Địa Chỉ</a>
        <a class="profile-menu-item" href="#">Đổi Mật Khẩu</a>
        <a class="profile-menu-item" href="#">Cài Đặt Thông Báo</a>
        <a class="profile-menu-item" href="#">Những Thiết Lập Riêng Tư</a>
        <div class="profile-menu-section mt-3"></div>
        <a class="profile-menu-item" href="#">Đơn Mua</a>
        <a class="profile-menu-item" href="#">Kho Voucher</a>
        <div class="profile-menu-sale">
          <span class="sale-badge">7.7</span>
          <span>Sale Hè Freeship</span>
          <span class="sale-new">New</span>
        </div>
      </nav>
    </aside>

    <!-- Main Profile Content -->
    <main class="profile-main">
      <form @submit.prevent="updateUser" class="profile-form">
        <h1 class="profile-form-title">Hồ Sơ Của Tôi</h1>
        <p class="profile-form-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        <div class="profile-form-row">
          <label class="profile-label">Tên đăng nhập</label>
          <div class="profile-value">{{ user?.username }}</div>
        </div>
        <div class="profile-form-row">
          <label class="profile-label">Tên</label>
          <input v-model="updateForm.name" class="profile-input" placeholder="Nhập tên" />
        </div>
        <div class="profile-form-row">
          <label class="profile-label">Email</label>
          <div class="profile-value">
            {{ maskedEmail }}
            <button type="button" class="profile-link">Thay Đổi</button>
          </div>
        </div>
        <div class="profile-form-row">
          <label class="profile-label">Số điện thoại</label>
          <div class="profile-value">
            {{ maskedPhone }}
            <button type="button" class="profile-link">Thay Đổi</button>
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
          <label class="profile-label">Ngày sinh</label>
          <div class="profile-value">
            <input v-model="updateForm.birthday" type="date" class="profile-input" style="max-width: 180px" />
            <button type="button" class="profile-link">Thay Đổi</button>
          </div>
        </div>
        <div class="profile-form-row">
          <button type="submit" class="profile-save-btn" :disabled="loading">
            {{ loading ? 'Đang lưu...' : 'Lưu' }}
          </button>
          <span v-if="successMessage" class="profile-success">{{ successMessage }}</span>
          <span v-if="error" class="profile-error">{{ error }}</span>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// Dummy service imports. Replace with your actual service.
import { AuthService } from '../../../service/auth/AuthService';
import type { UserResponse } from '../../../service/auth/AuthService';

const user = ref<UserResponse | null>(null);
const updateForm = ref({
  name: '',
  email: '',
  phoneNumber: '',
  gender: '',
  birthday: ''
});
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const genderOptions = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' }
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
    updateForm.value.name = user.value?.username ?? '';
    updateForm.value.email = user.value?.email ?? '';
    updateForm.value.phoneNumber = user.value?.phoneNumber ?? '';
    updateForm.value.gender = user.value?.gender ?? '';
    updateForm.value.birthday = user.value?.birthday ?? '';
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
    await AuthService.updateUserProfile(userId, updateForm.value);
    successMessage.value = 'Cập nhật thành công!';
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
.profile-layout {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  font-family: 'Roboto', Arial, Helvetica, sans-serif;
}
.profile-sidebar {
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
.profile-main {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 0;
}
.profile-form {
  background: #fff;
  width: 100%;
  max-width: 680px;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.04);
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
  color: #888;
  font-size: 15px;
  margin-bottom: 30px;
}
.profile-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 21px;
}
.profile-label {
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
  border-radius: 4px;
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
  .profile-form { padding: 20px 10px; }
  .profile-main { padding: 30px 0; }
  .profile-sidebar { padding: 30px 10px 0 10px; }
}
</style>