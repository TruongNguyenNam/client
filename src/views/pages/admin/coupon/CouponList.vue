<script setup lang="ts">
import { ref, computed, onMounted, defineEmits, watch } from "vue";
import { CouponService } from "../../../../service/admin/CouponService";
import { useRouter } from "vue-router";
import type { CouponRequest } from "../../../../model/admin/coupon";
import { ar } from "date-fns/locale";
import { useToast } from 'primevue/usetoast';
import { exportToExcel, importFromExcel } from "../../../../utils/excel";
const errors = ref<{ [key: string]: string }>({});

const toast = useToast();
//Tìm kiếm theo khoảng giá trị giảm
const minDiscount = ref<number | null>(null);
const maxDiscount = ref<number | null>(null);

const selectedStatus = ref<string | null>(null);

// Các tùy chọn trạng thái
const statusOptions = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chưa bắt đầu", value: "Chưa bắt đầu" },
    { label: "Đang hoạt động", value: "Đang hoạt động" },
    { label: "Đã hết hạn", value: "Đã hết hạn" },
];


const filteredCoupons = computed(() => {
    let result = coupons.value;

    // Lọc theo trạng thái
    if (!selectedStatus.value) {
        result = result.filter(c => getCouponStatus(c).text === "Đang hoạt động");
    } else if (selectedStatus.value !== "ALL") {
        result = result.filter(c => getCouponStatus(c).text === selectedStatus.value);
    }

    // Lọc theo khoảng giảm giá
    if (minDiscount.value !== null) {
        result = result.filter(c => c.discountAmount >= minDiscount.value!);
    }
    if (maxDiscount.value !== null) {
        result = result.filter(c => c.discountAmount <= maxDiscount.value!);
    }

    return result;
});


// Interface cho object dùng trong form (kiểu Date)
interface Coupon {
    id: number | null;
    codeCoupon: string;
    couponName: string;
    usedCount?: number;
    discountAmount: number;
    expirationDate: Date | null;
    startDate: Date | null;
    couponStatus: string;
    deleted: boolean;
}

const coupons = ref<Coupon[]>([]);
const loading = ref<boolean>(true);
const totalRecords = ref<number>(0);
const searchTerm = ref<string>('');
const lazyParams = ref({
    page: 0,
    size: 5,
});

const selectedCoupons = ref<Coupon[]>([]);
const couponUpdateDialog = ref<boolean>(false);
const addCouponDialog = ref<boolean>(false);
const coupon = ref<Coupon>({
    id: null,
    codeCoupon: '',
    couponName: '',
    discountAmount: 0.0,
    expirationDate: null,
    startDate: null,
    couponStatus: '', // status mặc định backend tự sinh
    deleted: false
});

const newCoupon = ref<Coupon>({
    id: null,
    codeCoupon: '',
    couponName: '',
    discountAmount: 0.0,
    expirationDate: null,
    startDate: new Date(),
    couponStatus: '',
    deleted: false
});

const emit = defineEmits();
const router = useRouter();


// Helper chuyển Coupon -> CouponRequest (convert ngày về string)
function toCouponRequest(c: Coupon): CouponRequest {
    return {
        couponName: c.couponName,
        discountAmount: c.discountAmount,
        expirationDate: c.expirationDate ? toLocalISOString(c.expirationDate) : null,
        startDate: c.startDate ? toLocalISOString(c.startDate) : null,
    };
}

// Chuyển đổi ngày về định dạng ISO string(giờ Việt Nam)
function toLocalISOString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
}

