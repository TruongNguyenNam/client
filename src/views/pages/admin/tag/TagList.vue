<script setup>
import { ref, onBeforeMount, watch, defineEmits } from "vue";
import { SupplierService } from "../../../../service/SupplierService";
import { FilterMatchMode } from "primevue/api";
import { useRouter } from "vue-router";

const suppliers = ref([]);
const loading = ref(true);
const totalRecords = ref(0);

const lazyParams = ref({
    page: 0,
    size: 5,
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const supplierDialog = ref(false);
const supplier = ref({
    id: null,
    name: '',
    description: ''
});
const selectedSuppliers = ref([]);
const deleteSupplierDialog = ref(false);
const deleteSuppliersDialog = ref(false);

const emit = defineEmits();
const router = useRouter();

// Khởi tạo filters
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
};

// Load danh sách nhà cung cấp từ API
const loadSuppliers = async () => {
    loading.value = true;
    try {
        const response = await SupplierService.getAllSupplier(lazyParams.value.page, lazyParams.value.size);
        suppliers.value = response.content;
        totalRecords.value = response.totalItems;
    } catch (error) {
        console.error("Lỗi khi tải nhà cung cấp:", error);
    } finally {
        loading.value = false;
    }
};

// Xử lý phân trang
const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    loadSuppliers();
};

// Watch filters
watch(() => filters.value.global.value, () => {
    lazyParams.value.page = 0;
    loadSuppliers();
});

// Khởi tạo dữ liệu
onBeforeMount(() => {
    initFilters();
    loadSuppliers();
});

// Xóa nhà cung cấp
const deleteSupplier = async () => {
    try {
        await SupplierService.deleteSupplier([supplier.value.id]);
        deleteSupplierDialog.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi xóa nhà cung cấp:", error);
    }
};

// Xóa các nhà cung cấp đã chọn
const deleteSelectedSuppliers = async () => {
    const selectedIds = selectedSuppliers.value.map(supplier => supplier.id);
    if (selectedIds.length === 0) {
        alert("Chưa chọn nhà cung cấp nào để xóa!");
        return;
    }
    try {
        await SupplierService.deleteSupplier(selectedIds);
        deleteSuppliersDialog.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi xóa các nhà cung cấp:", error);
    }
};

// Mở modal để thêm nhà cung cấp mới
const openNew = () => {
    supplier.value = { name: '', description: '' };
    supplierDialog.value = true;
};

// Ẩn modal
const hideDialog = () => {
    supplierDialog.value = false;
};

// Lưu nhà cung cấp (thêm hoặc sửa)
const saveSupplier = async () => {
    try {
        if (supplier.value.id) {
            // Cập nhật nhà cung cấp
            await SupplierService.updateSupplier(supplier.value.id, supplier.value);
        } else {
            // Thêm mới nhà cung cấp
            await SupplierService.saveSupplier(supplier.value);
        }
        emit("close");
        loadSuppliers();
        router.push("/supplier"); // Chuyển về trang danh sách nhà cung cấp sau khi lưu
    } catch (error) {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
    }
};

// Mở modal chỉnh sửa nhà cung cấp
const openEdit = async (supplierId) => {
    try {
        const response = await SupplierService.getSupplierById(supplierId);
        supplier.value = response;
        supplierDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải nhà cung cấp:", error);
    }
};

// Xác nhận xóa nhà cung cấp (1 nhà cung cấp)
const confirmDeleteSupplier = (selectedSupplier) => {
    supplier.value = selectedSupplier; // Gán nhà cung cấp muốn xóa vào supplier
    deleteSupplierDialog.value = true; // Hiển thị modal xác nhận xóa
};

// Sửa thông tin nhà cung cấp
const editSupplier = (supplier) => {
    openEdit(supplier.id);
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Danh Sách Tag</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedSuppliers" :disabled="!selectedSuppliers.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" />
                    </template>
                </Toolbar>

                <!-- Modal thêm/sửa nhà cung cấp -->
                <Dialog v-model:visible="supplierDialog" :style="{width: '450px'}" header="Chi tiết nhà cung cấp" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Tên của tag</label>
                        <InputText id="name" v-model="supplier.name" required="true" autofocus />
                    </div>
                    <div class="field">
                        <label for="description">Mô tả</label>
                        <Textarea id="description" v-model="supplier.description" rows="3" />
                    </div>
                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Lưu" icon="pi pi-check" class="p-button-text" @click="saveSupplier" />
                    </template>
                </Dialog>

                <DataTable
                    :value="suppliers"
                    v-model:selection="selectedSuppliers"
                    :paginator="true"
                    :first="lazyParams.page * lazyParams.size"
                    :rows="lazyParams.size"
                    :totalRecords="totalRecords"
                    :rowHover="true"
                    class="p-datatable-gridlines"
                    filterDisplay="menu"
                    v-model:filters="filters"
                    :loading="loading"
                    :lazy="true"
                    @page="onPage"
                    responsiveLayout="scroll"
                    :globalFilterFields="['name', 'description']"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} nhà cung cấp"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    :pageLinkSize="3"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="clearFilter()" />
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Tìm kiếm..." style="width: 100%" />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" header="" style="min-width: 8rem" />
                    <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
                    <Column field="name" header="Tên nhà cung cấp" sortable style="min-width: 12rem"></Column>
                    <Column field="description" header="Mô tả" sortable style="min-width: 16rem"></Column>

                    <Column :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editSupplier(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteSupplier(slotProps.data)" />
                        </template>
                    </Column>

                    <template #empty> Không tìm thấy nhà cung cấp nào. </template>
                    <template #loading> Đang tải dữ liệu... </template>
                </DataTable>

                <!-- Dialog xác nhận xóa nhà cung cấp -->
                <Dialog v-model:visible="deleteSupplierDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="supplier">Bạn có chắc chắn muốn xóa <b>{{supplier.name}}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteSupplierDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteSupplier" />
                    </template>
                </Dialog>

                <!-- Dialog xác nhận xóa các nhà cung cấp đã chọn -->
                <Dialog v-model:visible="deleteSuppliersDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="supplier">Bạn có chắc chắn muốn xóa các nhà cung cấp đã chọn?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteSuppliersDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteSelectedSuppliers" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template> 