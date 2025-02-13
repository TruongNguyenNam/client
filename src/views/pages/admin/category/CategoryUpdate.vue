<template>
    <div class="container mt-4">
        <h2 class="text-center mb-4 text-primary">Cập Nhật Danh Mục</h2>

        <form @submit.prevent="updateCategory">
            <div class="mb-3">
                <label class="form-label">Tên danh mục:</label>
                <input v-model="category.name" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
                <label class="form-label">Mô tả:</label>
                <textarea v-model="category.description" class="form-control" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary">💾 Lưu</button>
            <RouterLink to="/category" class="btn btn-secondary ms-2">🔙 Quay lại</RouterLink>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/admin/category";
const route = useRoute();
const router = useRouter();
const category = ref({ name: "", description: "" });

// 🔹 1. Lấy ID từ URL và gọi API để lấy thông tin danh mục
//onMounted chạy ngay lập tức khi vào categoryupdate
onMounted(async () => {
    const categoryId = route.params.id; //lấy id ở url
    try {
        const response = await axios.get(`${API_URL}/${categoryId}`);
        category.value = response.data;//gan dl vao category
    } catch (error) {
        console.error("Lỗi khi lấy thông tin danh mục:", error);
    }
});

// 🔹 2. Hàm cập nhật danh mục
const updateCategory = async () => {
    try {
        await axios.post(`${API_URL}/${route.params.id}`, category.value);
        alert("Cập nhật thành công!");
        router.push("/category"); 
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
    }
};
</script>
