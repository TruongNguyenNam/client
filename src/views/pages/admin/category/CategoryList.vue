<template>
    <div class="container mt-4">
        <h4 class="text-center mb-4 text-dark fw-bold">Quản Lý Danh Mục</h4>

        <div class="header-container">
            <RouterLink to="categoryadd">
                <Button label="➕ Thêm danh mục" severity="success" class="fw-bold px-3 py-2" />
            </RouterLink>

            <InputText type="text" v-model="value" variant="filled" placeholder="🔎 seach" class="seach"/>
        </div>

        <!-- PrimeVue DataTable -->
        <DataTable 
            :value="categories" 
            lazy
            paginator 
            :rows="pageSize" 
            :totalRecords="totalItems" 
            :loading="loading"
            responsiveLayout="scroll"
            class="shadow-sm"
            @page="onPageChange"
        >
            <Column field="id" header="ID" sortable class="text-center"></Column>
            <Column field="name" header="Tên Danh Mục" sortable></Column>
            <Column field="description" header="Mô Tả"></Column>
            <Column header="Hành Động" class="text-center">
                <template #body="slotProps">
                    <div class="d-flex justify-content-center gap-2">
                        <Button label="🗑" severity="danger" @click="deleteCategory(slotProps.data.id)" />
                        <Button label="✏️" severity="info" @click="updateCategory(slotProps.data.id)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Debug -->
        <div class="mt-3 text-center text-danger">
            <p>🛠 Debug: Trang {{ currentPage + 1 }} / {{ totalPages }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import router from "../../../../router";

const API_URL = "http://localhost:8080/api/v1/admin/category";
const categories = ref([]);
const currentPage = ref(0); // Trang hiện tại
const totalItems = ref(0); // Tổng số danh mục
const pageSize = 5; // Số danh mục mỗi trang
const totalPages = ref(0); // Tổng số trang
const loading = ref(false);
const toast = useToast();

// 🟢 Hàm lấy dữ liệu danh mục từ API
const loadCategories = async () => {
    try {
        loading.value = true;
        const response = await axios.get(`${API_URL}?page=${currentPage.value}&size=${pageSize}`);
        console.log("Dữ liệu API trả về:", response.data); // Debug
        categories.value = response.data.content;
        totalItems.value = response.data.totalItems; 
        totalPages.value = response.data.totalPages; 
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
    } finally {
        loading.value = false;
    }
};

// 🟢 Hàm chuyển trang
const onPageChange = (event) => {
    currentPage.value = event.page; // Cập nhật trang hiện tại
    loadCategories(); // Gọi API lấy dữ liệu mới
};

// 🟢 Hàm cập nhật danh mục
const updateCategory = (id) => {
    router.push(`/categoryedit/${id}`);
};

// 🟢 Hàm xóa danh mục
const deleteCategory = async (id) => {
    try {
        await axios.delete(`${API_URL}?id=${id}`);
        toast.add({ severity: "success", summary: "Thành công", detail: "Danh mục đã bị xóa", life: 3000 });
        await loadCategories();
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.add({ severity: "error", summary: "Lỗi", detail: "Xóa danh mục thất bại", life: 3000 });
    }
};

// Gọi API khi trang được tải
onMounted(loadCategories);
</script>

<style scoped>
/* Hiệu ứng hover trên PrimeVue DataTable */
.p-datatable tbody tr:hover {
    background-color: #f1f3f5 !important;
}
.header-container{
    width: 100%;
    height: 70px;
    margin-bottom: 40px;
    background-color: #f1f3f5;
    
}
          
.seach{
margin-left: 700px;
margin-top: 16px;
line-height: 10px;
}
.fw-bold{
    margin-left: 10px;
    border-radius: 5px;
}
</style>
