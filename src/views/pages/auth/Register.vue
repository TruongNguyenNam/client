<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
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
const email = ref('');
const isLoading = ref(false);

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const handleRegister = async () => {
  if (!username.value || !password.value || !email.value) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và email',
      life: 3000
    });
    return;
  }

  isLoading.value = true;
  try {
    const registerForm = {
      username: username.value,
      password: password.value,
      email: email.value
    };
    const response = await AuthService.Register(registerForm);
    if (response.data) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đăng ký thành công! Vui lòng đăng nhập.',
        life: 3000
      });
      router.push('/auth/login');
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: response.message || 'Đăng ký thất bại',
        life: 3000
      });
    }
  } catch (error) {
    const resp = error?.response?.data;
    const detailedMsg = resp?.data?.name;

    if (
      (detailedMsg && detailedMsg.toLowerCase().includes('email')) ||
      (resp?.message && resp.message.toLowerCase().includes('email'))
    ) {
      toast.add({
        severity: 'warn',
        summary: 'Email đã được sử dụng',
        detail: detailedMsg || 'Vui lòng sử dụng email khác.',
        life: 3000
      });
      return;
    }

    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: detailedMsg || resp?.message || error.message || 'Đã xảy ra lỗi khi đăng ký',
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
      <div
        style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
             <img src="../../../assets/data/Anh/Logo-removebg-preview.png" alt="Image" width="70" height="70"  />
            <div class="text-900 text-3xl font-medium mb-3">Đăng ký tài khoản</div>
            <span class="text-600 font-medium">Tạo tài khoản để bắt đầu</span>
          </div>



          <div>
            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
            <InputText id="email1" type="email" placeholder="Email" class="w-full md:w-30rem mb-5" style="padding: 1rem"
              v-model="email" />

            <label for="username1" class="block text-900 text-xl font-medium mb-2">Tên đăng nhập</label>
            <InputText id="username1" type="text" placeholder="Tên đăng nhập" class="w-full md:w-30rem mb-5"
              style="padding: 1rem" v-model="username" />

            <label for="password1" class="block text-900 font-medium text-xl mb-2">Mật khẩu</label>
            <Password id="password1" v-model="password" placeholder="Mật khẩu" :toggleMask="true" class="w-full mb-5"
              inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

            <Button label="Đăng ký" class="w-full p-3 text-xl" :loading="isLoading" @click="handleRegister"></Button>
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
