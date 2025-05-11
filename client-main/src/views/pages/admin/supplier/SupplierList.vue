<script setup>
import { ref, onMounted, watch, defineEmits } from "vue";
import { SupplierService } from "../../../../service/SupplierService";
import { useRouter } from "vue-router";

// Khai báo các biến phản ứng (reactive variables)
const suppliers = ref([]); // Danh sách nhà cung cấp
const loading = ref(true); // Trạng thái đang tải dữ liệu
const totalRecords = ref(0); // Tổng số nhà cung cấp
const searchTerm = ref('');
const lazyParams = ref({
    page: 0,  // Trang hiện tại
    size: 5,  // Số lượng bản ghi trên mỗi trang
});
const selectedSuppliers = ref([]); // Danh sách nhà cung cấp được chọn
const supplierUpdateDialog = ref(false); // Dialog sửa nhà cung cấp
const addSupplierDialog = ref(false); // Dialog thêm nhà cung cấp
const deleteSupplierDialog = ref(false); // Dialog xác nhận xóa nhà cung cấp
const deleteSuppliersDialog = ref(false); // Dialog xác nhận xóa nhiều nhà cung cấp
const supplier = ref({ id: null, name: '', description: '' }); // Thông tin nhà cung cấp hiện tại
const newSupplier = ref({ name: "", description: "" }); // Biến lưu thông tin nhà cung cấp mới

const emit = defineEmits(); // Định nghĩa emit để truyền sự kiện ra ngoài
const router = useRouter(); // Dùng để điều hướng trang


// Hàm tải danh sách nhà cung cấp từ API
const loadSuppliers = async () => {
    loading.value = true; // Bắt đầu trạng thái loading
    try {
        const response = await SupplierService.getAllSuppliers(lazyParams.value.page, lazyParams.value.size);
        console.log("Dữ liệu API trả về:", response.data);

        // Kiểm tra nếu response.data tồn tại và là mảng
        if (Array.isArray(response.data)) {
            suppliers.value = [...response.data];
            totalRecords.value = response.data.length; // Tổng số bản ghi
        } else {
            console.error("Dữ liệu API không hợp lệ:", response.data);
            suppliers.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("Lỗi khi tải nhà cung cấp:", error);
    } finally {
        loading.value = false; // Kết thúc trạng thái loading
    }
};

// Hàm xử lý phân trang
const onPage = (event) => {
    lazyParams.value.page = event.page; // Cập nhật trang hiện tại
    lazyParams.value.size = event.rows; // Cập nhật số lượng bản ghi trên mỗi trang
    loadSuppliers(); // Tải lại dữ liệu
};

// Hàm xóa một nhà cung cấp
const deleteSupplier = async () => {
    try {
        await SupplierService.deleteSupplier([supplier.value.id]); // Gọi API xóa nhà cung cấp
        deleteSupplierDialog.value = false; // Đóng dialog xác nhận xóa
        loadSuppliers(); // Tải lại danh sách nhà cung cấp
    } catch (error) {
        console.error("Lỗi khi xóa nhà cung cấp:", error);
    }
};

// Hàm xóa các nhà cung cấp đã chọn
const deleteSelectedSuppliers = async () => {
    const selectedIds = selectedSuppliers.value.map(supplier => supplier.id); // Lấy danh sách ID các nhà cung cấp đã chọn
    if (selectedIds.length === 0) {
        alert("Chưa chọn nhà cung cấp nào để xóa!"); // Hiển thị thông báo nếu không chọn
        return;
    }
    try {
        await SupplierService.deleteSupplier(selectedIds); // Gọi API xóa nhiều nhà cung cấp
        deleteSuppliersDialog.value = false; // Đóng dialog xác nhận xóa
        loadSuppliers(); // Tải lại danh sách nhà cung cấp
    } catch (error) {
        console.error("Lỗi khi xóa các nhà cung cấp:", error);
    }
};


// Xác nhận xóa một nhà cung cấp
const confirmDeleteSupplier = (selectedSupplier) => {
    supplier.value = selectedSupplier; // Lưu thông tin nhà cung cấp cần xóa
    deleteSupplierDialog.value = true; // Hiển thị dialog xác nhận xóa
};


// Mở form thêm nhà cung cấp
const openAddDialog = () => {
    newSupplier.value = { name: "", description: "" }; // Đặt lại thông tin nhà cung cấp mới
    addSupplierDialog.value = true; // Mở dialog
};
// Đóng form thêm nhà cung cấp
const hideAddDialog = () => {
    addSupplierDialog.value = false;
};
// Thêm nhà cung cấp
const addSupplier = async () => {
    try {
        await SupplierService.saveSupplier(newSupplier.value); // Gọi API thêm nhà cung cấp
        addSupplierDialog.value = false; // Đóng dialog
        loadSuppliers(); // Tải lại danh sách
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
        const response = await SupplierService.getSupplierById(supplierId); // Lấy thông tin nhà cung cấp
        supplier.value = response.data;
        supplierUpdateDialog.value = true; // Hiển thị dialog
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
            await SupplierService.updateSupplier(supplier.value.id, supplier.value); // Cập nhật nhà cung cấp
        } else {
            await SupplierService.saveSupplier(supplier.value); // Thêm mới nhà cung cấp
        }
        supplierUpdateDialog.value = false; // Đóng dialog
        loadSuppliers(); // Tải lại danh sách nhà cung cấp
    } catch (error) {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
    }
};

