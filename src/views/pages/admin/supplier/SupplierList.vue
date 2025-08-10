```vue
<script setup>
import { ref, onMounted, watch, defineEmits } from "vue";
import { SupplierService } from "../../../../service/admin/SupplierService";
import { useRouter } from "vue-router";
import { exportToExcel, importFromExcel, downloadExcelTemplate } from '@/utils/excel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const submitted = ref(false); // For form validation feedback

// Export file Excel nhà cung cấp
const exportSuppliers = () => {
    if (!suppliers.value.length) {
        toast.add({ severity: 'warn', summary: 'Thông báo', detail: 'Không có dữ liệu để xuất.', life: 3000 });
        return;
    }

    const data = suppliers.value.map(supplier => ({
        Name: supplier.name.trim(),
        Description: supplier.description?.trim() || ''
    }));

    exportToExcel(data, 'DanhSachNhaCungCap');
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất Excel thành công', life: 3000 });
};

// Tải file mẫu Excel
const downloadSupplierTemplate = () => {
    downloadExcelTemplate(['Name', 'Description'], 'Template_Supplier');
};

// Import Excel
const importSuppliers = async (event) => {
    const file = event.files?.[0];
    if (!file) {
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn file Excel.', life: 3000 });
        return;
    }

    try {
        const importedData = await importFromExcel(file);
        let added = 0;
        const existingNames = new Set(suppliers.value.map(s => s.name.trim().toLowerCase()));
        const duplicatedNames = [];

        for (const item of importedData) {
            if (item.Name) {
                const name = item.Name.trim();
                const description = item.Description?.trim() || '';

                if (!existingNames.has(name.toLowerCase())) {
                    const supplierData = { name, description };
                    await SupplierService.saveSupplier(supplierData);
                    existingNames.add(name.toLowerCase());
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

const suppliers = ref([]);
const loading = ref(true);
const totalRecords = ref(0);
const searchTerm = ref('');
const lazyParams = ref({
    page: 0,
    size: 5,
});
const selectedSuppliers = ref([]);
const supplierUpdateDialog = ref(false);
const addSupplierDialog = ref(false);
const supplier = ref({ id: null, name: '', description: '' });
const newSupplier = ref({ name: "", description: "" });

const emit = defineEmits();
const router = useRouter();

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
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi tải danh sách nhà cung cấp.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    loadSuppliers();
};

const openAddDialog = () => {
    newSupplier.value = { name: "", description: "" };
    submitted.value = false;
    addSupplierDialog.value = true;
};

const hideAddDialog = () => {
    addSupplierDialog.value = false;
    submitted.value = false;
};

const addSupplier = async () => {
    submitted.value = true;
    const trimmedName = newSupplier.value.name.trim();
    const trimmedDescription = newSupplier.value.description.trim();

    if (!trimmedName) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Tên nhà cung cấp không được để trống.',
            life: 3000
        });
        return;
    }

    const existingNames = new Set(suppliers.value.map(s => s.name.trim().toLowerCase()));
    if (existingNames.has(trimmedName.toLowerCase())) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: `Nhà cung cấp "${trimmedName}" đã tồn tại.`,
            life: 3000
        });
        return;
    }

    try {
        await SupplierService.saveSupplier({
            name: trimmedName,
            description: trimmedDescription
        });
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Thêm nhà cung cấp thành công.',
            life: 3000
        });
        addSupplierDialog.value = false;
        submitted.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi thêm nhà cung cấp:", error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Thêm nhà cung cấp thất bại.',
            life: 3000
        });
    }
};

const editSupplier = (supplier) => {
    openEdit(supplier.id);
};

const openEdit = async (supplierId) => {
    try {
        const response = await SupplierService.getSupplierById(supplierId);
        supplier.value = response.data;
        submitted.value = false;
        supplierUpdateDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải thông tin nhà cung cấp:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi tải thông tin nhà cung cấp.', life: 3000 });
    }
};

const hideUpdateDialog = () => {
    supplierUpdateDialog.value = false;
    supplier.value = { id: null, name: '', description: '' };
    submitted.value = false;
};

const saveSupplier = async () => {
    submitted.value = true;
    const trimmedName = supplier.value.name.trim();
    const trimmedDescription = supplier.value.description.trim();

    if (!trimmedName) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Tên nhà cung cấp không được để trống.',
            life: 3000
        });
        return;
    }

    const existingNames = new Set(
        suppliers.value
            .filter(s => s.id !== supplier.value.id)
            .map(s => s.name.trim().toLowerCase())
    );

    if (existingNames.has(trimmedName.toLowerCase())) {
        toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: `Nhà cung cấp "${trimmedName}" đã tồn tại.`,
            life: 3000
        });
        return;
    }

    try {
        if (supplier.value.id) {
            await SupplierService.updateSupplier(supplier.value.id, {
                name: trimmedName,
                description: trimmedDescription
            });
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật nhà cung cấp thành công.',
                life: 3000
            });
        } else {
            await SupplierService.saveSupplier({
                name: trimmedName,
                description: trimmedDescription
            });
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Thêm nhà cung cấp thành công.',
                life: 3000
            });
        }
        supplierUpdateDialog.value = false;
        submitted.value = false;
        loadSuppliers();
    } catch (error) {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Lưu nhà cung cấp thất bại.',
            life: 3000
        });
    }
};

const clearSearch = () => {
    searchTerm.value = '';
    loadSuppliers();
};

const searchSuppliers = async () => {
    if (!searchTerm.value.trim()) {
        await loadSuppliers();
        return;
    }
    loading.value = true;
    try {
        const response = await SupplierService.findByName(searchTerm.value.trim());
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
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi tìm kiếm nhà cung cấp.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

let searchTimeout = null;
const debouncedSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        searchSuppliers();
    }, 500);
};

onMounted(loadSuppliers);
</script>

<template>
    <div class="grid">
        <Toast />
        <div class="col-12">
            <div class="card">
                <h5>Danh sách nhà cung cấp</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <Button label="Thêm Mới" icon="pi pi-plus" class="p-button-success mr-2" @click="openAddDialog" />
                    </template>
                    <template v-slot:end>
                        <Button label="Tải mẫu" icon="pi pi-download" class="p-button-secondary mr-2"
                            @click="downloadSupplierTemplate" />
                        <FileUpload mode="basic" accept=".xlsx" :maxFileSize="1000000" chooseLabel="Nhập Excel"
                            class="mr-2 inline-block" @select="importSuppliers" :auto="true" />
                        <Button label="Xuất Excel" icon="pi pi-upload" class="p-button-help" @click="exportSuppliers" />
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

                <!-- <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Tìm kiếm..."
                                    style="width: 100%" />
                            </span> -->

                <!-- Modal Thêm Nhà Cung Cấp -->
                <Dialog v-model:visible="addSupplierDialog" :style="{ width: '500px' }" header="Thêm Nhà Cung Cấp" modal
                    class="custom-dialog">
                    <div class="form-container">
                        <!-- Tên nhà cung cấp -->
                        <div class="field">
                            <label for="add-name" class="field-label">Tên nhà cung cấp</label>
                            <span class="p-input-icon-left">
                                <InputText id="add-name" v-model="newSupplier.name" placeholder="Nhập tên nhà cung cấp"
                                    required autofocus class="field-input"
                                    :maxlength="30"
                                    :class="{ 'p-invalid': submitted && !newSupplier.name.trim() }" />
                            </span>
                            <small class="p-error" v-if="submitted && !newSupplier.name.trim()">Tên nhà cung cấp không được để trống</small>
                        </div>

                        <!-- Mô tả -->
                        <div class="field">
                            <label for="add-description" class="field-label">Mô tả</label>
                            <span class="p-input-icon-left">
                                <Textarea id="add-description" v-model="newSupplier.description" rows="3"
                                placeholder="Nhập mô tả" class="field-textarea" :maxlength="255" />
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideAddDialog" />
                        <Button label="Thêm" icon="pi pi-check" class="p-button-primary save-button"
                            @click="addSupplier" />
                    </template>
                </Dialog>

                <!-- Modal Sửa Nhà Cung Cấp -->
                <Dialog v-model:visible="supplierUpdateDialog" :style="{ width: '500px' }" header="Chi tiết nhà cung cấp"
                    modal class="custom-dialog">
                    <div class="form-container">
                        <!-- Tên nhà cung cấp -->
                        <div class="field">
                            <label for="name" class="field-label">Tên nhà cung cấp</label>
                            <span class="p-input-icon-left">
                                <InputText id="name" v-model="supplier.name" placeholder="Nhập tên nhà cung cấp"
                                    required autofocus class="field-input" :maxlength="30"
                                    :class="{ 'p-invalid': submitted && !supplier.name.trim() }" />
                            </span>
                            <small class="p-error" v-if="submitted && !supplier.name.trim()">Tên nhà cung cấp không được để trống</small>
                        </div>

                        <!-- Mô tả -->
                        <div class="field">
                            <label for="description" class="field-label">Mô tả</label>
                            <span class="p-input-icon-left">
                                <!-- <Textarea id="description" v-model="supplier.description" rows="3"
                                    placeholder="Nhập mô tả" class="field-textarea" :maxlength="255"
                                    :class="{ 'p-invalid': submitted && !supplier.description.trim() }" /> -->
                                    <Textarea id="description" v-model="supplier.description" rows="3"
                                        placeholder="Nhập mô tả" class="field-textarea" :maxlength="255" />
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <!-- <Button label="Hủy" icon="pi pi-times" class="p-button-text cancel-button"
                            @click="hideUpdateDialog" />
                        <Button label="Sửa" icon="pi pi-check" class="p-button-primary save-button"
                            @click="saveSupplier" /> -->

                            <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideUpdateDialog" />
                            <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="saveSupplier" />
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
                    <Column header="STT" style="width: 4rem">
                        <template #body="slotProps">
                            {{ lazyParams.page * lazyParams.size + slotProps.index + 1 }}
                        </template>
                    </Column>
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

:deep(.p-invalid) {
    border-color: #f44336 !important;
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
```