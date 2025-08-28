<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CustomerService } from "../../../../service/admin/CustomerServiceLegacy";
import { AddressService } from "../../../../service/admin/AddressService";
import type { CustomerResponse } from "../../../../model/admin/customer";
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import AddressDialog from '../../../../views/pages/admin/address/AddressDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();


const toast = useToast();

const route = useRoute();
const router = useRouter();

const loading = ref(true);

const customer = ref<CustomerResponse | null>(null);

const showAddressDialog = ref(false);
const dialogReady = ref(false);
const addressDialogMode = ref<'add' | 'edit'>('add');


const genderOptions = [
    { label: "Nam", value: "MALE" },
    { label: "Nữ", value: "FEMALE" },
];


const provinceOptions = provincesData.data;
const dialogAddressData = ref<any>({});
const newAddress = ref({
    receiverName: '',
    receiverPhone: '',
    street: '',
    ward: '',
    district: '',
    province: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    isDefault: false
});

// dialog thêm địa chỉ
const openAddAddressDialog = async () => {
    addressDialogMode.value = 'add';
    dialogAddressData.value = { ...newAddress.value };
    dialogReady.value = false;
    await nextTick();
    dialogReady.value = true;
    showAddressDialog.value = true;
};

const addressBeingEdited = ref<any>(null);

// chuyển địa chỉ sang ID
const convertNamesToIds = (addr: any) => {
    const province = provinceOptions.find(p => p.name === addr.province);
    const district = province?.level2s.find(d => d.name === addr.district);
    const ward = district?.level3s.find(w => w.name === addr.ward);

    return {
        ...addr,
        province: province?.level1_id || '',
        district: district?.level2_id || '',
        ward: ward?.level3_id || ''
    };
};

// dialog  sửa địa chỉ
const editAddress = async (addressId: number) => {
    const addr = customer.value?.addresses.find(a => a.id === addressId);
    if (addr) {
        addressDialogMode.value = 'edit';
        addressBeingEdited.value = { ...addr };
        dialogAddressData.value = convertNamesToIds(addr);
        dialogReady.value = false;
        await nextTick();
        dialogReady.value = true;
        showAddressDialog.value = true;
    }
};

// kiểm tra địa chỉ mặc định
const isOnlyDefaultAddress = computed(() => {
    if (!customer.value || !addressBeingEdited.value) return false;
    const defaultAddresses = customer.value.addresses.filter(a => a.isDefault);
    return (
        defaultAddresses.length === 1 &&
        defaultAddresses[0].id === addressBeingEdited.value.id
    );
});

onMounted(async () => {
    let id = route.params.id;
    if (Array.isArray(id)) id = id[0];
    if (id) {
        loading.value = true;
        const res = await CustomerService.getCustomerById(Number(id));
        if (res.data) customer.value = res.data;
        loading.value = false;
    }
});

//sắp xếp địa chỉ mặc định lên trước
const sortedAddresses = computed(() => {
    return customer.value?.addresses
        ? [...customer.value.addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
        : [];
});


// Biến lưu lỗi
const errors = ref<{ [key: string]: string }>({});

// Regex kiểm tra email, phone
function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|vn|co\.uk|io|info)$/.test(email);
}
function validatePhone(phone: string) {
    return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}

watch(() => customer.value?.email, (newEmail) => {
    if (newEmail === undefined) return;
    if (!validateEmail(newEmail)) {
        errors.value.email = "Email không hợp lệ";
    } else {
        delete errors.value.email;
    }
});
watch(() => customer?.value?.username, (username) => {
    if (username === undefined) return;
    if (username.length > 100) {
        errors.value.username = "Tên khách hàng quá dài (tối đa 100 ký tự)";
    } else {
        delete errors.value.username;
    }
});

watch(() => customer.value?.phoneNumber, (newPhone) => {
    if (newPhone === undefined) return;
    if (!validatePhone(newPhone)) {
        errors.value.phoneNumber = "Số điện thoại không hợp lệ";
    } else {
        delete errors.value.phoneNumber;
    }
});


