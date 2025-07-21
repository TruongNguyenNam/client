<script setup>
import { ref, onMounted, watch, defineEmits } from "vue";
import { SupplierService } from "../../../../service/admin/SupplierService";
import { useRouter } from "vue-router";
import { exportToExcel, importFromExcel, downloadExcelTemplate } from '@/utils/excel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Export file Excel nhà cung cấp
const exportSupplierss = () => {
    if (!suppliers.value.length) {
        toast.add({ severity: 'warn', summary: 'Thông báo', detail: 'Không có dữ liệu để xuất.', life: 3000 });
        return;
    }

    const data = suppliers.value.map(supplier => ({
        Name: supplier.name,
        Description: supplier.description
    }));

    exportToExcel(data, 'DanhSachNhaCungCap');
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất Excel thành công', life: 3000 });
};


// Tải file mẫu Excel
const downloadSupplierTemplate = () => {
    downloadExcelTemplate(['Name', 'Description'], 'Template_Supplier');
};

const importSupplierss = async (event) => {
    const file = event.files?.[0];
    if (!file) return;

    try {
        const importedData = await importFromExcel(file);
        let added = 0;

        const existingNames = suppliers.value.map(s => s.name.trim().toLowerCase());
        const duplicatedNames = [];

        for (const item of importedData) {
            if (item.Name) {
                const name = item.Name.trim();
                const description = item.Description || '';

                if (!existingNames.includes(name.toLowerCase())) {
                    const supplierData = { name, description };
                    await SupplierService.saveSupplier(supplierData);
                    added++;
                } else {
                    duplicatedNames.push(name);
                }
            }
        }

        if (added > 0) {
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã thêm ${added} nhà cung cấp từ Excel.`,
                life: 4000
            });
        }

        if (duplicatedNames.length > 0) {
            toast.add({
                severity: 'warn',
                summary: 'Trùng tên',
                detail: `Bỏ qua ${duplicatedNames.length} nhà cung cấp trùng tên: ${duplicatedNames.join(', ')}`,
                life: 5000
            });
        }

        await loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi import Excel:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Import thất bại.', life: 4000 });
    }
};


const suppliers = ref([]); // Danh sách nhà cung cấp
const loading = ref(true); // Trạng thái đang tải dữ liệu
const totalRecords = ref(0); // Tổng số nhà cung cấp
const searchTerm = ref('');
const lazyParams = ref({
    page: 0,
    size: 5,
});
const selectedSuppliers = ref([]); // Danh sách nhà cung cấp được chọn
const supplierUpdateDialog = ref(false); // Dialog sửa nhà cung cấp
const addSupplierDialog = ref(false); // Dialog thêm nhà cung cấp
const supplier = ref({ id: null, name: '', description: '' }); // Thông tin nhà cung cấp hiện tại
const newSupplier = ref({ name: "", description: "" }); // Biến lưu thông tin nhà cung cấp mới

const emit = defineEmits(); // Định nghĩa emit để truyền sự kiện ra ngoài
const router = useRouter(); // Dùng để điều hướng trang

// Hàm tải danh sách nhà cung cấp từ API
const loadSuppliers = async () => {
    loading.value = true;
    try {
        const response = await SupplierService.getAllSuppliers(lazyParams.value.page, lazyParams.value.size);
        console.log("Dữ liệu API trả về:", response.data);
        if (Array.isArray(response.data)) {
            suppliers.value = [...response.data];
            totalRecords.value = response.data.length;
        } else {
            console.error("Dữ liệu API không hợp lệ:", response.data);
            suppliers.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("Lỗi khi tải nhà cung cấp:", error);
    } finally {
        loading.value = false;
    }
};

// Hàm xử lý phân trang
const onPage = (event) => {
    lazyParams.value.page = event.page; // Cập nhật trang hiện tại
    lazyParams.value.size = event.rows; // Cập nhật số lượng bản ghi trên mỗi trang
    loadSuppliers();
};


// Mở form thêm nhà cung cấp
const openAddDialog = () => {
    newSupplier.value = { name: "", description: "" }; // Đặt lại thông tin nhà cung cấp mới
    addSupplierDialog.value = true;
};
// Đóng form thêm nhà cung cấp
const hideAddDialog = () => {
    addSupplierDialog.value = false;
};
// Thêm nhà cung cấp
const addSupplier = async () => {
    try {
        console.log("Dữ liệu gửi đi:", newSupplier.value);
        await SupplierService.saveSupplier(newSupplier.value);
        addSupplierDialog.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi thêm nhà cung cấp:", error);
    }
};
// Mở dialog chỉnh sửa nhà cung cấp
const editSupplier = (supplier) => {
    openEdit(supplier.id); // Mở dialog chỉnh sửa
};

// Mở dialog chỉnh sửa nhà cung cấp
const openEdit = async (supplierId) => {
    try {
        const response = await SupplierService.getSupplierById(supplierId);
        supplier.value = response.data;
        supplierUpdateDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải thông tin nhà cung cấp:", error);
    }
};
// Ẩn dialog sửa
const hideUpdateDialog = () => {
    supplierUpdateDialog.value = false;
    supplier.value = { id: null, name: '', description: '' }; // Reset thông tin nhà cung cấp
};

// Hàm sửa nhà cung cấp
const saveSupplier = async () => {
    try {
        if (supplier.value.id) {
            await SupplierService.updateSupplier(supplier.value.id, supplier.value);
        } else {
            await SupplierService.saveSupplier(supplier.value);
        }
        supplierUpdateDialog.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
    }
};

// Tính năng import/export (placeholder)
const importSuppliers = () => {

    console.log("Import function triggered");
};

const exportSuppliers = () => {
    console.log("Export function triggered");
};

onMounted(loadSuppliers);

// Method để xóa tìm kiếm
const clearSearch = () => {
    searchTerm.value = '';
    loadSuppliers(); // Reset về danh sách ban đầu
};

const searchSuppliers = async () => {
    if (!searchTerm.value.trim()) {
        await loadSuppliers();
        return;
    }
    loading.value = true; // Bắt đầu trạng thái loading
    try {
        const response = await SupplierService.findByName(searchTerm.value);
        console.log("Kết quả tìm kiếm:", response);
        if (response && response.data) {
            suppliers.value = Array.isArray(response.data) ? response.data : [response.data];
            totalRecords.value = suppliers.value.length;
        } else {
            suppliers.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm nhà cung cấp:", error);
        suppliers.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

// Thêm debounce cho tìm kiếm để tránh gọi API quá nhiều lần
let searchTimeout = null;
const debouncedSearch = (event) => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        searchSuppliers();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
};
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Danh sách nhà cung cấp</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openAddDialog" />
                        <Button label="Delete" icon="pi pi-trash" class="p-button-danger"
                            @click="deleteSelectedSuppliers" :disabled="!selectedSuppliers.length" />
                    </template>
                    <template v-slot:end>
                        <Button label="Tải mẫu" icon="pi pi-download" class="p-button-secondary mr-2"
                            @click="downloadSupplierTemplate" />

                        <FileUpload mode="basic" accept=".xlsx" :maxFileSize="1000000" chooseLabel="Import Excel"
                            class="mr-2 inline-block" @select="importSupplierss" :auto="true" />

                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportSupplierss" />
                    </template>

                </Toolbar>
                <!-- Phần tìm kiếm -->
                <div class="flex align-items-center justify-content-between mb-4">

                    <Button icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mr-2"
                        @click="clearSearch" />
                    <div class="flex ml-auto search-bar">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <InputText v-model="searchTerm" placeholder="Tìm kiếm..." @keyup="debouncedSearch" />
                        </span>
                    </div>
                </div>

                <!-- Modal Thêm Nhà Cung Cấp -->
                <Dialog v-model:visible="addSupplierDialog" :style="{ width: '500px' }" header="Thêm Nhà Cung Cấp" modal
                    class="custom-dialog">

                    <div class="form-container">
                        <!-- Tên nhà cung cấp -->
                        <div class="field">
                            <label for="add-name" class="field-label">Tên nhà cung cấp</label>
                            <span class="p-input-icon-left">
                                <InputText id="add-name" v-model="newSupplier.name" placeholder="Nhập tên nhà cung cấp"
                                    required autofocus class="field-input" />
                            </span>
                        </div>

                        <!-- Mô tả -->
                        <div class="field">
                            <label for="add-description" class="field-label">Mô tả</label>
                            <span class="p-input-icon-left">
                                <Textarea id="add-description" v-model="newSupplier.description" rows="3"
                                    placeholder="Nhập mô tả" class="field-textarea" />
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <!-- Nút Hủy -->
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideAddDialog" />
                        <!-- Nút Thêm -->
                        <Button label="Thêm" icon="pi pi-check" class="p-button-primary save-button"
                            @click="addSupplier" />
                    </template>
                </Dialog>
                <!-- Modal sửa nhà cung cấp -->

                <Dialog v-model:visible="supplierUpdateDialog" :style="{ width: '500px' }"
                    header="Chi tiết nhà cung cấp" modal class="custom-dialog">

                    <div class="form-container">
                        <!-- Tên nhà cung cấp -->
                        <div class="field">
                            <label for="name" class="field-label">Tên nhà cung cấp</label>
                            <span class="p-input-icon-left">
                                <InputText id="name" v-model="supplier.name" placeholder="Nhập tên nhà cung cấp"
                                    required autofocus class="field-input" />
                            </span>
                        </div>

                        <!-- Mô tả -->
                        <div class="field">
                            <label for="description" class="field-label">Mô tả</label>
                            <span class="p-input-icon-left">
                                <Textarea id="description" v-model="supplier.description" rows="3"
                                    placeholder="Nhập mô tả" class="field-textarea" />
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <!-- Nút Hủy -->
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text cancel-button"
                            @click="hideUpdateDialog" />
                        <!-- Nút Sửa -->
                        <Button label="Sửa" icon="pi pi-check" class="p-button-primary save-button"
                            @click="saveSupplier" />
                    </template>
                </Dialog>

                <!-- Bảng hiển thị danh sách nhà cung cấp -->
                <DataTable v-model:selection="selectedSuppliers" :value="suppliers" :paginator="true"
                    :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
                    emptyMessage="Không tìm thấy nhà cung cấp nào." :loading="loading" @page="onPage"
                    :rowsPerPageOptions="[5, 10, 20, 50]" :globalFilterFields="['name', 'description']"
                    class="p-datatable-gridlines" :rowHover="true">
                    <template #header>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-xl font-semibold">Danh sách nhà cung cấp</span>
                        </div>
                    </template>
                    <Column selectionMode="multiple" headerStyle="width: 3em" />
                    <!-- <Column field="id" header="ID" sortable /> -->
                    <Column field="name" header="Tên nhà cung cấp" sortable class="nhaCungCap" />
                    <Column field="description" header="Mô tả" sortable />
                    <Column field="action" header="Thao Tác" :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                    @click="editSupplier(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.nhaCungCap {
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

.search-bar {
    margin-left: auto;
    width: 300px;
    display: flex;
    align-items: center;
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