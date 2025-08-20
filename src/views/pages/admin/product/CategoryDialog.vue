<template>
  <Dialog 
    v-model:visible="localVisible"
    :header="categoryData.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'"
    :style="{ width: '30rem' }" 
    modal
    @hide="emit('close')"
  >
    <div class="p-fluid">
      <div class="p-field">
        <label for="name">Tên danh mục</label>
        <InputText id="name" v-model="categoryData.name" required />
      </div>
      <div class="p-field">
        <label for="description">Mô tả</label>
        <InputText id="description" v-model="categoryData.description" required />
      </div>
    </div>

    <template #footer>
      <Button label="Hủy" icon="pi pi-times" @click="hideDialog" class="p-button-text" />
      <Button label="Lưu" icon="pi pi-check" @click="saveCategory" class="p-button-primary" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { CategoryService } from "../../../../service/admin/CategoryService";
import { useToast } from "primevue/usetoast";

interface Category {
  id?: number;
  name: string;
  description: string;
}

const props = defineProps<{
  visible: boolean;
  category?: Category;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void; // để báo cho cha biết reload lại categories
}>();

const toast = useToast();
const categoryData = ref<Category>({ name: "", description: "" });
const localVisible = ref<boolean>(props.visible);
const submitted = ref<boolean>(false);

// đồng bộ visible từ cha
watch(() => props.visible, (val) => {
  localVisible.value = val;
});

// đồng bộ category từ cha
watch(
  () => props.category,
  (newCategory) => {
    categoryData.value = newCategory
      ? { ...newCategory }
      : { name: "", description: "" };
  },
  { immediate: true }
);

const hideDialog = () => {
  localVisible.value = false;
  emit("close");
};

const saveCategory = async (): Promise<void> => {
  submitted.value = true;

  const nameRegex = /^[\p{L}\d\s]+$/u;
  const trimmedName = categoryData.value.name.trim();
  const trimmedDescription = categoryData.value.description.trim();

  if (!trimmedName) {
    toast.add({
      severity: "warn",
      summary: "Cảnh báo",
      detail: "Tên danh mục không được để trống",
      life: 3000,
    });
    return;
  }

  if (trimmedName.length > 30) {
    toast.add({
      severity: "warn",
      summary: "Cảnh báo",
      detail: "Tên danh mục không được vượt quá 30 ký tự",
      life: 3000,
    });
    return;
  }

  if (!nameRegex.test(trimmedName)) {
    toast.add({
      severity: "warn",
      summary: "Cảnh báo",
      detail: "Tên danh mục không được chứa ký tự đặc biệt",
      life: 3000,
    });
    return;
  }

  try {
    if (categoryData.value.id) {
      await CategoryService.updateCategory(categoryData.value.id, {
        name: trimmedName,
        description: trimmedDescription,
      });
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Cập nhật danh mục thành công",
        life: 3000,
      });
    } else {
      await CategoryService.addCategory({
        name: trimmedName,
        description: trimmedDescription,
      });
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Thêm danh mục thành công",
        life: 3000,
      });
    }

    emit("saved"); // báo cho cha load lại categories
    hideDialog();
    submitted.value = false;
  } catch (error) {
    console.error("Lỗi khi lưu danh mục:", error);
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Lưu danh mục thất bại",
      life: 3000,
    });
  }
};
</script>