function toCouponRequestUpdate(c: Coupon): CouponRequest & { couponStatus: string } {
    return {
        couponName: c.couponName,
        discountAmount: typeof c.discountAmount === "string"
            ? parseInt(String(c.discountAmount).replace(/[^\d]/g, ""), 10)
            : c.discountAmount,
        expirationDate: c.expirationDate ? c.expirationDate.toISOString() : null,
        startDate: c.startDate ? c.startDate.toISOString() : null,
        couponStatus: c.couponStatus || "ACTIVE"
    };
}
const loadCoupons = async (): Promise<void> => {
    loading.value = true;
    try {
        const response = await CouponService.getAllCoupons();
        coupons.value = Array.isArray(response.data)
            ? response.data.map((item: any) => ({
                id: item.id ?? null,
                codeCoupon: item.codeCoupon ?? "",
                couponName: item.couponName ?? "",
                usedCount: item.usedCount ?? 0,
                discountAmount: item.discountAmount ?? 0.0,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
                startDate: item.startDate ? new Date(item.startDate) : null,
                couponStatus: item.couponStatus ?? "",
                deleted: item.deleted ?? false
            }))
            : [];
    } catch (error) {
        coupons.value = [];
    } finally {
        loading.value = false;
    }
};

const onPage = (event: { page: number; rows: number }) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
};

const openAddDialog = () => {
    newCoupon.value = {
        id: null,
        codeCoupon: '',
        couponName: '',
        discountAmount: 0.0,
        expirationDate: null,
        startDate: new Date(),
        couponStatus: '',
        deleted: false
    };
    addCouponDialog.value = true;
};

const hideAddDialog = () => {
    addCouponDialog.value = false;
    errors.value = {}; // reset lỗi
};
watch(() => addCouponDialog.value, (visible) => {
    if (!visible) {
        Object.keys(errors.value).forEach(key => delete errors.value[key]);
    }
});

watch(() => newCoupon.value.couponName, (couponName) => {
    if (couponName.length > 100) {
        errors.value.couponName = "Tên phiếu giảm giá quá dài (tối đa 100 ký tự)";
    }
    else {
        delete errors.value.couponName;
    }
});
watch(() => coupon.value.couponName, (couponName) => {
    if (couponName.length > 100) {
        errors.value.couponName = "Tên phiếu giảm giá quá dài (tối đa 100 ký tự)";
    }
    else {
        delete errors.value.couponName;
    }
});

function trimToMinute(date: Date): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
}

function validateCoupon(data: any, isNew: boolean): boolean {
    errors.value = {}; // reset lỗi
    const now = trimToMinute(new Date());

    // 1. Validate tên
    if (data.couponName?.length > 100) {
        errors.value.couponName = "Tên phiếu giảm giá quá dài (tối đa 100 ký tự)";
    }
    if (!data.couponName?.trim()) {
        errors.value.couponName = "Tên phiếu giảm giá không được để trống";
    }

    // 2. Validate giá trị giảm
    if (!data.discountAmount || data.discountAmount <= 0) {
        errors.value.discountAmount = "Giá trị giảm phải lớn hơn 0";
    }

    // 3. Validate ngày bắt đầu
    if (isNew) {
        if (!data.startDate) {
            errors.value.startDate = "Ngày bắt đầu không được để trống";
        } else {
            const start = trimToMinute(new Date(data.startDate));
            if (start < now) {
                errors.value.startDate = "Ngày bắt đầu không được ở quá khứ";
            }
        }
    }

    // 4. Validate ngày hết hạn
    if (!data.expirationDate) {
        errors.value.expirationDate = "Ngày hết hạn không được để trống";
    } else {
        const end = trimToMinute(new Date(data.expirationDate));
        if (end < now) {
            errors.value.expirationDate = "Ngày hết hạn không được ở quá khứ";
        }
    }

    // 5. So sánh startDate và expirationDate
    if (data.startDate && data.expirationDate) {
        const start = trimToMinute(new Date(data.startDate));
        const end = trimToMinute(new Date(data.expirationDate));
        if (start > end) {
            errors.value.startDate = "Ngày bắt đầu không được sau ngày kết thúc";
            errors.value.expirationDate = "Ngày hết hạn không được trước ngày bắt đầu";
        }
    }

    // 6. Thông báo lỗi
    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
    }

    return Object.keys(errors.value).length === 0;
}

