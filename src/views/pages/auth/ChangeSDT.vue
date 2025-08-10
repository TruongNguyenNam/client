<template>
    <div class="change-password-container">
        <!-- Header -->
        <div class="change-password-header">
            <h1>{{ mode === 'add' ? 'Thêm số điện thoại' : 'Đổi số điện thoại' }}</h1>
        </div>

        <!-- Form body -->
        <div class="change-password-body">
            <div class="form-group">
                <label>Số điện thoại</label>
                <input v-model="form.phoneNumber" class="form-input" placeholder="Nhập số điện thoại" />
            </div>

            <!-- Hiển thị lỗi -->
            <small v-if="phoneError" class="error-text">{{ phoneError }}</small>

            <!-- Nút lưu -->
            <div class="form-actions">
                <Button :label="mode === 'add' ? 'Thêm' : 'Lưu'" icon="pi pi-check" class="submit-btn"
                    @click="handleSubmit" :disabled="loading || form.phoneNumber.trim() === ''" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { AuthService } from '../../../service/auth/AuthService';

const toast = useToast();
const loading = ref(false);


import { useRoute } from 'vue-router';

const route = useRoute();
const mode = ref<'add' | 'edit'>('edit');

onMounted(() => {
    const queryMode = route.query.mode;
    if (queryMode === 'add') {
        mode.value = 'add';
    }
});



// Lấy thông tin userId từ session
const userId = ref<number | null>(null);
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

// Dữ liệu form
const form = ref({
    email: '',
    phoneNumber: '',
    gender: '',
});

// Lỗi số điện thoại
const phoneError = ref('');

// Regex kiểm tra số điện thoại Việt Nam
const isValidPhoneNumber = (phone: string): boolean => {
    return /^0\d{9}$/.test(phone);
};
// Theo dõi sdt
watch(() => form.value.phoneNumber, (sdt) => {
    if (sdt.trim() === '') {
        phoneError.value = '';
        return;
    }
    if (!isValidPhoneNumber(sdt)) {
        phoneError.value = "Số điện thoại không hợp lệ";
    } else {
        phoneError.value = "";
    }
});

function validatePhone(): boolean {
    const phone = form.value.phoneNumber.trim();
    if (!phone) {
        phoneError.value = 'Vui lòng nhập số điện thoại';
        return false;
    }
    if (!isValidPhoneNumber(phone)) {
        phoneError.value = 'Số điện thoại không hợp lệ. Phải có 10 chữ số và bắt đầu bằng số 0';
        return false;
    }
    phoneError.value = '';
    return true;
}


// Hàm xử lý lưu
const handleSubmit = async () => {

    phoneError.value = '';

    if (!validatePhone()) {
        return;
    }

    if (!userId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy thông tin người dùng', life: 3000 });
        return;
    }

    loading.value = true;

    try {
        await AuthService.updateUserInfo(userId.value, form.value); // Gọi API cập nhật SĐT
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Số điện thoại đã được cập nhật', life: 3000 });
        form.value.phoneNumber = '';
        phoneError.value = "";
    } catch (err: any) {
        console.error("Lỗi khi đổi số điện thoại:", err);

        const msg = err?.response?.data?.message || err?.message || 'Không thể cập nhật số điện thoại';

        toast.add({ severity: 'error', summary: 'Thất bại', detail: msg, life: 3000 });
        phoneError.value = msg; // ✅ THÊM DÒNG NÀY
    }
    finally {
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

.error-text {
    color: #dc2626;
    font-size: 13px;
    margin-left: 205px;
    margin-top: -15px;
    margin-bottom: 15px;
    display: block;
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
    height: 35px;
}

.submit-btn:hover {
    background-color: #d04527;
}
</style>
