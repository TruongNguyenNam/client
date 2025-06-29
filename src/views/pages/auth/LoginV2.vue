<!-- Login lưu localStorage -->

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import AppConfig from '@/layout/AppConfig.vue';
import { AuthService } from '../../../service/auth/AuthService';

const { layoutConfig } = useLayout();
const router = useRouter();
const toast = useToast();

const username = ref('');
const password = ref('');
const checked = ref(false);
const isLoading = ref(false);

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng nhập tên đăng nhập và mật khẩu',
      life: 3000
    });
    return;
  }

  isLoading.value = true;
  try {
    const loginForm = { username: username.value, password: password.value };
    const response = await AuthService.Login(loginForm);
    console.log('Login response:', response);

    if (response.status === 200 && response.data) {
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data.id.toString());
      const userInfo = {
        userId : response.data.id,
        username: response.data.username,
        phoneNumber: response.data.phoneNumber,
        email: response.data.email,
        role: response.data.role,
        gender: response.data.gender,
        isActive: response.data.isActive,
        address: response.data.address,
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đăng nhập thành công!',
        life: 3000
      });

      // Redirect based on role
      if (response.data.role === 'ADMIN') {
        router.push('/category');
      } else if (response.data.role === 'CUSTOMER') {
        router.push('/client');
      } else {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Vai trò không hợp lệ',
          life: 3000
        });
      }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: response.message || 'Đăng nhập thất bại',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail:
        error?.response?.data?.message ||
        error?.message ||
        'Đã xảy ra lỗi khi đăng nhập',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
    <div class="flex flex-column align-items-center justify-content-center">
      <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
            <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
            <div class="text-900 text-3xl font-medium mb-3">Chào mừng bạn!</div>
            <span class="text-600 font-medium">Đăng nhập để tiếp tục</span>
          </div>

          <div>
            <label for="username1" class="block text-900 text-xl font-medium mb-2">Tên đăng nhập</label>
            <InputText
              id="username1"
              type="text"
              placeholder="Tên đăng nhập"
              class="w-full md:w-30rem mb-5"
              style="padding: 1rem"
              v-model="username"
            />

            <label for="password1" class="block text-900 font-medium text-xl mb-2">Mật khẩu</label>
            <Password
              id="password1"
              v-model="password"
              placeholder="Mật khẩu"
              :toggleMask="true"
              class="w-full mb-3"
              inputClass="w-full"
              :inputStyle="{ padding: '1rem' }"
            ></Password>

            <div class="flex align-items-center justify-content-between mb-5 gap-5">
              <div class="flex align-items-center">
                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                <label for="rememberme1">Ghi nhớ tôi</label>
              </div>
              <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)"
                >Quên mật khẩu?</a
              >
            </div>
            <Button
              label="Đăng nhập"
              class="w-full p-3 text-xl"
              :loading="isLoading"
              @click="handleLogin"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AppConfig simple />
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>