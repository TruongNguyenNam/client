<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CustomerService } from "../../../../service/admin/CustomerServiceLegacy";
import type { CustomerResponse } from "../../../../model/admin/customer";
import provincesData from '../../../../assets/data/vietnam_provinces.json';

const route = useRoute();
const router = useRouter();

const loading = ref(true);

const customer = ref<CustomerResponse | null>(null);

const genderOptions = [
    { label: "Nam", value: "MALE" },
    { label: "Nữ", value: "FEMALE" },
];

const provinceOptions = provincesData.data;
const districtOptions = ref<any[]>([]);
const wardOptions = ref<any[]>([]);

onMounted(async () => {
    let id = route.params.id;
    if (Array.isArray(id)) id = id[0];
    if (id) {
        loading.value = true;
        const res = await CustomerService.getCustomerById(Number(id));
        if (res.data) {
            customer.value = { ...res.data };
            if (customer.value.addressProvince) {
                districtOptions.value = provinceOptions.find((p: any) => p.name === customer.value!.addressProvince)?.level2s || [];
            }
            if (customer.value.addressDistrict) {
                wardOptions.value = districtOptions.value.find((d: any) => d.name === customer.value!.addressDistrict)?.level3s || [];
            }
        }
        loading.value = false;
    }
});

// Biến lưu lỗi 
const errors = ref<{ [key: string]: string }>({});
// Regex kiểm tra email, phone
function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone: string) {
    return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}

//  truyền vào value
function onProvinceChange(value: string) {
    const province = provinceOptions.find((p: any) => p.name === value);
    districtOptions.value = province ? province.level2s : [];
    if (customer.value) {
        customer.value.addressDistrict = "";
        customer.value.addressWard = "";
    }
    wardOptions.value = [];
}

function onDistrictChange(value: string) {
    const district = districtOptions.value.find((d: any) => d.name === value);
    wardOptions.value = district ? district.level3s : [];
    if (customer.value) {
        customer.value.addressWard = "";
    }
}

const handleSubmit = async () => {
    if (!customer.value) return;
    // address đúng yêu cầu backend
    const requestBody = {
        id: customer.value.id,
        email: customer.value.email,
        username: customer.value.username,
        phoneNumber: customer.value.phoneNumber,
        role: customer.value.role,
        active: customer.value.active,
        gender: customer.value.gender,
        address: {
            street: customer.value.addressStreet,
            ward: customer.value.addressWard,
            city: customer.value.addressCity,
            state: customer.value.addressState,
            country: customer.value.addressCountry,
            zipcode: customer.value.addressZipcode,
            district: customer.value.addressDistrict,
            province: customer.value.addressProvince,
        }
    };
    await CustomerService.updateCustomer(customer.value.id, requestBody);
    router.push("/customers");
};

const handleCancel = () => {
    router.back();
};

// computed: Địa chỉ đầy đủ
const fullAddress = computed(() => {
    if (!customer.value) return "";
    const arr = [
        customer.value.addressStreet,
        customer.value.addressWard,
        customer.value.addressDistrict,
        customer.value.addressProvince,
        customer.value.addressCity,
        customer.value.addressState,
        customer.value.addressCountry,
        customer.value.addressZipcode
    ].filter(Boolean);
    return arr.join(", ");
});
</script>

<template>
    <div v-if="loading || !customer">Đang tải dữ liệu...</div>
    <div v-else class="customer-add-page">
        <div class="form-title">Cập Nhật Khách Hàng</div>
        <form class="customer-form" @submit.prevent="handleSubmit">
            <div class="form-row">
                <div class="form-group">
                    <label for="name">Tên Khách Hàng</label>
                    <input id="name" v-model="customer.username" type="text" required />
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" v-model="customer.email" type="email" required />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="phone">Số Điện Thoại</label>
                    <input id="phone" v-model="customer.phoneNumber" type="text" required />
                </div>
                <div class="form-group">
                    <label for="gender">Giới Tính</label>
                    <select id="gender" v-model="customer.gender" required>
                        <option v-for="g in genderOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="province">Tỉnh/Thành phố</label>
                    <select id="province" v-model="customer.addressProvince" required
                        @change="onProvinceChange(($event.target as HTMLSelectElement).value)">
                        <option value="">Chọn tỉnh/thành</option>
                        <option v-for="p in provinceOptions" :key="p.level1_id" :value="p.name">{{ p.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="district">Quận/Huyện</label>
                    <select id="district" v-model="customer.addressDistrict" :disabled="!customer.addressProvince"
                        required @change="onDistrictChange(($event.target as HTMLSelectElement).value)">
                        <option value="">Chọn quận/huyện</option>
                        <option v-for="d in districtOptions" :key="d.level2_id" :value="d.name">{{ d.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ward">Phường/Xã</label>
                    <select id="ward" v-model="customer.addressWard" :disabled="!customer.addressDistrict" required>
                        <option value="">Chọn phường/xã</option>
                        <option v-for="w in wardOptions" :key="w.level3_id" :value="w.name">{{ w.name }}</option>
                    </select>
                </div>
            </div>
            <div class="form-group full-width">
                <label for="street">Địa chỉ chi tiết</label>
                <input id="street" v-model="customer.addressStreet" type="text" />
            </div>
            <div class="form-group full-width">
                <label for="fullAddress">Địa chỉ đầy đủ</label>
                <input id="fullAddress" :value="fullAddress" type="text" readonly
                    placeholder="Địa chỉ đầy đủ" />
            </div>
            <div class="form-actions">
                <button class="btn btn-cancel" type="button" @click="handleCancel">
                    <span class="icon">✖</span>
                    <span>Huỷ</span>
                </button>
                <button class="btn btn-submit" type="submit">
                    <span class="icon">✔</span>
                    <span>Cập nhật</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped lang="scss">
/* Giữ nguyên style như form thêm */
.customer-add-page {
    background: #fff;
    padding: 32px 40px;
    border-radius: 10px;
    max-width: 900px;
    margin: 32px auto;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 24px;
}

.customer-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-row {
    display: flex;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
}

.full-width {
    flex: 100%;
}

label {
    font-size: 1.06rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: 500;
}

input,
select,
textarea {
    padding: 12px;
    font-size: 1.04rem;
    border: 1px solid #DDD;
    border-radius: 7px;
    transition: border-color 0.2s;
    background: #fafbfc;
    outline: none;
}

input:focus,
select:focus,
textarea:focus {
    border-color: #6c63ff;
    background: #fff;
}

.form-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
}

.btn {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    padding: 10px 26px;
    cursor: pointer;
    transition: background 0.18s;
}

.btn-cancel {
    background: #475569;
    color: #fff;
}

.btn-cancel .icon {
    font-size: 1em;
}

.btn-submit {
    background: #6366f1;
    color: #fff;
}

.btn-submit .icon {
    font-size: 1em;
}

.btn-cancel:hover {
    background: #334155;
}

.btn-submit:hover {
    background: #4f46e5;
}

@media (max-width: 800px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .customer-add-page {
        padding: 18px 8px;
    }
}
</style>