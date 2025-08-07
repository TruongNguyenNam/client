<template>
    <div class="change-password-container">
        <!-- Header -->
        <div class="change-password-header">
            <h1>Thay đổi địa chỉ email</h1>
        </div>

        <!-- Form body -->
        <div class="change-password-body">
            <div class="form-group">
                <label>Địa chỉ email mới</label>
                <input v-model="form.email" class="form-input" placeholder="Nhập địa chỉ email" />
            </div>

            <div class="form-group">
                <label></label>
                <small v-if="emailError" class="error-text">{{ emailError }}</small>
            </div>

            <!-- Nút lưu -->
            <div class="form-actions">
                <Button label="Lưu" icon="pi pi-check" class="submit-btn" @click="handleSubmit"
                    :disabled="loading || form.email.trim() === ''" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { AuthService } from '../../../service/auth/AuthService';

const toast = useToast();
const loading = ref(false);
const emailError = ref('');
const userId = ref<number | null>(null);

// Khởi tạo form
const form = ref({
    email: '',
    phoneNumber: '',
    gender: '',
});

// Load thông tin người dùng từ sessionStorage
onMounted(() => {
    const raw = sessionStorage.getItem('userInfo');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            userId.value = parsed?.userId || null;
        } catch (error) {
            console.error('Lỗi khi parse userInfo:', error);
        }
    }
});

// Regex kiểm tra định dạng email
const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Hàm xử lý lưu
const handleSubmit = async () => {
    const email = form.value.email.trim();
    emailError.value = '';

    if (!email) {
        emailError.value = 'Vui lòng nhập địa chỉ email';
        return;
    }

    if (!isValidEmail(email)) {
        emailError.value = 'Địa chỉ email không hợp lệ';
        return;
    }

    if (!userId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy người dùng', life: 3000 });
        return;
    }

    loading.value = true;

    try {

        await AuthService.updateUserInfo(userId.value, form.value);

        // Cập nhật lại sessionStorage
        const current = sessionStorage.getItem('userInfo');
        if (current) {
            const updated = { ...JSON.parse(current), email: form.value.email };
            sessionStorage.setItem('userInfo', JSON.stringify(updated));
        }
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Email đã được cập nhật',
            life: 3000
        });

        // Reset form
        form.value.email = '';
        emailError.value = '';
    } catch (err: any) {
        console.error("Lỗi khi cập nhật email:", err);
        // ✅ Gán lỗi từ backend nếu có
        const msg = err?.response?.data?.message || err?.message || 'Không thể cập nhật email';
        // ✅ Hiển thị cả toast và error text
        toast.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: msg,
            life: 3000
        });

        emailError.value = msg;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.change-password-container {
    width: 100%;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;
}

.change-password-header {
    border-bottom: 1px solid #eee;
    margin: 0 25px 20px 25px;
    padding: 20px 30px;
}

.change-password-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.change-password-body {
    padding-left: 10px;
    padding-right: 100px;
    padding-top: 20px;
}

.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.form-group label {
    text-align: right;
    margin-right: 25px;
    width: 180px;
    font-size: 14px;
    color: #555;
    font-weight: 500;
}

.form-input {
    width: 55%;
    border: 1px solid #ccc;
    font-size: 14px;
    padding: 8px;
    background-color: white;
    border-radius: 2px;
}

.form-actions {
    margin-left: 205px;
    margin-top: 25px;
}

.submit-btn {
    background-color: #bc3e25;
    border: none;
    color: white;
    padding: 8px 20px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 1px;
    cursor: pointer;
    width: 90px;
    height: 35px;
}

.submit-btn:hover {
    background-color: #d04527;
}

.error-text {
    color: #dc2626;
    font-size: 0.9rem;
}
</style>
