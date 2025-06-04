<script setup lang="ts">
import { ref, computed, onMounted, defineEmits } from "vue";
import { CouponService } from "../../../../service/CouponService";
import { useRouter } from "vue-router";
import type { CouponRequest } from "../../../../model/coupon";
//Tìm kiếm theo khoảng giá trị giảm
const minDiscount = ref<number | null>(null);
const maxDiscount = ref<number | null>(null);

// Interface cho object dùng trong form (kiểu Date)
interface Coupon {
    id: number | null;
    codeCoupon: string;
    couponName: string;
    quantity: number;
    usedCount?: number;
    discountAmount: number;
    expirationDate: Date | null;
    startDate: Date | null;
    couponStatus: string;
    deleted: boolean;
}

// Interface request gửi lên backend (kiểu string)
// interface CouponRequest {
//     couponName: string;
//     quantity: number;
//     discountAmount: number;
//     expirationDate: string | null;
//     startDate: string | null;
// }

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
    quantity: 0,
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
    quantity: 1,
    discountAmount: 0.0,
    expirationDate: null,
    startDate: new Date(),
    couponStatus: '',
    deleted: false
});

const emit = defineEmits();
const router = useRouter();

const pagedCoupons = computed(() =>
    coupons.value.slice(
        lazyParams.value.page * lazyParams.value.size,
        (lazyParams.value.page + 1) * lazyParams.value.size
    )
);

// Helper chuyển Coupon -> CouponRequest (convert ngày về string)
function toCouponRequest(c: Coupon): CouponRequest {
    return {
        couponName: c.couponName,
        quantity: c.quantity,
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
        quantity: c.quantity,
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
                quantity: item.quantity ?? 0,
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
        quantity: 1,
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
};

const addCoupon = async (): Promise<void> => {
    try {
        await CouponService.saveCoupon(toCouponRequest(newCoupon.value));
        addCouponDialog.value = false;
        await loadCoupons();
    } catch (error) {

    }
};

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
            quantity: response.data.quantity ?? 0,
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
        quantity: 0,
        discountAmount: 0.0,
        expirationDate: null,
        startDate: null,
        couponStatus: '',
        deleted: false
    };
};
//cập nhật
const saveCoupon = async (): Promise<void> => {
    try {
        if (coupon.value.id) {
            await CouponService.updateCoupon(coupon.value.id, toCouponRequestUpdate(coupon.value));
        } else {
            await CouponService.saveCoupon(toCouponRequest(coupon.value));
        }
        couponUpdateDialog.value = false;
        await loadCoupons();        
    } catch (error) { }
};

const importCoupons = (): void => { };
const exportCoupons = (): void => { };

onMounted(loadCoupons);

