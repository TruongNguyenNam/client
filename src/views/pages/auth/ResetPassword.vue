<template>
    <div
        class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 " style="border-radius: 53px;">
                    <Button icon="pi pi-sign-out"
                        class="absolute top-3 left-3 p-button-text text-xl text-primary rotate-button-icon"
                        @click="handleBack" v-tooltip.bottom="'Quay lại trang đăng nhập'" />
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Đặt lại mật khẩu</div>
                    </div>
                    <div class="flex flex-column justify-content-center">
                        <label for="username1" class="block text-900 text-xl font-medium mb-2">Vui lòng nhập email tài
                            khoản</label>
                        <InputText id="username1" type="email" placeholder="Nhập email" class="w-full md:w-30rem mb-1"
                            style="padding: 1rem" v-model="username" />
                        <label for="password1" class="mb-5">
                            Chúng tôi sẽ gửi mã xác nhận đến email của bạn để đặt lại mật khẩu.
                        </label>
                        <Button label="Tiếp theo" style="margin-left: 33%;" class="w-4 p-3 text-xl"
                            :loading="isLoading"></Button>
                    </div>
                </div>
            </div>
        </div>
        <AppConfig simple />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import AppConfig from '@/layout/AppConfig.vue';
import { AuthService } from '../../../service/auth/AuthService';
import { useAuthStore } from '../../../stores/auth';

const { layoutConfig } = useLayout();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const checked = ref(false);
const isLoading = ref(false);


const handleBack = () => {
    router.push('/auth/login');
};

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});



onMounted(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        authStore.setUser(parseInt(storedUserId), userInfo);
        authStore.fetchWishlist();
        authStore.fetchCart();
    }
});
</script>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.rotate-left-icon {
    transform: rotate(180deg);
}
::v-deep(.rotate-button-icon .p-button-icon) {
  transform: rotate(180deg);
}

</style>
