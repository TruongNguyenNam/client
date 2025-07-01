<script setup>
import { ref, onBeforeMount, watch, defineEmits } from "vue";
import { ProductTagService } from "../../../../service/admin/ProductTagService";
import { FilterMatchMode } from "primevue/api";
import { useRouter } from "vue-router";
import Toast from "primevue/toast";

const tags = ref([]);
const loading = ref(true);
const totalRecords = ref(0);

const lazyParams = ref({
    page: 0,
    size: 5,
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const tagDialog = ref(false);
const tag = ref({
    id: null,
    name: '',
    description: '' // Thêm description vào đây
});
const selectedTags = ref([]);
const deleteTagDialog = ref(false);
const deleteTagsDialog = ref(false);

const toast = ref(null);

const emit = defineEmits();
const router = useRouter();

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    };
};

const loadTags = async () => {
    loading.value = true;
    try {
        const response = await ProductTagService.getAllTags();
        tags.value = response.data;
        totalRecords.value = response.data.length;
    } catch (error) {
        console.error("Lỗi khi tải danh sách tag:", error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    loadTags();
};

watch(() => filters.value.global.value, () => {
    lazyParams.value.page = 0;
    loadTags();
});

onBeforeMount(() => {
    initFilters();
    loadTags();
});

const deleteTag = async () => {
    try {
        deleteTagDialog.value = false;
        // Bạn nhớ gọi API xóa ở đây nếu có nhé
        await loadTags();
    } catch (error) {
        console.error("Lỗi khi xóa tag:", error);
    }
};

const deleteSelectedTags = async () => {
    const selectedIds = selectedTags.value.map(tag => tag.id);
    if (selectedIds.length === 0) {
        toast.value.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Chưa chọn tag nào để xóa!', life: 3000 });
        return;
    }
    try {
        deleteTagsDialog.value = false;
        // Bạn nhớ gọi API xóa nhiều tag ở đây nếu có nhé
        await loadTags();
    } catch (error) {
        console.error("Lỗi khi xóa các tag:", error);
    }
};

const openNew = () => {
    tag.value = { id: null, name: '', description: '' }; 
    tagDialog.value = true;
};

const hideDialog = () => {
    tagDialog.value = false;
};

const isDuplicateName = (name, id = null) => {
    if (!name) return false;
    return tags.value.some(
        t => t.name.trim().toLowerCase() === name.trim().toLowerCase() && t.id !== id
    );
};

const saveTag = async () => {
    const name = tag.value.name?.trim();

    if (!name) {
        toast.value.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên tag không được để trống', life: 3000 });
        return;
    }

    if (isDuplicateName(name, tag.value.id)) {
        toast.value.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên tag đã tồn tại', life: 3000 });
        return;
    }

    try {
        if (tag.value.id) {
            // Cập nhật
            await ProductTagService.updateProductTag(tag.value.id, tag.value);
            toast.value.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật tag thành công', life: 3000 });
        } else {
            // Thêm mới
            await ProductTagService.addProductTag(tag.value);
            toast.value.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm tag thành công', life: 3000 });
        }
        emit("close");
        await loadTags();
        tagDialog.value = false; // đóng dialog sau khi thêm/cập nhật
    } catch (error) {
        console.error("Lỗi khi lưu tag:", error);
        toast.value.add({ severity: 'error', summary: 'Lỗi', detail: 'Lưu tag thất bại', life: 3000 });
    }
};

const openEdit = async (tagId) => {
    try {
        const response = await ProductTagService.getTagById(tagId);
        tag.value = response.data;
        tagDialog.value = true;
    } catch (error) {
        console.error("Lỗi khi tải tag:", error);
    }
};

const editTag = (tagItem) => {
    openEdit(tagItem.id);
};

const confirmDeleteTag = (selectedTag) => {
    tag.value = selectedTag;
    deleteTagDialog.value = true;
};
</script>

<template>
    <div class="grid">
        <Toast ref="toast" />
        <div class="col-12">
            <div class="card">
                <h5>Danh Sách Tag</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedTags" :disabled="!selectedTags.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" />
                    </template>
                </Toolbar>

                <!-- Modal thêm/sửa tag -->
                <Dialog v-model:visible="tagDialog" :style="{width: '450px'}" header="Chi tiết Tag" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Tên của tag</label>
                        <InputText id="name" v-model="tag.name" required autofocus />
                    </div>
                    <div class="field">
                        <label for="description">Mô tả</label>
                        <Textarea id="description" v-model="tag.description" autoResize rows="3" />
                    </div>
                    <template #footer>
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Lưu" icon="pi pi-check" class="p-button-text" @click="saveTag" />
                    </template>
                </Dialog>

                <DataTable
                    :value="tags"
                    v-model:selection="selectedTags"
                    :paginator="true"
                    :first="lazyParams.page * lazyParams.size"
                    :rows="lazyParams.size"
                    :totalRecords="totalRecords"
                    :rowHover="true"
                    class="p-datatable-gridlines"
                    filterDisplay="menu"
                    v-model:filters="filters"
                    :loading="loading"
                    :lazy="false"
                    @page="onPage"
                    responsiveLayout="scroll"
                    :globalFilterFields="['name']"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} tag"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    :pageLinkSize="3"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="initFilters()" />
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Tìm kiếm..." style="width: 100%" />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" header="" style="min-width: 3rem" />
                    <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
                    <Column field="name" header="Tên Tag" sortable style="min-width: 12rem"></Column>
                    <Column field="description" header="Mô tả" sortable style="min-width: 20rem"></Column>

                    <Column field="action" header="Thao Tác" :exportable="false" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editTag(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteTag(slotProps.data)" />
                        </template>
                    </Column>

                    <template #empty> Không tìm thấy tag nào. </template>
                    <template #loading> Đang tải dữ liệu... </template>
                </DataTable>

                <!-- Dialog xác nhận xóa tag -->
                <Dialog v-model:visible="deleteTagDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="tag">Bạn có chắc chắn muốn xóa <b>{{tag.name}}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteTagDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteTag" />
                    </template>
                </Dialog>

                <!-- Dialog xác nhận xóa các tag đã chọn -->
                <Dialog v-model:visible="deleteTagsDialog" :style="{width: '450px'}" header="Xác nhận" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Bạn có chắc chắn muốn xóa các tag đã chọn?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteTagsDialog = false"/>
                        <Button label="Có" icon="pi pi-check" class="p-button-text" @click="deleteSelectedTags" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
