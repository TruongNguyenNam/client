<!-- Lưu Store áutore -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import AppConfig from '@/layout/AppConfig.vue';
import { AuthService } from '../../../service/auth/AuthService';

// Pinia Store (nếu có)
import { useAuthStore } from '@/stores/auth'; 

const { layoutConfig } = useLayout();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore(); 

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

    if (response.status === 200 && response.data) {
      // Lưu thông tin vào sessionStorage
      sessionStorage.setItem('accessToken', response.data.token);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      sessionStorage.setItem('userId', response.data.userId.toString());
      const userInfo = {
        userId: response.data.userId,
        username: response.data.username,
        phoneNumber: response.data.phoneNumber,
        email: response.data.email,
        role: response.data.role,
        gender: response.data.gender,
        isActive: response.data.isActive,
        address: response.data.address,
      };
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

      // Cập nhật store (nếu có)
      authStore.setUser({
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
      });

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

// Kiểm tra trạng thái đăng nhập khi mount
onMounted(() => {
  const storedUserId = sessionStorage.getItem('userId');
  if (storedUserId) {
    authStore.setUser({ userId: parseInt(storedUserId), username: JSON.parse(sessionStorage.getItem('userInfo') || '{}').username, role: JSON.parse(sessionStorage.getItem('userInfo') || '{}').role });
  }
});
</script>