// api thêm địa chỉ mới
const saveNewAddress = async (submittedData: any) => {
    errors.value = {};
    if (submittedData.receiverName.length > 100) {
        errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
    }
    if (submittedData.street.length > 100) {
        errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
    }

    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
        return;
    }
    if (!customer.value) return;

    if (!submittedData.receiverName || !submittedData.receiverPhone || !submittedData.street) {
        toast.add({
            severity: 'warn',
            summary: 'Thiếu thông tin',
            detail: 'Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.',
            life: 3000
        });
        return;
    }

    if (!validatePhone(submittedData.receiverPhone)) {
        toast.add({
            severity: 'warn',
            summary: 'Số điện thoại không hợp lệ',
            detail: 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam.',
            life: 3000
        });
        return;
    }

    const provinceName = provinceOptions.find(p => p.level1_id === submittedData.province)?.name || '';
    const districtName = provinceOptions.find(p => p.level1_id === submittedData.province)?.level2s?.find(d => d.level2_id === submittedData.district)?.name || '';
    const wardName = provinceOptions.find(p => p.level1_id === submittedData.province)?.level2s?.find(d => d.level2_id === submittedData.district)?.level3s?.find(w => w.level3_id === submittedData.ward)?.name || '';

    const newAddr = {
        ...submittedData,
        ward: wardName,
        district: districtName,
        province: provinceName,
        country: "Việt Nam"
    };

    try {
        await CustomerService.addAddressForCustomer(customer.value.id, newAddr);
        const res = await CustomerService.getCustomerById(customer.value.id);
        customer.value = res.data ?? null;
        showAddressDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã thêm địa chỉ mới cho khách hàng.',
            life: 3000
        });
    } catch (error) {
        console.error("Thêm địa chỉ thất bại:", error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể thêm địa chỉ. Vui lòng thử lại.',
            life: 4000
        });
    }
};

// api cập nhật địa chỉ
const updateAddress = async (submittedData: any) => {
    errors.value = {};
    if (submittedData.receiverName.length > 100) {
        errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
    }
    if (submittedData.street.length > 100) {
        errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
    }

    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
        return;
    }
    if (!customer.value || !addressBeingEdited.value) return;

    if (!submittedData.receiverName || !submittedData.receiverPhone || !submittedData.street) {
        toast.add({
            severity: 'warn',
            summary: 'Thiếu thông tin',
            detail: 'Vui lòng điền đầy đủ thông tin địa chỉ.',
            life: 3000
        });
        return;
    }

    if (!validatePhone(submittedData.receiverPhone)) {
        toast.add({
            severity: 'warn',
            summary: 'Số điện thoại không hợp lệ',
            detail: 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam.',
            life: 3000
        });
        return;
    }

    const provinceName = provinceOptions.find(p => p.level1_id === submittedData.province)?.name || '';
    const districtName = provinceOptions.find(p => p.level1_id === submittedData.province)?.level2s?.find(d => d.level2_id === submittedData.district)?.name || '';
    const wardName = provinceOptions.find(p => p.level1_id === submittedData.province)?.level2s?.find(d => d.level2_id === submittedData.district)?.level3s?.find(w => w.level3_id === submittedData.ward)?.name || '';

    const updatedAddress = {
        ...submittedData,
        ward: wardName,
        district: districtName,
        province: provinceName,
        country: "Việt Nam"
    };

    try {
        await AddressService.updateAddressForCustomer(customer.value.id, addressBeingEdited.value.id, updatedAddress);
        const res = await CustomerService.getCustomerById(customer.value.id);
        customer.value = res.data ?? null;
        showAddressDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật địa chỉ thành công.',
            life: 3000
        });
    } catch (error) {
        console.error("Cập nhật địa chỉ thất bại:", error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể cập nhật địa chỉ. Vui lòng thử lại.',
            life: 4000
        });
    }
};


