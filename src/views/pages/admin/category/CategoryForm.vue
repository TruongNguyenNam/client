<template>
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4 w-full sm:w-80">
        <!-- Tên Danh Mục -->
        <div class="flex flex-col gap-1">
            <label for="name">Tên Danh Mục</label>
            <InputText id="name" v-model="category.name" placeholder="Nhập tên danh mục" class="w-full" />
        </div>

        <!-- Mô Tả -->
        <div class="flex flex-col gap-1">
            <label for="description">Mô Tả</label>
            <InputText id="description" v-model="category.description" placeholder="Nhập mô tả" class="w-full" />
        </div>

        <Button type="submit" severity="secondary" label="Submit" class="mt-2" />
        <RouterLink to="category"><Button type="submit" severity="secondary" label="quay lại" class="mt-2" /></RouterLink>
    </form>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import router from "../../../../router";

const category = ref({
    id:7,
    name: "",
    description: ""
});
;
const API_URL ="http://localhost:8080/api/v1/admin/category/create";


const onSubmit = async () => {
    try {
         await axios.post(API_URL, category.value);
         router.push({name:"category"})
         alert('thêm thành công')

    } catch (error) {
        console.error("Lỗi khi thêm danh mục:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại!");
    }

};
</script>
