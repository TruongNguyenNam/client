<!-- AddAttributeDialog.vue -->
<template>
    <div>
      <Dialog
        v-model:visible="addAttributeDialogVisible"
        header="Thêm thuộc tính mới"
        :modal="true"
        :style="{ width: '30vw' }"
      >
        <div class="p-fluid">
          <div class="p-field">
            <label for="newAttributeName">Tên thuộc tính</label>
            <InputText
              id="newAttributeName"
              v-model="newAttribute.name"
              maxlength="20"
              required
              autofocus
            />
          </div>
          <div class="p-field">
            <label for="newAttributeDescription">Mô tả</label>
            <InputText
              id="newAttributeDescription"
              v-model="newAttribute.description"
              maxlength="255"
              
            />
          </div>
        </div>
        <template #footer>
          <Button
            label="Hủy"
            icon="pi pi-times"
            @click="closeAddAttributeDialog"
            class="p-button-text"
          />
          <Button
            label="Lưu"
            icon="pi pi-check"
            @click="saveNewAttribute"
            :disabled="!newAttribute.name"
          />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits, watch } from 'vue';
  import { ProductAttributeService } from '../../../../service/admin/ProductAttribueService';
  import type { ProductAttributeRequest, ProductAttributeResponse } from '../../../../model/admin/productAttribute';
  import { useToast } from 'primevue/usetoast';
  
  const toast = useToast();
  const props = defineProps<{
    visible: boolean;
    productAttributes: ProductAttributeResponse[];
    availableAttributes: ProductAttributeResponse[];
  }>();
  
  const emit = defineEmits(['update:visible', 'attribute-added']);
  
  // Biến điều khiển hiển thị dialog
  const addAttributeDialogVisible = ref(props.visible);
  
  // Biến lưu dữ liệu thuộc tính mới
  const newAttribute = ref<ProductAttributeRequest>({ name: '', description: '' });
  
  // Đồng bộ trạng thái visible từ props
  watch(
    () => props.visible,
    (newValue) => {
      addAttributeDialogVisible.value = newValue;
      if (newValue) {
        // Reset newAttribute mỗi khi mở dialog
        newAttribute.value = { name: '', description: '' };
      }
    }
  );
  
  // Đồng bộ trạng thái addAttributeDialogVisible về prop visible
  watch(
    () => addAttributeDialogVisible.value,
    (newValue) => {
      emit('update:visible', newValue);
    }
  );
  
  // Đóng dialog
  const closeAddAttributeDialog = () => {
    addAttributeDialogVisible.value = false;
    emit('update:visible', false);
    newAttribute.value = { name: '', description: '' };
  };
  
  // Gọi API lưu thuộc tính mới
  const saveNewAttribute = async () => {
    const name = newAttribute.value.name?.trim().toLowerCase();
    const description = newAttribute.value.description?.trim();
  
    if (!name) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập tên và mô tả thuộc tính.',
        life: 3000,
      });
      return;
    }
  
    // Kiểm tra trùng tên thuộc tính
    const isDuplicate = props.productAttributes.some(
      (attr) => attr.name.trim().toLowerCase() === name
    );
  
    if (isDuplicate) {
      toast.add({
        severity: 'warn',
        summary: 'Trùng tên',
        detail: 'Thuộc tính với tên này đã tồn tại.',
        life: 3000,
      });
      return;
    }
  
    try {
      const response = await ProductAttributeService.saveProductAttribute({
        name: newAttribute.value.name.trim(),
        description: description,
      });
  
      if (response.data) {
        emit('attribute-added', response.data);
        closeAddAttributeDialog();
      }
  
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thuộc tính đã được thêm',
        life: 3000,
      });
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error.message || 'Không thể thêm thuộc tính',
        life: 3000,
      });
    }
  };
  </script>
  
  <style scoped>
  /* Có thể thêm CSS tùy chỉnh nếu cần */
  </style>