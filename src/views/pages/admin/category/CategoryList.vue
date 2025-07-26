<script setup>
import { FilterMatchMode } from "primevue/api";
import { CategoryService } from "../../../../service/admin/CategoryService";
import { ref, onBeforeMount, watch, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { exportToExcel, importFromExcel } from '@/utils/excel';
const exportCategories = () => {
    if (!categories.value.length) {
        toast.add({ severity: 'warn', summary: 'Thông báo', detail: 'Không có danh mục để xuất', life: 3000 });
        return;
    }

    const exportData = categories.value.map((cat) => ({
        'ID': cat.id,
        'Tên danh mục': cat.name,
        'Mô tả': cat.description,
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToExcel(exportData, `Danh_muc_${today}`, 'DanhMuc');
};
const handleExcelUpload = async (event) => {
    const file = event.files?.[0];
    if (!file) {
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Không có file được chọn', life: 3000 });
        return;
    }

    try {
        const jsonData = await importFromExcel(file);

        const imported = jsonData
            .map((item) => ({
                name: item['Tên danh mục']?.trim() || '',
                description: item['Mô tả']?.trim() || '',
            }))
            .filter(item => item.name && item.description);

        // Danh sách tên đã có (toLowerCase để so trùng không phân biệt hoa thường)
        const existingNames = categories.value.map(cat => cat.name.trim().toLowerCase());

        // Lọc ra các mục KHÔNG bị trùng tên
        const validItems = imported.filter(item => {
            return !existingNames.includes(item.name.toLowerCase());
        });

        const duplicatedItems = imported.length - validItems.length;

        // Thêm danh mục hợp lệ
        for (const item of validItems) {
            try {
                await CategoryService.addCategory(item);
            } catch (err) {
                console.error('Lỗi khi thêm:', item, err);
            }
        }

        // Thông báo kết quả
        if (validItems.length > 0) {
            toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã nhập ${validItems.length} danh mục${duplicatedItems > 0 ? ` (bỏ qua ${duplicatedItems} danh mục trùng tên)` : ''}`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Tất cả các danh mục trong file đều đã tồn tại!',
                life: 3000
            });
        }

        loadCategories();
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi đọc file Excel', life: 3000 });
        console.error(err);
    }
};

const downloadTemplate = () => {
    const templateData = [
        { 'Tên danh mục': 'Ví dụ 1', 'Mô tả': 'Mô tả ví dụ 1' },
        { 'Tên danh mục': 'Ví dụ 2', 'Mô tả': 'Mô tả ví dụ 2' }
    ];
    exportToExcel(templateData, 'Mau_danh_muc', 'Template');
};
const toast = useToast();

const categories = ref([]);
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

// Khai báo các ref
const categoryDialog = ref(false);
const category = ref({
    name: '',
    description: ''
});
const selectedCategories = ref([]);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);

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

// Load danh mục từ API
const loadCategories = async () => {
    loading.value = true;
    try {
        const searchQuery = filters.value.global.value?.trim() || '';
        let response;

        if (searchQuery) {
            response = await CategoryService.findByName(searchQuery);
        } else {
            response = await CategoryService.getAllCategories(lazyParams.value.page, lazyParams.value.size);
        }

        if (response?.data) {
            categories.value = response.data;
            totalRecords.value = response.totalRecords ?? response.data.length;
        } else {
            console.error("Dữ liệu API không hợp lệ:", response);
            categories.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi tải danh mục', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Xử lý phân trang
const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    loadCategories();
};

// Watch filters
watch(() => filters.value.global.value, () => {
    lazyParams.value.page = 0;
    loadCategories();
});

// Khởi tạo dữ liệu
onBeforeMount(() => {
    initFilters();
    loadCategories();
});

// Xóa danh mục nhiều mục
const deleteCategories = async () => {
    const selectedIds = categories.value.filter(category => category.selected).map(category => category.id);
    if (selectedIds.length === 0) {
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Chưa chọn danh mục nào để xóa!', life: 3000 });
        return;
    }
    try {
        await CategoryService.deleteCategory(selectedIds);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa danh mục thành công', life: 3000 });
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi xóa danh mục', life: 3000 });
    }
};

// Thêm các hàm cho modal
const openNew = () => {
    category.value = { name: '', description: '' };
    categoryDialog.value = true;
};

const hideDialog = () => {
    categoryDialog.value = false;
};

const saveCategory = async () => {
    try {
        const trimmedName = category.value.name.trim();
        const trimmedDescription = category.value.description.trim();

        if (!trimmedName) {
            toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Tên danh mục không được để trống', life: 3000 });
            return;
        }

        // if (!trimmedDescription) {
        //     toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Mô tả danh mục không được để trống', life: 3000 });
        //     return;
        // }

        const isDuplicate = isDuplicateCategoryName(trimmedName, category.value.id);

        if (isDuplicate) {
            toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Tên danh mục đã tồn tại. Vui lòng chọn tên khác.', life: 3000 });
            return;
        }

        if (category.value.id) {
            await CategoryService.updateCategory(category.value.id, {
                name: trimmedName,
                description: trimmedDescription,
            });
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật danh mục thành công', life: 3000 });
        } else {
            await CategoryService.addCategory({
                name: trimmedName,
                description: trimmedDescription,
            });
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm danh mục thành công', life: 3000 });
        }

        hideDialog();
        loadCategories();

    } catch (error) {
        console.error("Lỗi khi lưu danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lưu danh mục thất bại', life: 3000 });
    }
};

const openEdit = async (categoryId) => {
    try {
        const response = await CategoryService.getCategoryById(categoryId);
        category.value = { ...response.data };
        categoryDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi tải danh mục', life: 3000 });
    }
};

// Xóa danh mục đơn
const deleteCategory = async () => {
    try {
        await CategoryService.deleteCategory([category.value.id]);
        deleteProductDialog.value = false;
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa danh mục thành công', life: 3000 });
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi xóa danh mục', life: 3000 });
    }
};

// Xóa các danh mục đã chọn
const deleteSelectedCategories = async () => {
    const selectedIds = selectedCategories.value.map(category => category.id);
    if (selectedIds.length === 0) {
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Chưa chọn danh mục nào để xóa!', life: 3000 });
        return;
    }
    try {
        await CategoryService.deleteCategory(selectedIds);
        deleteProductsDialog.value = false;
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa danh mục thành công', life: 3000 });
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi xóa danh mục', life: 3000 });
    }
};

// Mở modal xác nhận xóa
const confirmDeleteCategory = (cat) => {
    category.value = cat;
    deleteProductDialog.value = true;
};

const editCategory = (categoryData) => {
    openEdit(categoryData.id);
};

//check trùng
const isDuplicateCategoryName = (name, excludeId = null) => {
    return categories.value.some((cat) =>
        cat.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        cat.id !== excludeId
    );
};

</script>

<template>
    <div class="grid">
        <Toast />
        <div class="col-12">
            <div class="card">
                <h5>Danh sách danh mục</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Thêm Mới" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Tải mẫu" icon="pi pi-download" class="p-button-secondary mr-2"
                            @click="downloadTemplate" /> 
                        <!-- Nhập Excel -->
                        <FileUpload mode="basic" accept=".xlsx, .xls" :auto="true" chooseLabel="Nhập Excel"
                            @select="handleExcelUpload" class="mr-2 inline-block" />

                        <Button label="Xuất Excel" icon="pi pi-upload" class="p-button-help" @click="exportCategories" />

                    </template>
                </Toolbar>

                <Dialog v-model:visible="categoryDialog" :style="{ width: '450px' }" header="Chi tiết danh mục"
                    :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Tên danh mục</label>
                        <InputText id="name" v-model="category.name" required="true" autofocus />
                    </div>
                    <div class="field">
                        <label for="description">Mô tả</label>
                        <Textarea id="description" v-model="category.description" rows="3" />
                    </div>
                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Lưu" icon="pi pi-check" class="p-button-text" @click="saveCategory" />
                    </template>
                </Dialog>

                <DataTable :value="categories" v-model:selection="selectedCategories" :paginator="true"
                    :first="lazyParams.page * lazyParams.size" :rows="lazyParams.size" :totalRecords="totalRecords"
                    :rowHover="true" class="p-datatable-gridlines" filterDisplay="menu" v-model:filters="filters"
                    :loading="loading" :lazy="false" @page="onPage" responsiveLayout="scroll"
                    :globalFilterFields="['name', 'description']" :rowsPerPageOptions="[5, 10, 20, 50]"
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} danh mục"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    :pageLinkSize="3">
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2"
                                @click="clearFilter()" />
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Tìm kiếm..."
                                    style="width: 100%" />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" header="" style="min-width: 1rem" />
                    <Column header="STT" style="width: 4rem">
                        <template #body="slotProps">
                        {{ lazyParams.page * lazyParams.size + slotProps.index + 1 }}
                        </template>
                    </Column>
                    <!-- <Column field="id" header="ID" sortable style="min-width: 5rem"></Column> -->
                    <Column field="name" header="Tên danh mục" sortable style="min-width: 12rem"></Column>
                    <Column field="description" header="Mô tả" sortable style="min-width: 16rem"></Column>

                    <Column field="action" header="Thao Tác" :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editCategory(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger"
                                @click="confirmDeleteCategory(slotProps.data)" />
                        </template>
                    </Column>

                    <template #empty> Không tìm thấy danh mục nào. </template>
                    <template #loading> Đang tải dữ liệu... </template>
                </DataTable>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Xác nhận"
                    :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="category">Bạn có chắc chắn muốn xóa <b>{{ category.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text"
                            @click="deleteProductDialog = false" />
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteCategory" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Xác nhận"
                    :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="category">Bạn có chắc chắn muốn xóa các danh mục đã chọn?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text"
                            @click="deleteProductsDialog = false" />
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteSelectedCategories" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
