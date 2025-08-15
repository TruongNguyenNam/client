<template>
    <div class="change-password-container">
        <!-- Header -->
        <div class="change-password-header">
            <h1>Đổi Mật Khẩu</h1>
            Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
        </div>
        <!-- Form body -->
        <div class="change-password-body">
            <div class="form-group">
                <label>Mật khẩu hiện tại</label>
                <Password v-model="form.currentPassword" :feedback="false" toggleMask class="form-input"
                    placeholder="Nhập mật khẩu hiện tại" />
            </div>
            <div class="form-group">
                <label></label>
                <small v-if="errors.currentPassword" class="error-text">{{ errors.currentPassword }}</small>
            </div>
            <div class="form-group">
                <label>Mật khẩu mới</label>
                <Password v-model="form.newPassword" :feedback="true" toggleMask class="form-input"
                    placeholder="Ít nhất 5 ký tự" />
            </div>
            <div v-if="form.newPassword && form.newPassword == form.currentPassword" class="error-message">
                Mật khẩu mới giống mật khẩu cũ.
            </div>
            <div class="form-group">
                <label></label>
                <small v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</small>
            </div>
            <!-- Nhập lại mật khẩu mới -->
            <div class="form-group">
                <label>Xác nhận mật khẩu</label>
                <Password v-model="form.confirmPassword" :feedback="false" toggleMask class="form-input"
                    placeholder="Nhập lại mật khẩu mới" />
            </div>
            <div class="form-group">
                <label></label>
                <small v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</small>
            </div>
            <!-- Thông báo lỗi xác nhận -->
            <div v-if="form.confirmPassword && form.confirmPassword !== form.newPassword" class="error-message">
                Mật khẩu xác nhận không khớp.
            </div>

            <!-- Nút lưu -->
            <div class="form-actions">
                <Button label="Lưu" icon="pi pi-check" class="submit-btn" @click="handleSubmit"
                    :disabled="loading || form.confirmPassword == '' || form.currentPassword == '' || form.newPassword == ''" />
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { AuthService } from '../../../service/auth/AuthService';

const userId = ref<number | null>(null);

// Lấy user từ sessionStorage
onMounted(async () => {
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
// Dữ liệu form
const form = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

const toast = useToast();
const loading = ref(false);
// Biến lưu lỗi
const errors = ref<{ [key: string]: string }>({});

watch(() => [form.value.newPassword, form.value.confirmPassword], ([newPassword, confirmPassword]) => {
    if (newPassword.length > 25) {
        errors.value.newPassword = "Mật khẩu mới quá dài(tối đa 25 ký tự)";
    } else {
        delete errors.value.newPassword;
    }
    if (confirmPassword.length > 25) {
        errors.value.confirmPassword = "Mật khẩu mới quá dài(tối đa 25 ký tự)";
    } else {
        delete errors.value.confirmPassword;
    }

});
// Hàm xử lý submit
const handleSubmit = async () => {
    if (form.value.newPassword.length > 25) {
        errors.value.newPassword = "Mật khẩu mới quá dài(tối đa 25 ký tự)";
        return;
    }
    if (form.value.confirmPassword.length > 25) {
        errors.value.confirmPassword = "Mật khẩu mới quá dài(tối đa 25 ký tự)";
        return;
    }

    if (!form.value.currentPassword || !form.value.newPassword || !form.value.confirmPassword) {
        toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập đầy đủ', life: 3000 });
        return;
    }

    if (form.value.newPassword.length < 5) {
        toast.add({ severity: 'warn', summary: 'Mật khẩu yếu', detail: 'Mật khẩu mới phải ít nhất 6 ký tự', life: 3000 });
        return;
    }

    if (form.value.newPassword !== form.value.confirmPassword) {
        toast.add({ severity: 'error', summary: 'Sai mật khẩu', detail: 'Xác nhận không khớp', life: 3000 });
        return;
    }
  if (form.value.newPassword == form.value.currentPassword) {
        toast.add({ severity: 'error', summary: 'Trùng mật khẩu', detail: 'Mật khẩu mới giống mật khẩu cũ', life: 3000 });
        return;
    }
    loading.value = true;

    try {
        if (!userId.value) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy thông tin người dùng', life: 3000 });
            return;
        }

        await AuthService.changePassword(userId.value, form.value);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Mật khẩu đã được thay đổi', life: 3000 });
        errors.value = {};
        // Reset lại form sau khi đổi mật khẩu thành công
        form.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
    } catch (err: any) {
        console.error("Lỗi khi đổi mật khẩu:", err);
        const resp = err?.response?.data;

        if (resp && typeof resp === "object") {
            const msg = resp.message || "";

            if (resp.data && typeof resp.data === "object") {
                const detailMsg = resp.data.name || '';

                if (detailMsg.toLowerCase().includes("không đúng")) {
                    errors.value.currentPassword = detailMsg;
                }
                else {
                    errors.value.global = detailMsg;
                }
            } else if (msg) {
                errors.value.global = msg;
            }
            toast.add({ severity: 'error', summary: 'Thất bại', detail: 'Không thể đổi mật khẩu', life: 3000 });
            // Nếu lỗi, không submit
            return;
        }
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
    padding: 20px;
}

.change-password-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.change-password-body {
    padding-left: 100px;
    padding-right: 100px;
    padding-top: 20px;
}

.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
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

:deep(.p-password input) {
    border-radius: 0px !important;
    /* Xoá bo góc */
    border: none;
    /* Đặt viền màu đỏ */
    width: 100%;

}

.error-message {
    color: red;
    font-size: 13px;
    margin-left: 180px;
    margin-bottom: 10px;
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