// Tính năng import/export (placeholder)
const importSuppliers = () => {
    // Xử lý import
    console.log("Import function triggered");
};

const exportSuppliers = () => {
    // Xử lý export
    console.log("Export function triggered");
};

onMounted(loadSuppliers);

// Method để xóa tìm kiếm
const clearSearch = () => {
    searchTerm.value = '';
    loadSuppliers(); // Reset về danh sách ban đầu
};

// Cải thiện chức năng tìm kiếm
const searchSuppliers = async () => {
    // Kiểm tra nếu không có từ khóa tìm kiếm, tải toàn bộ danh sách nhà cung cấp
    if (!searchTerm.value.trim()) {
        await loadSuppliers(); // Hàm tải toàn bộ danh sách nhà cung cấp
        return;
    }
    
    loading.value = true; // Bắt đầu trạng thái loading
    try {
        // Gọi API tìm kiếm từ dịch vụ SupplierService
        const response = await SupplierService.findByName(searchTerm.value);
        
        // Kiểm tra cấu trúc dữ liệu trả về
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
        suppliers.value = []; // Đặt danh sách nhà cung cấp về rỗng nếu lỗi
        totalRecords.value = 0; // Đặt tổng số bản ghi về 0 nếu lỗi
    } finally {
        loading.value = false; // Kết thúc trạng thái loading
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
                        <Button label="Import" icon="pi pi-upload" class="p-button-help mr-2"
                            @click="importSuppliers" />
                        <Button label="Export" icon="pi pi-download" class="p-button-info" @click="exportSuppliers" />
                    </template>
                </Toolbar>

                <!-- Phần tìm kiếm - Sửa sự kiện từ @input sang @keyup -->
                <div class="flex justify-content-between align-items-center mb-4">
                    <Button icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="clearSearch" />
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="searchTerm" placeholder="Tìm kiếm..." @keyup="debouncedSearch" />
                    </span>
                </div>
                
               
                
                <!-- Dialog xác nhận xóa một nhà cung cấp -->
                <Dialog v-model:visible="deleteSupplierDialog" :style="{width: '450px'}" header="Xác nhận" modal>
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Bạn có chắc chắn muốn xóa nhà cung cấp <b>{{ supplier.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteSupplierDialog = false" />
                        <Button label="Có" icon="pi pi-check" class="p-button-danger" @click="deleteSupplier" />
                    </template>
                </Dialog>
                
                <!-- Dialog xác nhận xóa nhiều nhà cung cấp -->
                <Dialog v-model:visible="deleteSuppliersDialog" :style="{width: '450px'}" header="Xác nhận" modal>
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Bạn có chắc chắn muốn xóa các nhà cung cấp đã chọn?</span>
                    </div>
                    <template #footer>
                        <Button label="Không" icon="pi pi-times" class="p-button-text" @click="deleteSuppliersDialog = false" />
                        <Button label="Có" icon="pi pi-check" class="p-button-danger" @click="deleteSelectedSuppliers" />
                    </template>
                </Dialog>
                
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
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text cancel-button"
                            @click="hideAddDialog" />
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
                    :rowsPerPageOptions="[5, 10, 20, 50]" :globalFilterFields="['name', 'description']">
                    <template #header>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-xl font-semibold">Danh sách nhà cung cấp</span>
                        </div>
                    </template>
                    <Column selectionMode="multiple" headerStyle="width: 3em" />
                    <!-- <Column field="id" header="ID" sortable /> -->
                    <Column field="name" header="Tên nhà cung cấp" sortable class="nhaCungCap" />
                    <Column field="description" header="Mô tả" sortable />
                    <Column header="Hành động">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                    @click="editSupplier(slotProps.data)" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" 
                                    @click="confirmDeleteSupplier(slotProps.data)" />
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