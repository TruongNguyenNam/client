<script setup>
import { ref, onBeforeMount, watch } from "vue";
import { OrderService } from "../../../../service/admin/OrderService";
import { FilterMatchMode } from "primevue/api";
import Toast from "primevue/toast";

const orders = ref([]);
const loading = ref(true);
const totalRecords = ref(0);

const lazyParams = ref({
    page: 0,
    size: 5,
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    isPos: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const toast = ref(null);

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        isPos: { value: null, matchMode: FilterMatchMode.EQUALS },
    };
};

const loadOrders = async () => {
    loading.value = true;
    try {
        const response = await OrderService.getAllOrders();
        console.log("📦 API Response:", response);

        const data = response?.data;

        if (Array.isArray(data)) {
            let filtered = data;

            // Lọc theo loại đơn nếu có filter
            const isPosFilter = filters.value.isPos.value;
            if (isPosFilter !== null) {
                filtered = filtered.filter(order => order.isPos === isPosFilter);
            }

            // Lọc theo global filter (orderCode, orderStatus)
            const globalFilter = filters.value.global.value?.toLowerCase();
            if (globalFilter) {
                filtered = filtered.filter(order =>
                    order.orderCode?.toLowerCase().includes(globalFilter) ||
                    order.orderStatus?.toLowerCase().includes(globalFilter)
                );
            }

            orders.value = filtered;
            totalRecords.value = filtered.length;
        } else {
            console.warn("❌ Dữ liệu không hợp lệ:", data);
            orders.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("🔥 Lỗi khi gọi API:", error);
        orders.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    loadOrders();
};

watch(() => filters.value.global.value, () => {
    lazyParams.value.page = 0;
    loadOrders();
});

watch(() => filters.value.isPos.value, () => {
    lazyParams.value.page = 0;
    loadOrders();
});

onBeforeMount(() => {
    initFilters();
    loadOrders();
});
</script>

<template>
    <div class="grid">
        <Toast ref="toast" />
        <div class="col-12">
            <div class="card">
                <h5>Danh Sách Đơn Hàng</h5>

                <DataTable :value="orders" :paginator="true" :first="lazyParams.page * lazyParams.size"
                    :rows="lazyParams.size" :totalRecords="totalRecords" :rowHover="true" class="p-datatable-gridlines"
                    filterDisplay="menu" v-model:filters="filters" :loading="loading" :lazy="false" @page="onPage"
                    responsiveLayout="scroll" :globalFilterFields="['orderCode', 'orderStatus']"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đơn hàng"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    :pageLinkSize="3">
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row gap-2">
                            <!-- Bên trái: nút Clear -->
                            <div class="flex align-items-center">
                                <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined"
                                    @click="initFilters()" />
                            </div>

                            <!-- Bên phải: Tìm kiếm + Dropdown loại đơn -->
                            <div class="flex align-items-center gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filters.global.value" placeholder="Tìm kiếm..."
                                        style="width: 15rem" />
                                </span>

                                <Dropdown :options="[
                                    { label: 'Tất cả', value: null },
                                    { label: 'Tại Quầy', value: true },
                                    { label: 'Ship', value: false }
                                ]" v-model="filters.isPos.value" placeholder="Loại đơn" class="w-12rem" optionLabel="label"
                                    optionValue="value" />
                            </div>
                        </div>
                    </template>


                    <Column header="ID" style="min-width: 6rem">
                        <template #body="slotProps">{{ slotProps.data.id }}</template>
                    </Column>

                    <Column header="Mã đơn hàng" style="min-width: 14rem">
                        <template #body="slotProps">{{ slotProps.data.orderCode }}</template>
                    </Column>

                    <Column header="Người đặt" style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ slotProps.data.address ? slotProps.data.address.username : '---' }}
                        </template>
                    </Column>

                    <Column header="Thời gian đặt" style="min-width: 14rem">
                        <template #body="slotProps">
                            {{ slotProps.data.orderDate ? new Date(slotProps.data.orderDate).toLocaleString('vi-VN') :
                            '---' }}
                        </template>
                    </Column>

                    <Column header="Tổng tiền" style="min-width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.orderTotal?.toLocaleString('vi-VN') }} đ
                        </template>
                    </Column>

                    <Column header="Trạng thái đơn" style="min-width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.orderStatus }}
                        </template>
                    </Column>

                    <Column header="Loại đơn" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.isPos ? 'Tại Quầy' : 'Ship'"
                                :severity="slotProps.data.isPos ? 'success' : 'info'" />
                        </template>
                    </Column>

                    <Column header="Trạng thái vận chuyển" style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ slotProps.data.shipment?.shipmentStatus || '---' }}
                        </template>
                    </Column>

                    <Column header="Hành động" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button label="Chi tiết" icon="pi pi-eye" class="p-button-text p-button-info"
                                @click="$router.push(`/management/order/${slotProps.data.id}`)" />
                        </template>
                    </Column>

                    <template #empty>
                        Không tìm thấy đơn hàng nào.
                    </template>

                    <template #loading>
                        Đang tải dữ liệu...
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
