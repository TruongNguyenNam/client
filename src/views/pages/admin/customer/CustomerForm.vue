<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import { CustomerService } from "../../../../service/admin/CustomerServiceLegacy";
import type { Gender } from "../../../../model/admin/customer";
import { useToast } from 'primevue/usetoast';
const router = useRouter();

const toast = useToast();

const customer = ref({
    username: "",
    email: "",
    phoneNumber: "",
    gender: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    receiverName: "",
    receiverPhone: ""
});


const genderOptions = [
    { label: "Nam", value: "MALE" },
    { label: "Nữ", value: "FEMALE" }
];

const provinceOptions = provincesData.data;
const districtOptions = computed(() =>
    provinceOptions.find(p => p.level1_id === customer.value.province)?.level2s || []
);
const wardOptions = computed(() =>
    districtOptions.value.find(d => d.level2_id === customer.value.district)?.level3s || []
);

// Địa chỉ đầy đủ để hiển thị
const fullAddress = computed(() =>
    [
        customer.value.street,
        wardOptions.value.find(w => w.level3_id === customer.value.ward)?.name,
        districtOptions.value.find(d => d.level2_id === customer.value.district)?.name,
        provinceOptions.find(p => p.level1_id === customer.value.province)?.name
    ].filter(Boolean).join(', ')
);


// Biến lưu lỗi 
const errors = ref<{ [key: string]: string }>({});
// Regex kiểm tra email, phone
function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|vn|co\.uk|io|info)$/.test(email);
}
function validatePhone(phone: string) {
    return /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
}

// Theo dõi email
watch(() => customer.value.email, (newEmail) => {
    if (!validateEmail(newEmail)) {
        errors.value.email = "Email không hợp lệ";
    } else {
        delete errors.value.email;
    }
});

// Theo dõi số điện thoại
watch(() => customer.value.phoneNumber, (newPhone) => {
    if (!validatePhone(newPhone)) {
        errors.value.phoneNumber = "Số điện thoại không hợp lệ";
    } else {
        delete errors.value.phoneNumber;
    }
});

// Watcher cho street
watch(() => customer.value.street, (street) => {
    if (street.length > 100) {
        errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
    } else {
        delete errors.value.street;
    }
});

// Watcher cho receiverName
watch(() => customer.value.receiverName, (receiverName) => {
    if (receiverName.length > 100) {
        errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
    } else {
        delete errors.value.receiverName;
    }
});

// Watcher cho username
watch(() => customer.value.username, (username) => {
    if (username.length > 100) {
        errors.value.username = "Tên khách hàng quá dài (tối đa 100 ký tự)";
    } else {
        delete errors.value.username;
    }
});
watch(() => customer.value.receiverPhone, (newPhone) => {
    if (!validatePhone(newPhone)) {
        errors.value.receiverPhone = "SĐT người nhận không hợp lệ";
    } else {
        delete errors.value.receiverPhone;
    }
});
// Khi thay đổi tỉnh/thành, quận/huyện, phường/xã thì reset các trường con
watch(() => customer.value.province, () => {
    customer.value.district = "";
    customer.value.ward = "";
});

watch(() => customer.value.district, () => {
    customer.value.ward = "";
});



const handleSubmit = async () => {
    errors.value = {};
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;

    if (!customer.value.username.trim()) {
        errors.value.username = "Tên khách hàng không được để trống";
    } else if (!usernameRegex.test(customer.value.username)) {
        errors.value.username = "Tên khách hàng không được chứa ký tự đặc biệt";
    }
    if (customer.value.username.length > 100) {
        errors.value.username = "Tên khách hàng quá dài (tối đa 100 ký tự)";
    }
    if (!customer.value.receiverName.trim()) {
        errors.value.receiverName = "Tên người nhận không được để trống";
    }
    if (customer.value.receiverName.length > 100) {
        errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
    }
    if (!customer.value.street.trim()) {
        errors.value.street = "Địa chỉ chi tiết không được để trống";
    }
    if (customer.value.street.length > 100) {
        errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
    }
    if (!validateEmail(customer.value.email)) {
        errors.value.email = "Email không hợp lệ";
    }
    if (!customer.value.receiverPhone.trim()) {
        errors.value.receiverPhone = "Số điện thoại người nhận được để trống";
    }
    if (!validatePhone(customer.value.phoneNumber)) {
        errors.value.phoneNumber = "Số điện thoại không hợp lệ";
    }
    if (!customer.value.gender) {
        errors.value.gender = "Vui lòng chọn giới tính";
    }
    if (!customer.value.province) {
        errors.value.province = "Vui lòng chọn tỉnh/thành";
    }
    if (!customer.value.district) {
        errors.value.district = "Vui lòng chọn quận/huyện";
    }
    if (!customer.value.ward) {
        errors.value.ward = "Vui lòng chọn phường/xã";
    }

    if (customer.value.receiverPhone && !validatePhone(customer.value.receiverPhone)) {
        errors.value.receiverPhone = "Số điện thoại người nhận không hợp lệ";
    }
    // Nếu lỗi, không submit
    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
        return;
    }
    const address = {
        street: customer.value.street,
        ward: wardOptions.value.find(w => w.level3_id === customer.value.ward)?.name || "",
        district: districtOptions.value.find(d => d.level2_id === customer.value.district)?.name || "",
        province: provinceOptions.find(p => p.level1_id === customer.value.province)?.name || "",
        city: "",
        state: "",
        country: "Việt Nam",
        zipcode: "",
        isDefault: true,
        receiverName: customer.value.receiverName || customer.value.username,
        receiverPhone: customer.value.receiverPhone || customer.value.phoneNumber
    };
    try {
        await CustomerService.createCustomer({
            username: customer.value.username,
            email: customer.value.email,
            phoneNumber: customer.value.phoneNumber,
            gender: customer.value.gender as Gender,
            role: "CUSTOMER",                 // <-- thêm role mặc định
            active: true,                   // <-- luôn active mặc định khi tạo mới
            address
        });
        router.push("/customers");
    } catch (err: any) {
        const resp = err?.response?.data;
        if (resp && typeof resp.data === "object" && resp.data !== null) {
            Object.keys(resp.data).forEach((field) => {
                if (field === "name") {
                    const msg = resp.data[field];
                    if (msg.toLowerCase().includes("email")) errors.value.email = msg;
                    else if (
                        msg.toLowerCase().includes("điện thoại") ||
                        msg.toLowerCase().includes("phone")
                    ) errors.value.phoneNumber = msg;
                    else errors.value.global = msg;
                } else {
                    errors.value[field] = resp.data[field];
                }
            });
        } else if (resp && resp.message) {
            errors.value.global = resp.message;
        } else {
            errors.value.global = "Đã có lỗi xảy ra";
        }
    }
    console.log('errors.value:', errors.value);
};