//  dialog địa chỉ submit
const handleAddressSubmit = (formData: any) => {
    if (addressDialogMode.value === 'add') {
        saveNewAddress(formData);
    } else {
        updateAddress(formData);
    }
};


// api  cập nhật khách hàng
const handleSubmit = async () => {
    if (!customer.value) return;

    // Reset lỗi cũ
    errors.value = {};

    // Validate từng trường
    if (!customer.value.username || customer.value.username.trim().length < 2) {
        errors.value.username = "Tên khách hàng phải có ít nhất 2 ký tự.";
    }
    if (customer.value.username.trim().length > 100) {
        errors.value.username = "Tên khách hàng quá dài (tối đa 100 ký tự)";
    }
    if (!validateEmail(customer.value.email)) {
        errors.value.email = "Email không hợp lệ.";
    }

    if (!validatePhone(customer.value.phoneNumber)) {
        errors.value.phoneNumber = "Số điện thoại không hợp lệ.";
    }
    // Nếu có lỗi thì không submit
    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
        return;
    }

    // // Kiểm tra địa chỉ mặc định
    // const defaultAddress = customer.value.addresses.find(a => a.isDefault);
    // if (!defaultAddress) {
    //     toast.add({
    //         severity: 'warn',
    //         summary: 'Thiếu địa chỉ mặc định',
    //         detail: 'Khách hàng cần ít nhất một địa chỉ mặc định để cập nhật.',
    //         life: 3000
    //     });
    //     return;
    // }

    const requestBody = {
        id: customer.value.id,
        email: customer.value.email,
        username: customer.value.username,
        phoneNumber: customer.value.phoneNumber,
        gender: customer.value.gender,
        role: customer.value.role,
        active: customer.value.active
    };

    try {
        await CustomerService.updateCustomer(customer.value.id, requestBody);
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã cập nhật thông tin khách hàng "${customer.value.username}"`,
            life: 3000
        });
    } catch (err: any) {
        console.error("Lỗi khi cập nhật khách hàng:", err);
        const resp = err?.response?.data;

        if (resp && typeof resp === "object") {
            // Gán thông báo từ resp.message (nếu có)
            const msg = resp.message || "";

            // Gán lỗi chi tiết từ resp.data.name (nếu có)
            if (resp.data && typeof resp.data === "object" && resp.data.name) {
                const detailMsg = resp.data.name;

                if (detailMsg.toLowerCase().includes("email")) {
                    errors.value.email = detailMsg;
                } else if (detailMsg.toLowerCase().includes("điện thoại") || detailMsg.toLowerCase().includes("phone")) {
                    errors.value.phoneNumber = detailMsg;
                } else {
                    errors.value.global = detailMsg;
                }
            } else if (msg) {
                errors.value.global = msg;
            }

            toast.add({
                severity: 'error',
                summary: 'Lỗi cập nhật',
                detail: msg || 'Cập nhật khách hàng thất bại. Vui lòng thử lại.',
                life: 4000
            });
        }
    };
};

// api xoá địa chỉ (xoá mềm)
const handleDeleteAddress = (addressData: any) => {
    if (!customer.value || !addressData || !addressData.id) return;
    if (addressData.isDefault && customer.value?.addresses.filter(a => a.isDefault).length === 1) {
        toast.add({
            severity: 'warn',
            summary: 'Không thể xoá',
            detail: 'Không thể xoá địa chỉ mặc định duy nhất. Hãy đặt địa chỉ khác làm mặc định trước.',
            life: 4000
        });
        return;
    }

    confirm.require({
        message: 'Bạn có chắc chắn muốn xoá địa chỉ này?',
        header: 'Xác nhận xoá',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Xoá',
        rejectLabel: 'Huỷ',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                const customerId = customer.value!.id;
                await AddressService.deleteAddress(customerId, addressData.id);
                const res = await CustomerService.getCustomerById(customerId);
                customer.value = res.data ?? null;
                showAddressDialog.value = false;

                toast.add({
                    severity: 'success',
                    summary: 'Đã xoá',
                    detail: 'Địa chỉ đã được xoá thành công.',
                    life: 3000
                });
            } catch (error) {
                console.error("Xoá địa chỉ thất bại:", error);
                toast.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể xoá địa chỉ. Vui lòng thử lại.',
                    life: 4000
                });
            }
        }
    });
};

const handleCancel = () => {
    router.back();
};
</script>



<template>
    <div v-if="loading || !customer">Đang tải dữ liệu...</div>
    <div v-else class="customer-add-page" style="max-width: 1300px;">
        <div class="form-title">Cập Nhật Khách Hàng</div>
        <form class="customer-form" @submit.prevent="handleSubmit">
            <div class="form-row">
                <div class="form-group">
                    <label for="name">Tên Khách Hàng</label>
                    <input id="name" v-model="customer.username" type="text" 
                        :class="{ 'border-red-500': errors.username }" />
                    <small v-if="errors.username" class="error-text">{{ errors.username }}</small>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" v-model="customer.email" type="email"  :class="{ 'border-red-500': errors.email }" />
                    <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
                </div>

            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="phone">Số Điện Thoại</label>
                    <input id="phone" v-model="customer.phoneNumber" type="text"  :class="{ 'border-red-500': errors.phoneNumber }"/>
                    <small v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</small>
                </div>
                <div class="form-group">
                    <label for="gender">Giới Tính</label>
                    <select id="gender" v-model="customer.gender" >
                        <option v-for="g in genderOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                </div>
            </div>

            <div class="form-title">Danh Sách Địa Chỉ</div>

            <div class="address-actions-bar">
                <button class="btn btn-add" type="button" @click="openAddAddressDialog">
                    ➕ Thêm địa chỉ mới
                </button>
            </div>
            <!-- Dialog chỉ render khi sẵn sàng -->
            <AddressDialog v-if="dialogReady" v-model:visible="showAddressDialog" :mode="addressDialogMode"
                :data="dialogAddressData" :isOnlyDefault="isOnlyDefaultAddress" @submit="handleAddressSubmit"
                @delete="handleDeleteAddress" />

            <div v-if="sortedAddresses.length > 0" class="address-list">
                <div v-for="addr in sortedAddresses" :key="addr.id" class="address-card">
                    <div class="address-info">
                        <div>
                            <strong>{{ addr.receiverName }}</strong> - {{ addr.receiverPhone }}
                        </div>
                        <div>
                            {{ [addr.street, addr.ward, addr.district, addr.province, addr.city, addr.state,
                            addr.country, addr.zipcode].filter(Boolean).join(", ") }}
                        </div>
                        <div v-if="addr.isDefault" class="badge-default">
                            <i class="pi pi-star-fill" style="margin-right: 4px;"></i> Mặc định
                        </div>

                    </div>
                    <div class="address-actions">
                        <button class="btn btn-edit" type="button" @click="editAddress(addr.id)">
                            ✎ Sửa
                        </button>

                    </div>
                </div>
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

.address-actions-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
}

.btn-add {
    background-color: #10b981;
    color: #fff;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-add:hover {
    background-color: #059669;
}

.address-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.address-card {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
}

.address-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.badge-default {
    background: #6366f1;
    color: white;
    padding: 2px 8px;
    font-size: 0.85rem;
    border-radius: 4px;
    display: inline-block;
    width: fit-content;
    margin-top: 4px;
}

.address-actions {
    display: flex;
    align-items: center;
}

.btn-edit {
    background: #facc15;
    border: none;
    border-radius: 5px;
    padding: 6px 12px;
    font-weight: 500;
    cursor: pointer;
    color: #000;
}

.btn-edit:hover {
    background: #eab308;
}

.error-text {
    color: #dc2626;
    font-size: 0.9rem;
    margin-top: 4px;
}
</style>