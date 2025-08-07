<template>
  <Dialog :visible="props.visible" :header="mode === 'add' ? 'Thêm địa chỉ' : 'Sửa địa chỉ'" :style="{ width: '600px' }"
    modal @update:visible="emit('update:visible', $event)">
    <div class="form-container">
      <div class="field-row">
        <div class="field half-width">
          <label>Người nhận</label>
          <InputText v-model="formData.receiverName" placeholder="Tên người nhận" />
        </div>
        <div class="field half-width">
          <label>Số điện thoại</label>
          <InputText v-model="formData.receiverPhone" placeholder="SĐT người nhận" />
        </div>
      </div>
      <!-- Tỉnh / Thành phố -->
      <div class="field">
        <label>Tỉnh/Thành</label>
        <select v-model="formData.province">
          <option value="">Chọn tỉnh/thành</option>
          <option v-for="p in provinceOptions" :key="p.level1_id" :value="p.level1_id">
            {{ p.name }}
          </option>
        </select>
      </div>

      <!-- Quận / Huyện -->
      <div class="field">
        <label>Quận/Huyện</label>
        <select v-model="formData.district" :disabled="!formData.province">
          <option value="">Chọn quận/huyện</option>
          <option v-for="d in districtOptions" :key="d.level2_id" :value="d.level2_id">
            {{ d.name }}
          </option>
        </select>
      </div>

      <!-- Phường / Xã -->
      <div class="field">
        <label>Phường/Xã</label>
        <select v-model="formData.ward" :disabled="!formData.district">
          <option value="">Chọn phường/xã</option>
          <option v-for="w in wardOptions" :key="w.level3_id" :value="w.level3_id">
            {{ w.name }}
          </option>
        </select>
      </div>

      <!-- Địa chỉ chi tiết -->
      <div class="field">
        <label>Địa chỉ chi tiết (số nhà, ngõ...)</label>
        <InputText v-model="formData.street" placeholder="Nhập địa chỉ chi tiết" />
      </div>

      <!-- Địa chỉ đầy đủ -->
      <div class="field">
        <label>Địa chỉ đầy đủ</label>
        <input :value="fullAddress" type="text" readonly />
      </div>
    </div>

    <!-- Nút huỷ / lưu / xoá -->
<template #footer>
  <div class="dialog-footer-row">
    <div class="field-checkbox">
      <Checkbox inputId="cb1" v-model="formData.isDefault" :binary="true" :disabled="props.isOnlyDefault" />
      <label for="cb1" class="ml-2">Đặt làm địa chỉ mặc định</label>
    </div>
    <div class="dialog-footer-buttons">
      <Button label="Huỷ" icon="pi pi-times" class="p-button-text" @click="emit('update:visible', false)" />
      <Button label="Lưu" icon="pi pi-check" class="p-button-primary" @click="submit" />
      <Button v-if="props.mode === 'edit'" label="Xoá" icon="pi pi-trash" class="p-button-danger"
        @click="onDeleteClick" />
    </div>
  </div>
</template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import provincesData from '../../../../assets/data/vietnam_provinces.json';

// Không tự động kế thừa attribute HTML không cần thiết
defineOptions({ inheritAttrs: false });

// props từ component cha
const props = defineProps<{
  visible: boolean;
  mode: 'add' | 'edit';      // thêm hoặc sửa
  data: any;                 // dữ liệu địa chỉ truyền vào
  isOnlyDefault?: boolean;
}>();

const emit = defineEmits(['update:visible', 'submit', 'delete']);

// dữ liệuđịa chỉ
const formData = ref<any>({});

watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = { ...newData };
  }
}, { immediate: true });

// Danh sách tỉnh/thành
const provinceOptions = provincesData.data;
const districtOptions = computed(() =>
  provinceOptions.find(p => p.level1_id === formData.value.province)?.level2s || []
);
const wardOptions = computed(() =>
  districtOptions.value.find(d => d.level2_id === formData.value.district)?.level3s || []
);

//địa chỉ đầy đủ
const fullAddress = computed(() =>
  [
    formData.value.street,
    wardOptions.value.find(w => w.level3_id === formData.value.ward)?.name,
    districtOptions.value.find(d => d.level2_id === formData.value.district)?.name,
    provinceOptions.find(p => p.level1_id === formData.value.province)?.name
  ].filter(Boolean).join(', ')
);


const submit = () => {
  emit('submit', formData.value);
};
const onDeleteClick = () => {
  emit('delete', formData.value); // KHÔNG confirm ở đây
};
</script>

<style scoped lang="scss">
.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
}

.field-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
}

.half-width {
  flex: 1;
  min-width: 200px;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

input,
select,
.p-inputtext {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
.p-inputtext:focus {
  border-color: #6366f1;
  background: #fff;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer-row {
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap; // Hỗ trợ responsive
}

.dialog-footer-buttons {
  display: flex;
  gap: 8px;
}
</style>
