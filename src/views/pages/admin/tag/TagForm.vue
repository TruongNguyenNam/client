<template>
    <Dialog v-model:visible="visible" header="Chỉnh sửa thẻ sản phẩm" :style="{ width: '30rem' }" modal>
        <div class="p-fluid">
            <div class="p-field">
                <label for="name">Tên</label>
                <InputText id="name" v-model="productTag.name" required />
            </div>
            <div class="p-field">
                <label for="description">Mô tả</label>
                <Textarea id="description" v-model="productTag.description" autoResize rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" @click="$emit('close')" class="p-button-text" />
            <Button label="Lưu" icon="pi pi-check" @click="saveProductTag" class="p-button-primary" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { ProductTagService } from "@/service/ProductTagService";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
    productTag: Object,
});
const emit = defineEmits(["close"]);

const productTag = ref({ name: "", description: "" });
const visible = ref(true);

watch(
    () => props.productTag,
    (newTag) => {
        if (newTag) {
            productTag.value = {
                ...newTag,
                description: newTag.description || ""
            };
            visible.value = true;
        }
    },
    { immediate: true }
);

const saveProductTag = async () => {
    try {
        if (productTag.value.id) {
            await ProductTagService.updateTag(productTag.value.id, productTag.value);
        } else {
            await ProductTagService.saveTag(productTag.value);
        }
        emit("close");
        router.push("/product-tag");
    } catch (error) {
        console.error("Lỗi khi lưu thẻ sản phẩm:", error);
    }
};
</script>
