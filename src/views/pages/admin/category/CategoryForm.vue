<template>
    <Dialog v-model:visible="visible" header="Chỉnh sửa danh mục" :style="{ width: '30rem' }" modal>
        <div class="p-fluid">
            <div class="p-field">
                <label for="name">Tên danh mục</label>
                <InputText id="name" v-model="category.name" required />
            </div>
            <div class="p-field">
                <label for="description">Mô tả</label>
                <InputText id="description" v-model="category.description" required />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" @click="$emit('close')" class="p-button-text" />
            <Button label="Lưu" icon="pi pi-check" @click="saveCategory" class="p-button-primary" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { CategoryService } from "@/service/CategoryService";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
    category: Object,
});
const emit = defineEmits(["close"]);

const category = ref({ name: "", description: "" });
const visible = ref(true);

watch(
    () => props.category,
    (newCategory) => {
        if (newCategory) {
            category.value = { ...newCategory };
            visible.value = true;
        }
    },
    { immediate: true }
);

const saveCategory = async () => {
    try {
        if (category.value.id) {
            await CategoryService.updateCategory(category.value.id, category.value);
        } else {
            await CategoryService.saveCategory(category.value);
        }
        loadCategories();
        emit("close");
        router.push("/category");
    } catch (error) {
        console.error("Lỗi khi lưu danh mục:", error);
    }
};
</script>