function validateUpdateCoupon(): boolean {
    errors.value = {}; // reset lỗi
    const nameRegex = /^[\p{L}\d\s]+$/u;

    if (coupon.value.couponName?.length > 100) {
        errors.value.couponName = "Tên phiếu giảm giá quá dài (tối đa 100 ký tự)";
    }
    if (!coupon.value.couponName?.trim()) {
        errors.value.couponName = "Tên phiếu giảm giá không được để trống";
    }

    else if (!nameRegex.test(coupon.value.couponName.trim())) {
        errors.value.couponName = "Tên phiếu giảm giá không được chứa ký tự đặc biệt";
    }

    if (!coupon.value.discountAmount || coupon.value.discountAmount <= 0) {
        errors.value.discountAmount = "Giá trị giảm phải lớn hơn 0";
    }

    if (!coupon.value.expirationDate) {
        errors.value.expirationDate = "Ngày hết hạn không được để trống";
    }
    if (
        coupon.value.startDate &&
        coupon.value.expirationDate &&
        new Date(coupon.value.startDate) > new Date(coupon.value.expirationDate)
    ) {
        errors.value.startDate = "Ngày bắt đầu không được sau ngày kết thúc";
        errors.value.expirationDate = "Ngày hết hạn không được trước ngày bắt đầu";
    }
    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
            life: 3000
        });
    }
    return Object.keys(errors.value).length === 0;
}


watch(
    () => [newCoupon.value.startDate, newCoupon.value.expirationDate],
    ([start, end]) => {
        if (start && end && new Date(start) > new Date(end)) {
            errors.value.expirationDate = "Ngày hết hạn không được trước ngày bắt đầu";
        } else {
            // Xóa lỗi nếu hợp lệ
            if (errors.value.expirationDate === "Ngày hết hạn không được trước ngày bắt đầu") {
                delete errors.value.expirationDate;
            }
        }
    }
);


watch(
    () => [coupon.value.startDate, coupon.value.expirationDate],
    ([start, end]) => {
        if (start && end && new Date(start) > new Date(end)) {
            errors.value.expirationDate = "Ngày hết hạn không được trước ngày bắt đầu";
        } else {
            // Xóa lỗi nếu hợp lệ
            if (errors.value.expirationDate === "Ngày hết hạn không được trước ngày bắt đầu") {
                delete errors.value.expirationDate;
            }
        }
    }
);

const addCoupon = async (): Promise<void> => {
    if (validateCoupon(newCoupon.value, true)) {
        try {
            await CouponService.saveCoupon(toCouponRequest(newCoupon.value));
            addCouponDialog.value = false;
            await loadCoupons();
        } catch (error) {

        }
    }
};

watch([minDiscount, maxDiscount], ([min, max]) => {
    if (min !== null && max !== null && min > max) {
        toast.add({
            severity: 'warn',
            summary: 'Khoảng giá trị không hợp lệ',
            detail: 'Giá trị "Từ" không được lớn hơn "Đến".',
            life: 3000
        });
    }
});


const editCoupon = (couponData: Coupon) => {
    openEdit(couponData.id);
};

const openEdit = async (couponId: number | null): Promise<void> => {
    if (couponId == null) return;
    try {
        const response = await CouponService.getCouponById(couponId);
        if (!response.data) return;

        coupon.value = {
            id: response.data.id ?? null,
            codeCoupon: response.data.codeCoupon ?? "",
            couponName: response.data.couponName ?? "",
            usedCount: response.data.usedCount ?? 0,
            discountAmount: response.data.discountAmount ?? 0.0,
            expirationDate: response.data.expirationDate ? new Date(response.data.expirationDate) : null,
            startDate: response.data.startDate ? new Date(response.data.startDate) : null,
            couponStatus: response.data.couponStatus ?? "",
            deleted: response.data.deleted ?? false
        };
        couponUpdateDialog.value = true;
    } catch (error) { }
};

const hideUpdateDialog = () => {
    couponUpdateDialog.value = false;
    coupon.value = {
        id: null,
        codeCoupon: '',
        couponName: '',
        discountAmount: 0.0,
        expirationDate: null,
        startDate: null,
        couponStatus: '',
        deleted: false
    };
    errors.value = {};
};
watch(() => couponUpdateDialog.value, (visible) => {
    if (!visible) {
        Object.keys(errors.value).forEach(key => delete errors.value[key]);
    }
});

