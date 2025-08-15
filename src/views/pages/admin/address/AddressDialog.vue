<template>
  <Dialog :visible="props.visible" :header="mode === 'add' ? 'Thêm địa chỉ' : 'Sửa địa chỉ'" :style="{ width: '600px' }"
    modal @update:visible="emit('update:visible', $event)">
    <div class="form-container">
      <div class="field-row">
        <div class="field half-width">
          <label>Người nhận</label>
          <InputText v-model="formData.receiverName" placeholder="Tên người nhận"
            :class="{ 'border-red-500': errors.receiverName }" />
          <div v-if="errors.receiverName" class="error-message">{{ errors.receiverName }}</div>
        </div>
        <div class="field half-width">
          <label>Số điện thoại</label>
          <InputText v-model="formData.receiverPhone" placeholder="SĐT người nhận"
            :class="{ 'border-red-500': errors.receiverPhone }" />
          <div v-if="errors.receiverPhone" class="error-message">{{ errors.receiverPhone }}</div>
        </div>
      </div>
      <!-- Tỉnh / Thành phố -->
      <div class="field">
        <label>Tỉnh/Thành</label>
        <select v-model="formData.province" :class="{ 'border-red-500': errors.province }">
          <option value="">Chọn tỉnh/thành</option>
          <option v-for="p in provinceOptions" :key="p.level1_id" :value="p.level1_id">
            {{ p.name }}
          </option>

        </select>
        <div v-if="errors.province" class="error-message">{{ errors.province }}</div>
      </div>

      <!-- Quận / Huyện -->
      <div class="field">
        <label>Quận/Huyện</label>
        <select v-model="formData.district" :disabled="!formData.province"
          :class="{ 'border-red-500': errors.district }">

          <option value="">Chọn quận/huyện</option>
          <option v-for="d in districtOptions" :key="d.level2_id" :value="d.level2_id">
            {{ d.name }}
          </option>

        </select>
        <div v-if="errors.district" class="error-message">{{ errors.district }}</div>
      </div>

      <!-- Phường / Xã -->
      <div class="field">
        <label>Phường/Xã</label>
        <select v-model="formData.ward" :disabled="!formData.district" :class="{ 'border-red-500': errors.ward }">

          <option value="">Chọn phường/xã</option>
          <option v-for="w in wardOptions" :key="w.level3_id" :value="w.level3_id">
            {{ w.name }}
          </option>
        </select>
        <div v-if="errors.ward" class="error-message">{{ errors.ward }}</div>
      </div>

      <!-- Địa chỉ chi tiết -->
      <div class="field">
        <label>Địa chỉ chi tiết (số nhà, ngõ...)</label>
        <InputText v-model="formData.street" placeholder="Nhập địa chỉ chi tiết"
          :class="{ 'border-red-500': errors.street }" />
        <div v-if="errors.street" class="error-message">{{ errors.street }}</div>
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
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Không tự động kế thừa attribute HTML không cần thiết
defineOptions({ inheritAttrs: false });
// Biến lưu lỗi 
const errors = ref<{ [key: string]: string }>({});

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

function validatePhone(phone: string) {
  return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}
watch(() => formData.value.receiverPhone, (newPhone) => {
  if (!validatePhone(newPhone)) {
    errors.value.receiverPhone = "SĐT người nhận không hợp lệ";
  } else {
    delete errors.value.receiverPhone;
  }
});
watch(() => formData.value.receiverName, (name) => {
  if (!name) {
    errors.value.receiverName = "Vui lòng nhập tên người nhận";
  } else if (name.length > 100) {
    errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
  } else {
    delete errors.value.receiverName;
  }
});

watch(() => formData.value.street, (street) => {
  if (!street) {
    errors.value.street = "Vui lòng nhập địa chỉ chi tiết";
  } else if (street.length > 100) {
    errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
  } else {
    delete errors.value.street;
  }
});
watch(() => formData.value.province, (val) => {
  if (!val) {
    errors.value.province = "Vui lòng chọn Tỉnh/Thành phố";
  } else {
    delete errors.value.province;
  }
});

watch(() => formData.value.district, (val) => {
  if (!val) {
    errors.value.district = "Vui lòng chọn Quận/Huyện";
  } else {
    delete errors.value.district;
  }
});

watch(() => formData.value.ward, (val) => {
  if (!val) {
    errors.value.ward = "Vui lòng chọn Phường/Xã";
  } else {
    delete errors.value.ward;
  }
});

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
  errors.value = {}; // reset

  // Validate tên
  if (!formData.value.receiverName) {
    errors.value.receiverName = "Vui lòng nhập tên người nhận";
  } else if (formData.value.receiverName.length > 100) {
    errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
  }

  // Validate SĐT
  if (!formData.value.receiverPhone) {
    errors.value.receiverPhone = "Vui lòng nhập SĐT người nhận";
  } else if (!validatePhone(formData.value.receiverPhone)) {
    errors.value.receiverPhone = "SĐT người nhận không hợp lệ";
  }

  // Validate tỉnh/thành
  if (!formData.value.province) {
    errors.value.province = "Vui lòng chọn Tỉnh/Thành phố";
  }

  // Validate quận/huyện
  if (!formData.value.district) {
    errors.value.district = "Vui lòng chọn Quận/Huyện";
  }

  // Validate phường/xã
  if (!formData.value.ward) {
    errors.value.ward = "Vui lòng chọn Phường/Xã";
  }

  // Validate địa chỉ chi tiết
  if (!formData.value.street) {
    errors.value.street = "Vui lòng nhập địa chỉ chi tiết";
  } else if (formData.value.street.length > 100) {
    errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
  }

  // Nếu có lỗi -> báo toast tổng quát và không gửi
  if (Object.keys(errors.value).length > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Lỗi nhập liệu',
      detail: 'Vui lòng kiểm tra lại các trường bị lỗi.',
      life: 3000
    });
    return;
  }

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

.error-message {
  color: #e11d48;
  font-size: 0.96rem;
  margin-top: 5px;
  margin-bottom: 2px;
}
</style>
