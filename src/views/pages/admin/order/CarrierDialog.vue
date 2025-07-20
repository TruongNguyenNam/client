<template>
  <Dialog v-model:visible="visible" modal header="Thêm nhà vận chuyển" :style="{ width: '400px' }" @hide="onClose">
    <Toast />
    <div class="mb-3">
      <label class="block mb-2 font-medium">Tên nhà vận chuyển</label>
      <InputText v-model="carrierName" placeholder="Nhập tên nhà vận chuyển" class="w-full" autofocus />
    </div>
    <div class="mb-3">
      <label class="block mb-2 font-medium">Mô tả</label>
      <InputText v-model="carrierDesc" placeholder="Nhập mô tả" class="w-full" />
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button label="Hủy" class="p-button-text" @click="onClose" />
      <Button label="Thêm" class="p-button-primary" :loading="loading" @click="handleAdd"
        :disabled="!carrierName.trim() || loading" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { CarrierService } from '../../../../service/admin/CarrierService';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'added', carrier: any): void;
}>();

const visible = ref(props.modelValue);
const carrierName = ref('');
const carrierDesc = ref('');
const loading = ref(false);
const toast = useToast();

watch(() => props.modelValue, val => visible.value = val);
watch(visible, val => emit('update:modelValue', val));

function onClose() {
  visible.value = false;
  carrierName.value = '';
  carrierDesc.value = '';
}

//  thêm carrier
async function handleAdd() {
  if (!carrierName.value.trim() || loading.value) return;
  loading.value = true;
  try {
    const res = await CarrierService.saveCarrier({
      name: carrierName.value,
      description: carrierDesc.value,
      deleted: false
    });
    if (res.data) {
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm nhà vận chuyển thành công', life: 2000 });
      emit('added', res.data); // emit cho cha nếu muốn cập nhật danh sách hoặc chọn luôn carrier mới
      onClose();
    } else {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thêm được nhà vận chuyển', life: 2000 });
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thêm được nhà vận chuyển', life: 2000 });
  } finally {
    loading.value = false;
  }
}
</script>