function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

const isStartDatePast = computed(() => {
    if (!coupon.value.startDate) return false;
    const now = normalizeDate(new Date());
    const start = normalizeDate(new Date(coupon.value.startDate));
    return start.getTime() < now.getTime(); // chỉ coi là "đã bắt đầu" nếu ngày < hôm nay
});

const minStartDate = computed(() => {
    return normalizeDate(new Date());
});



//cập nhật
const saveCoupon = async (): Promise<void> => {
    if (validateCoupon(coupon.value, false)) {
        try {
            if (coupon.value.id) {
                await CouponService.updateCoupon(coupon.value.id, toCouponRequestUpdate(coupon.value));
            } else {
                await CouponService.saveCoupon(toCouponRequest(coupon.value));
            }
            couponUpdateDialog.value = false;
            await loadCoupons();
        } catch (error) { }
    }
};

const importCoupons = (): void => {



};



const exportCoupons = (): void => {
    if (!coupons.value.length) {
        toast.add({
            severity: 'warn',
            summary: 'Không có dữ liệu',
            detail: 'Không có phiếu giảm giá nào để xuất.',
            life: 3000
        });
        return;
    }

    // Chuẩn bị dữ liệu export
    const exportData = coupons.value.map((c, index) => ({
        STT: index + 1,
        "Mã phiếu": c.codeCoupon,
        "Tên phiếu": c.couponName,
        "Đã tặng": c.usedCount ?? 0,
        "Giá trị giảm": c.discountAmount,
        "Ngày bắt đầu": c.startDate ? formatDate(c.startDate) : '',
        "Ngày hết hạn": c.expirationDate ? formatDate(c.expirationDate) : '',
        "Trạng thái": getCouponStatus(c).text
    }));

    exportToExcel(exportData, 'Danh_sach_coupon');
};


onMounted(loadCoupons);

const clearSearch = (): void => {
    searchTerm.value = '';
    minDiscount.value = null;
    maxDiscount.value = null;
    selectedStatus.value = null;
    loadCoupons();
    lazyParams.value.page = 0;
};


const searchCoupons = async (): Promise<void> => {
    if (!searchTerm.value.trim()) {
        await loadCoupons();
        lazyParams.value.page = 0;
        return;
    }
    loading.value = true;
    try {
        const response = await CouponService.getCouponsByCode(searchTerm.value);
        coupons.value = Array.isArray(response.data)
            ? response.data.map((item: any) => ({
                id: item.id ?? null,
                codeCoupon: item.codeCoupon ?? "",
                couponName: item.couponName ?? "",
                usedCount: item.usedCount ?? 0,
                discountAmount: item.discountAmount ?? 0.0,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
                startDate: item.startDate ? new Date(item.startDate) : null,
                couponStatus: item.couponStatus ?? "",
                deleted: item.deleted ?? false
            }))
            : [];
        totalRecords.value = coupons.value.length;
        lazyParams.value.page = 0;
    } catch (error) {
        coupons.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};



let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { searchCoupons(); }, 500);
};

