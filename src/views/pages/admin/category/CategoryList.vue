<script setup>
import { FilterMatchMode } from "primevue/api";
import { CategoryService } from "../../../../service/CategoryService";
import { ref, onBeforeMount, watch, defineEmits } from "vue";
import { useRouter } from "vue-router";

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
        const response = await CategoryService.getAllCategories(lazyParams.value.page, lazyParams.value.size);
        categories.value = response.content;
        totalRecords.value = response.totalItems;
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
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

// Xóa danh mục
const deleteCategories = async () => {
    const selectedIds = categories.value.filter(category => category.selected).map(category => category.id);
    if (selectedIds.length === 0) {
        alert("Chưa chọn danh mục nào để xóa!");
        return;
    }
    try {
        await CategoryService.deleteCategory(selectedIds); // Gọi API xóa danh mục
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
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
        if (category.value.id) {
            await CategoryService.updateCategory(category.value.id, category.value);
        } else {
            await CategoryService.saveCategory(category.value);
        }
        emit("close");
        loadCategories();
        router.push("/category");
    } catch (error) {
        console.error("Lỗi khi lưu danh mục:", error);
    }
};

const openEdit = async (categoryId) => {
    try {
        const response = await CategoryService.getCategoryById(categoryId);
        category.value = response;
        categoryDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
    }
};

// Xóa danh mục
const deleteCategory = async () => {
    try {
        await CategoryService.deleteCategory([category.value.id]);
        deleteProductDialog.value = false;
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
    }
};

// Xóa các danh mục đã chọn
const deleteSelectedCategories = async () => {
    const selectedIds = selectedCategories.value.map(category => category.id);
    if (selectedIds.length === 0) {
        alert("Chưa chọn danh mục nào để xóa!");
        return;
    }
    try {
        await CategoryService.deleteCategory(selectedIds);
        deleteProductsDialog.value = false;
        loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
    }
};

// Mở modal xác nhận xóa
const confirmDeleteCategory = (category) => {
    category.value = category;
    deleteProductDialog.value = true;
};

const editCategory = (category) => {
    openEdit(category.id);
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Danh sách danh mục</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedCategories" :disabled="!selectedCategories.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" />
                    </template>
                </Toolbar>

                <Dialog v-model:visible="categoryDialog" :style="{width: '450px'}" header="Chi tiết danh mục" :modal="true" class="p-fluid">
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

                <DataTable
                    :value="categories"
                    v-model:selection="selectedCategories"
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
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} danh mục"
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
                    <Column field="name" header="Tên danh mục" sortable style="min-width: 12rem"></Column>
                    <Column field="description" header="Mô tả" sortable style="min-width: 16rem"></Column>

                    <Column :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editCategory(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteCategory(slotProps.data)" />
                        </template>
                    </Column>

                    <template #empty> Không tìm thấy danh mục nào. </template>
                    <template #loading> Đang tải dữ liệu... </template>
                </DataTable>

                <Dialog v-model:visible="deleteProductDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="category">Bạn có chắc chắn muốn xóa <b>{{category.name}}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteCategory" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="category">Bạn có chắc chắn muốn xóa các danh mục đã chọn?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteSelectedCategories" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