const handleCancel = () => {
    router.back();
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="customer-add-page" style="max-width: 1300px;">
                <div class="form-title">Thêm Khách Hàng</div>
                <form class="customer-form" @submit.prevent="handleSubmit">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="username">Tên Khách Hàng</label>
                            <input id="username" v-model="customer.username" type="text"
                                placeholder="Nhập tên khách hàng" :class="{ 'border-red-500': errors.username }" />
                            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input id="email" v-model="customer.email" type="email" placeholder="Nhập địa chỉ email"
                                :class="{ 'border-red-500': errors.email }" />
                            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="phoneNumber">Số Điện Thoại</label>
                            <input id="phoneNumber" v-model="customer.phoneNumber" type="text"
                                placeholder="Nhập số điện thoại" :class="{ 'border-red-500': errors.phoneNumber }" />
                            <div v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</div>
                        </div>
                        <div class="form-group">
                            <label for="gender">Giới Tính</label>
                            <select id="gender" v-model="customer.gender">
                                <option value="" disabled>Chọn giới tính</option>
                                <option v-for="g in genderOptions" :value="g.value" :key="g.value">{{ g.label }}
                                </option>
                            </select>
                            <div v-if="errors.gender" class="error-message">{{ errors.gender }}</div>
                        </div>
                    </div>
                    <div class="form-title-1">Địa Chỉ</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="receiverName">Tên người nhận</label>
                            <input id="receiverName" v-model="customer.receiverName" type="text"
                                placeholder="Nhập tên người nhận" :class="{ 'border-red-500': errors.receiverName }" />
                            <div v-if="errors.receiverName" class="error-message">{{ errors.receiverName }}</div>
                        </div>
                        <div class="form-group">
                            <label for="receiverPhone">SĐT người nhận</label>
                            <input id="receiverPhone" v-model="customer.receiverPhone" type="text"
                                placeholder="Nhập số điện thoại người nhận"
                                :class="{ 'border-red-500': errors.receiverPhone }" />
                            <div v-if="errors.receiverPhone" class="error-message">{{ errors.receiverPhone }}</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="province">Tỉnh/Thành phố</label>
                            <select id="province" v-model="customer.province">
                                <option value="">Chọn tỉnh/thành</option>
                                <option v-for="p in provinceOptions" :key="p.level1_id" :value="p.level1_id">{{ p.name
                                    }}
                                </option>
                            </select>
                            <div v-if="errors.province" class="error-message">{{ errors.province }}</div>
                        </div>
                        <div class="form-group">
                            <label for="district">Quận/Huyện</label>
                            <select id="district" v-model="customer.district" :disabled="!customer.province">
                                <option value="">Chọn quận/huyện</option>
                                <option v-for="d in districtOptions" :key="d.level2_id" :value="d.level2_id">{{ d.name
                                    }}
                                </option>
                            </select>
                            <div v-if="errors.district" class="error-message">{{ errors.district }}</div>
                        </div>
                        <div class="form-group">
                            <label for="ward">Phường/Xã</label>
                            <select id="ward" v-model="customer.ward" :disabled="!customer.district">
                                <option value="">Chọn phường/xã</option>
                                <option v-for="w in wardOptions" :key="w.level3_id" :value="w.level3_id">{{ w.name }}
                                </option>
                            </select>
                            <div v-if="errors.ward" class="error-message">{{ errors.ward }}</div>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label for="street">Địa chỉ chi tiết (số nhà, ngõ...)</label>
                        <input id="street" v-model="customer.street" type="text" placeholder="Nhập chi tiết địa chỉ"
                            :class="{ 'border-red-500': errors.street }" />
                        <div v-if="errors.street" class="error-message">{{ errors.street }}</div>
                    </div>
                    <div class="form-group full-width">
                        <label>Địa chỉ đầy đủ</label>
                        <input :value="fullAddress" type="text" readonly placeholder="" />
                    </div>
                    <div v-if="errors.global" class="error-message">{{ errors.global }}</div>
                    <div class="form-actions">
                        <button class="btn btn-cancel" type="button" @click="handleCancel">
                            <span class="icon">✖</span>
                            <span>Huỷ</span>
                        </button>
                        <button class="btn btn-submit" type="submit">
                            <span class="icon">✔</span>
                            <span>Thêm Khách Hàng</span>
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </div>

</template>
<style scoped>
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

.form-title-1 {
    font-size: 20px;
    font-weight: 500;
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

.error-message {
    color: #e11d48;
    font-size: 0.96rem;
    margin-top: 5px;
    margin-bottom: 2px;
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