const formatCurrency = (value: number | null): string => {
    if (!value) return '0đ';
    return value.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (date: Date | string | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const getCouponStatus = (coupon: Coupon) => {
    if (coupon.deleted) return { text: 'Đã xóa', severity: 'danger' };
    const now = new Date();
    const startDate = coupon.startDate ? new Date(coupon.startDate) : now;
    const endDate = coupon.expirationDate ? new Date(coupon.expirationDate) : now;
    if (startDate > now) return { text: 'Chưa bắt đầu', severity: 'warning' };
    if (endDate < now) return { text: 'Đã hết hạn', severity: 'danger' };
    return { text: 'Đang hoạt động', severity: 'success' };
};


//chuyển hướng đến trang tặng coupon
const goToGiftCoupon = (coupon: Coupon) => {
    if (!coupon.id) return;
    router.push({
        name: 'GiftCoupon',
        params: { couponId: coupon.id }
    });
};

</script>
<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Danh sách phiếu giảm giá</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <Button label="Thêm mới" icon="pi pi-plus" class="p-button-success mr-2"
                            @click="openAddDialog" />
                    </template>
                    <template v-slot:end>
                        <!-- <Button label="Nhập Excel" icon="pi pi-upload" class=" p-button-info mr-2" @click="importCoupons" /> -->
                        <Button label="Xuất Excel" icon="pi pi-download" class="p-button-help "
                            @click="exportCoupons" />
                    </template>
                </Toolbar>

                <!-- Phần tìm kiếm & bộ lọc -->
                <div class="filter-bar">
                    <!-- Nút clear -->
                    <Button icon="pi pi-filter-slash" label="Clear" class="p-button-outlined clear-btn"
                        @click="clearSearch" />

                    <!-- Bộ lọc trạng thái -->
                    <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="Trạng thái" class="filter-dropdown" />

                    <!-- Bộ lọc khoảng giảm giá -->
                    <div class="discount-range">
                        <InputNumber v-model="minDiscount" :min="0" mode="currency" currency="VND" locale="vi-VN"
                            placeholder="Từ" />
                        <span class="filter-separator">-</span>
                        <InputNumber v-model="maxDiscount" :min="0" mode="currency" currency="VND" locale="vi-VN"
                            placeholder="Đến" />
                    </div>


                    <!-- Tìm theo mã phiếu -->
                    <span class="p-input-icon-left search-box">
                        <i class="pi pi-search"></i>
                        <InputText v-model="searchTerm" placeholder="Tìm theo mã phiếu..." @keyup="debouncedSearch" />
                    </span>
                </div>



                <!-- Modal Thêm Phiếu Giảm Giá -->
                <Dialog v-model:visible="addCouponDialog" :style="{ width: '500px' }" header="Thêm Phiếu Giảm Giá" modal
                    class="custom-dialog">
                    <div class="form-container">

                        <!-- Tên phiếu giảm giá -->
                        <div class="field">
                            <label for="add-couponName" class="field-label">Tên phiếu giảm giá *</label>
                            <InputText id="add-couponName" v-model="newCoupon.couponName"
                                placeholder="Nhập tên phiếu giảm giá" required class="field-input"
                                :class="{ 'border-red-500': errors.couponName }" />
                            <small v-if="errors.couponName" class="error-text">{{ errors.couponName }}</small>
                        </div>

                        <!-- Giá trị giảm -->
                        <div class="field">
                            <label for="add-couponAmount" class="field-label">Giá trị giảm (đ) *</label>
                            <InputNumber id="add-couponAmount" v-model="newCoupon.discountAmount" :min="0"
                                mode="currency" currency="VND" locale="vi-VN" placeholder="Nhập giá trị giảm"
                                class="field-input" :class="{ 'border-red-500': errors.discountAmount }" />
                            <small v-if="errors.discountAmount" class="error-text">{{ errors.discountAmount }}</small>

                        </div>

                        <!-- Ngày bắt đầu -->
                        <div class="field">
                            <label for="add-startDate" class="field-label">Ngày bắt đầu</label>
                            <Calendar id="edit-startDate" v-model="newCoupon.startDate" dateFormat="dd/mm/yy" showTime
                                class="field-input" :class="{ 'border-red-500': errors.startDate }"
                                :disabled="isStartDatePast" :minDate="minStartDate" />

                            <small v-if="errors.startDate" class="error-text">{{ errors.startDate }}</small>
                        </div>

                        <!-- Ngày hết hạn -->
                        <div class="field">
                            <label for="add-expirationDate" class="field-label">Ngày hết hạn</label>
                            <Calendar id="add-expirationDate" v-model="newCoupon.expirationDate" dateFormat="dd/mm/yy"
                                showTime class="field-input" :class="{ 'border-red-500': errors.expirationDate }" />
                            <small v-if="errors.expirationDate" class="error-text">{{ errors.expirationDate }}</small>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text cancel-button"
                            @click="hideAddDialog" />
                        <Button label="Thêm" icon="pi pi-check" class="p-button-primary save-button"
                            @click="addCoupon" />
                    </template>
                </Dialog>

                <!-- Modal sửa phiếu giảm giá -->
                <Dialog v-model:visible="couponUpdateDialog" :style="{ width: '500px' }"
                    header="Chi tiết phiếu giảm giá" modal class="custom-dialog">
                    <div class="form-container">
                        <!-- Mã phiếu giảm giá -->
                        <div class="field">
                            <label for="edit-codeCoupon" class="field-label">Mã phiếu giảm giá *</label>
                            <InputText id="edit-codeCoupon" v-model="coupon.codeCoupon" :disabled="true"
                                placeholder="Nhập mã phiếu giảm giá" required class="field-input" />
                        </div>

                        <!-- Tên phiếu giảm giá -->
                        <div class="field">
                            <label for="edit-couponName" class="field-label">Tên phiếu giảm giá *</label>
                            <InputText id="edit-couponName" v-model="coupon.couponName"
                                placeholder="Nhập tên phiếu giảm giá" required class="field-input"
                                :class="{ 'border-red-500': errors.couponName }" />
                            <small v-if="errors.couponName" class="error-text">{{ errors.couponName }}</small>
                        </div>

                        <!-- Giá trị giảm -->
                        <div class="field">
                            <label for="edit-couponAmount" class="field-label">Giá trị giảm (đ) *</label>
                            <InputNumber id="edit-couponAmount" v-model="coupon.discountAmount" :min="0" mode="currency"
                                currency="VND" locale="vi-VN" placeholder="Nhập giá trị giảm" class="field-input"
                                :class="{ 'border-red-500': errors.discountAmount }" />
                            <small v-if="errors.discountAmount" class="error-text">{{ errors.discountAmount }}</small>
                        </div>

                        <!-- Ngày bắt đầu -->
                        <div class="field">
                            <label for="edit-startDate" class="field-label">Ngày bắt đầu</label>
                            <Calendar id="edit-startDate" v-model="coupon.startDate" dateFormat="dd/mm/yy" showTime
                                class="field-input" :class="{ 'border-red-500': errors.startDate }"
                                :disabled="isStartDatePast" :minDate="minStartDate" />

                            <small v-if="errors.startDate" class="error-text">{{ errors.startDate }}</small>
                        </div>

                        <!-- Ngày hết hạn -->
                        <div class="field">
                            <label for="edit-expirationDate" class="field-label">Ngày hết hạn</label>
                            <Calendar id="edit-expirationDate" v-model="coupon.expirationDate" dateFormat="dd/mm/yy"
                                showTime class="field-input" :class="{ 'border-red-500': errors.expirationDate }" />
                            <small v-if="errors.expirationDate" class="error-text">{{ errors.expirationDate }}</small>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text cancel-button"
                            @click="hideUpdateDialog" />
                        <Button label="Cập nhật" icon="pi pi-check" class="p-button-primary save-button"
                            @click="saveCoupon" />
                    </template>
                </Dialog>

                <!-- Bảng hiển thị danh sách phiếu giảm giá -->
                <DataTable v-model:selection="selectedCoupons" :value="filteredCoupons" :paginator="true"
                    :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
                    emptyMessage="Không tìm thấy phiếu giảm giá nào." :loading="loading" @page="onPage"
                    :rowsPerPageOptions="[5, 10, 20, 50]" :globalFilterFields="['codeCoupon', 'couponName']"
                    class="p-datatable-gridlines" :rowHover="true">
                    <template #header>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-xl font-semibold">Danh sách phiếu giảm giá</span>
                        </div>
                    </template>
                    <Column selectionMode="multiple" headerStyle="width: 3em" />
                    <Column header="STT" style="width: 4rem">
                        <template #body="slotProps">
                            {{ lazyParams.page * lazyParams.size + slotProps.index + 1 }}
                        </template>
                    </Column>
                    <Column field="codeCoupon" header="Mã phiếu" />
                    <Column field="couponName" header="Tên phiếu" sortable />
                    <Column header="Đã tặng" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.usedCount ?? 0 }}
                        </template>
                    </Column>
                    <Column field="discountAmount" header="Giá trị giảm" sortable>
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.discountAmount) }}
                        </template>
                    </Column>
                    <Column field="startDate" header="Ngày bắt đầu" sortable>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.startDate) }}
                        </template>
                    </Column>
                    <Column field="expirationDate" header="Ngày hết hạn" sortable>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.expirationDate) }}
                        </template>
                    </Column>
                    <Column field="couponStatus" header="Trạng thái">
                        <template #body="slotProps">
                            <Tag :value="getCouponStatus(slotProps.data).text"
                                :severity="getCouponStatus(slotProps.data).severity" />
                        </template>
                    </Column>
                    <Column header="Thao Tác">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                    @click="editCoupon(slotProps.data)" />
                                <Button icon="pi pi-gift" class="p-button-rounded p-button-info" :label="''"
                                    @click="goToGiftCoupon(slotProps.data)" v-tooltip="'Tặng coupon cho khách hàng'"
                                    :disabled="getCouponStatus(slotProps.data).text !== 'Đang hoạt động'" />

                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>


