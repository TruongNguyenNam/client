<template>
    <Dialog v-model:visible="visible" header="Chỉnh sửa nhà cung cấp" :style="{ width: '30rem' }" modal>
        <div class="p-fluid">
            <div class="p-field">
                <label for="name">Tên</label>
                <InputText id="name" v-model="supplier.name" required />
            </div>
            <div class="p-field">
                <label for="description">Mô tả</label>
                <InputText id="description" v-model="supplier.description" required />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" @click="$emit('close')" class="p-button-text" />
            <Button label="Lưu" icon="pi pi-check" @click="saveSupplier" class="p-button-primary" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { SupplierService } from "@/service/SupplierService"; // Đảm bảo đã import dịch vụ SupplierService
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
    supplier: Object, // Tham số nhận vào là đối tượng nhà cung cấp
});
const emit = defineEmits(["close"]);

const supplier = ref({ name: "", description: "" }); // Khởi tạo đối tượng nhà cung cấp
const visible = ref(true);

watch(
    () => props.supplier,
    (newSupplier) => {
        if (newSupplier) {
            supplier.value = { ...newSupplier }; // Cập nhật dữ liệu nhà cung cấp khi nhận prop mới
            visible.value = true; // Hiển thị modal
        }
    },
    { immediate: true }
);

const saveSupplier = async () => {
    try {
        if (supplier.value.id) {
            // Nếu có id, gọi API cập nhật nhà cung cấp
            await SupplierService.updateSupplier(supplier.value.id, supplier.value);
        } else {
            // Nếu không có id (thêm mới)
            await SupplierService.saveSupplier(supplier.value);
        }
        emit("close"); // Đóng modal
        router.push("/supplier"); // Quay về danh sách nhà cung cấp
    } catch (error) {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
    }
};
</script>