const clearSearch = (): void => {
    searchTerm.value = '';
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
                quantity: item.quantity ?? 0,
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
                        <Button label="Nhập" icon="pi pi-upload" class="p-button-help mr-2" @click="importCoupons" />
                        <Button label="Xuất" icon="pi pi-download" class="p-button-info" @click="exportCoupons" />
                    </template>
                </Toolbar>

                <!-- Phần tìm kiếm -->
                <div class="flex align-items-center justify-content-between mb-4">
                    <Button icon="pi pi-filter-slash" label="Xóa bộ lọc" class="p-button-outlined mr-2"
                        @click="clearSearch" />
                    <div class="search-bar-vertical">
                        <div class="search-bar-row">
                            <InputNumber v-model="minDiscount" :min="0" placeholder="Giá trị giảm từ"
                                class="filter-input" />
                            <span class="filter-separator">-</span>
                            <InputNumber v-model="maxDiscount" :min="0" placeholder="Đến" class="filter-input" />
                        </div>
                        <InputText v-model="searchTerm" placeholder="Tìm theo mã phiếu..." class="search-input-box"
                            @keyup="debouncedSearch" />
                    </div>
                </div>

                <!-- Modal Thêm Phiếu Giảm Giá -->
                <Dialog v-model:visible="addCouponDialog" :style="{ width: '500px' }" header="Thêm Phiếu Giảm Giá" modal
                    class="custom-dialog">
                    <div class="form-container">

                        <!-- Tên phiếu giảm giá -->
                        <div class="field">
                            <label for="add-couponName" class="field-label">Tên phiếu giảm giá *</label>
                            <InputText id="add-couponName" v-model="newCoupon.couponName"
                                placeholder="Nhập tên phiếu giảm giá" required class="field-input" />
                        </div>

                        <!-- Số lượng -->
                        <div class="field">
                            <label for="add-quantity" class="field-label">Số lượng *</label>
                            <InputNumber id="add-quantity" v-model="newCoupon.quantity" :min="1"
                                placeholder="Nhập số lượng" class="field-input" />
                        </div>

                        <!-- Giá trị giảm -->
                        <div class="field">
                            <label for="add-discountAmount" class="field-label">Giá trị giảm (đ) *</label>
                            <InputNumber id="add-discountAmount" v-model="newCoupon.discountAmount" :min="0" mode="currency"
                                currency="VND" locale="vi-VN" placeholder="Nhập giá trị giảm" class="field-input" />
                        </div>

                        <!-- Ngày bắt đầu -->
                        <div class="field">
                            <label for="add-startDate" class="field-label">Ngày bắt đầu</label>
                            <Calendar id="add-startDate" v-model="newCoupon.startDate" dateFormat="dd/mm/yy" showTime
                                class="field-input" />
                        </div>

                        <!-- Ngày hết hạn -->
                        <div class="field">
                            <label for="add-expirationDate" class="field-label">Ngày hết hạn</label>
                            <Calendar id="add-expirationDate" v-model="newCoupon.expirationDate" dateFormat="dd/mm/yy"
                                showTime class="field-input" />
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
                                placeholder="Nhập tên phiếu giảm giá" required class="field-input" />
                        </div>

                        <!-- Số lượng -->
                        <div class="field">
                            <label for="edit-quantity" class="field-label">Số lượng *</label>
                            <InputNumber id="edit-quantity" v-model="coupon.quantity" :min="1"
                                placeholder="Nhập số lượng" class="field-input" />
                        </div>

                        <!-- Giá trị giảm -->
                        <div class="field">
                            <label for="edit-discountAmount" class="field-label">Giá trị giảm (đ) *</label>
                                <InputNumber id="edit-discountAmount" v-model="coupon.discountAmount" :min="0" mode="currency"
                                    currency="VND" locale="vi-VN" placeholder="Nhập giá trị giảm" class="field-input" />
                        </div>

                        <!-- Ngày bắt đầu -->
                        <div class="field">
                            <label for="edit-startDate" class="field-label">Ngày bắt đầu</label>
                            <Calendar id="edit-startDate" v-model="coupon.startDate" dateFormat="dd/mm/yy" showTime
                                class="field-input" />
                        </div>

                        <!-- Ngày hết hạn -->
                        <div class="field">
                            <label for="edit-expirationDate" class="field-label">Ngày hết hạn</label>
                            <Calendar id="edit-expirationDate" v-model="coupon.expirationDate" dateFormat="dd/mm/yy"
                                showTime class="field-input" />
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
                <DataTable v-model:selection="selectedCoupons" :value="coupons" :paginator="true"
                    :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
                    emptyMessage="Không tìm thấy phiếu giảm giá nào." :loading="loading" @page="onPage"
                    :rowsPerPageOptions="[5, 10, 20, 50]" :globalFilterFields="['codeCoupon', 'couponName']">
                    <template #header>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-xl font-semibold">Danh sách phiếu giảm giá</span>
                        </div>
                    </template>
                    <Column selectionMode="multiple" headerStyle="width: 3em" />
                    <Column field="codeCoupon" header="Mã phiếu" />
                    <Column field="couponName" header="Tên phiếu" />
                    <Column field="quantity" header="Tổng số lượng" />
                    <Column header="Đã tặng">
                        <template #body="slotProps">
                            {{ slotProps.data.usedCount ?? 0 }}
                        </template>
                    </Column>
                    <Column header="Số lượng còn lại">
                        <template #body="slotProps">
                            {{ (slotProps.data.quantity ?? 0) - (slotProps.data.usedCount ?? 0) }}
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
                    <Column field="couponStatus" header="Trạng thái" sortable>
                        <template #body="slotProps">
                            <Tag :value="getCouponStatus(slotProps.data).text"
                                :severity="getCouponStatus(slotProps.data).severity" />
                        </template>
                    </Column>
                    <Column header="Hành động">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                    @click="editCoupon(slotProps.data)" />
                                <Button icon="pi pi-gift" class="p-button-rounded p-button-info" :label="''"
                                    @click="goToGiftCoupon(slotProps.data)" v-tooltip="'Tặng coupon cho khách hàng'"
                                    :disabled="(slotProps.data.quantity ?? 0) - (slotProps.data.usedCount ?? 0) <= 0" />
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

/* SEARCH BAR TÁCH DÒNG */
.search-bar-vertical {
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* width: 100%; hoặc bỏ width đi */
}

.search-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Bo tròn và tách biệt từng input (PrimeVue) */
.search-bar-vertical :deep(.p-inputtext),
.search-bar-vertical :deep(.p-inputnumber-input),
.search-bar-vertical :deep(.p-inputwrapper) {
    border-radius: 8px !important;
    border: 1px solid #ccc !important;
    background: #fff !important;
    box-shadow: none !important;
    margin: 0 !important;
}

.search-bar-vertical :deep(.p-inputtext:focus),
.search-bar-vertical :deep(.p-inputnumber-input:focus) {
    border-color: #007ad9 !important;
    box-shadow: 0 0 0 2px rgba(0, 122, 217, 0.08) !important;
    outline: none !important;
}

.filter-input {
    width: 110px;
    min-width: 80px;
    max-width: 120px;
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

.field-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    resize: none;
    transition: border-color 0.2s ease;
}

.field-textarea:focus {
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

.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