<style scoped lang="scss">
.couponCode {
    :hover {
        transform: scale(1.1);
    }
}

::v-deep(.p-datatable) {
    .p-paginator-bottom {
        border: none;
        background: transparent;
    }
}

:deep(.p-button.p-button-text) {
    padding: 0.5rem;

    &:focus {
        box-shadow: none;
    }
}

.search-bar-vertical {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.search-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.search-bar-vertical :deep(.p-inputtext),
.search-bar-vertical :deep(.p-inputnumber-input),
.search-bar-vertical :deep(.p-inputwrapper),
.search-bar-vertical :deep(.p-calendar) {
    border-radius: 8px !important;
    border: 1px solid #ccc !important;
    background: #fff !important;
    box-shadow: none !important;
    margin: 0 !important;
}

.search-bar-vertical :deep(.p-inputtext:focus),
.search-bar-vertical :deep(.p-inputnumber-input:focus),
.search-bar-vertical :deep(.p-calendar:focus) {
    border-color: #007ad9 !important;
    box-shadow: 0 0 0 2px rgba(0, 122, 217, 0.08) !important;
    outline: none !important;
}

.filter-input {
    width: 140px;
    min-width: 90px;
    max-width: 170px;
}

.filter-separator {
    min-width: 16px;
    text-align: center;
    color: #888;
    font-weight: 500;
    user-select: none;
}

.search-input-box {
    width: 230px;
    min-width: 120px;
}

.custom-dialog {
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.field {
    position: relative;
}

.field-label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #333;
}

.p-input-icon-left {
    width: 100%;
}

.field-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.field-input:focus {
    border-color: #007ad9;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 122, 217, 0.5);
}

.cancel-button {
    color: #f44336;
}

.save-button {
    background-color: #007ad9;
    border-color: #007ad9;
    color: #fff;
}

.save-button:hover {
    background-color: #005bb5;
    border-color: #005bb5;
}

.error-text {
    color: red;
    font-size: 0.85rem;
    margin-top: 4px;
    display: block;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 1.2rem; // tăng khoảng cách chung
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}

.discount-range {
    display: flex;
    align-items: center;
    gap: 0.1rem; // tạo khoảng cách giữa "Từ - Đến"
}

.search-box {
    flex: 1;
    min-width: 240px; // cho input tìm kiếm rộng hơn
}

.clear-btn {
    min-width: 110px;
}

.filter-dropdown {
    min-width: 180px;
}

.discount-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-input {
    width: 120px;
}

.filter-separator {
    color: #888;
    font-weight: 500;
    user-select: none;
}

.search-box {
    flex: 1;
    min-width: 220px;

    input {
        width: 100%;
        border-radius: 8px;
    }
}
</style>