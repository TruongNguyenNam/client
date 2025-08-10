<template>
  <Dialog :visible="props.visible" @update:visible="val => emit('update:visible', val)" modal
    header="Chọn địa chỉ giao hàng" :style="{ width: '600px' }">

    <!-- Nút thêm -->
    <div class="dialog-toolbar">
      <Button label="Thêm địa chỉ mới" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" />
    </div>

    <!-- Danh sách địa chỉ -->
    <div v-if="sortedAddresses.length > 0">
      <div v-for="addr in sortedAddresses" :key="addr.id" class="address-card">
        <div class="address-info">
          <div class="font-medium text-base mb-1">
            <i class="pi pi-user mr-2"></i>{{ addr.receiverName }} - {{ addr.receiverPhone }}
          </div>
          <div class="text-sm text-gray-700">
            <i class="pi pi-map-marker mr-2"></i>
            {{ [addr.street, addr.ward, addr.district, addr.province, addr.city, addr.zipcode]
              .filter(Boolean).join(", ") }}
          </div>
          <div v-if="addr.isDefault" class="badge-default">
            <i class="pi pi-star-fill mr-1"></i> Mặc định
          </div>
        </div>

        <div class="address-actions">
          <Button label="Chọn" size="small" @click="select(addr)" class="mr-2" />
          <Button icon="pi pi-pencil" size="small" severity="info" @click="editAddress(addr)" />
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-4">
      Khách hàng chưa có địa chỉ nào.
    </div>
    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" />

    </template>
  </Dialog>

  <!-- Dialog thêm/sửa -->
  <AddressDialog v-if="dialogReady" v-model:visible="showAddressDialog" :mode="dialogMode" :data="dialogAddressData"
    :isOnlyDefault?="isOnlyDefaultAddress" @submit="handleAddressSubmit" @delete="handleAddressDelete" />

  <!-- Nút huỷ / lưu / xoá -->
</template>

<script setup lang="ts">
import { ref, computed, nextTick,watch } from 'vue';
import { useToast } from 'primevue/usetoast';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import AddressDialog from '../../../../views/pages/admin/address/AddressDialog.vue';
import type { AddressResponse } from '../../../../model/admin/address';
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import { AddressService } from '../../../../service/admin/AddressService';
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();

const toast = useToast();
const props = defineProps<{
  visible: boolean;
  addresses: AddressResponse[];
  customerId: number;
}>();


const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'select', address: AddressResponse): void;
  (e: 'submitAddress', address: any): void;
  (e: 'deleteAddress'): void;
  (e: 'cancel'): void;
}>();



const sortedAddresses = computed(() =>
  [...props.addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
);

const isOnlyDefaultAddress = computed(() => {
  const defaultAddresses = props.addresses.filter(a => a.isDefault);
  return (
    addressBeingEdited.value &&
    defaultAddresses.length === 1 &&
    defaultAddresses[0].id === addressBeingEdited.value.id
  );
});

const convertNamesToIds = (addr: AddressResponse) => {
  const province = provincesData.data.find(p => p.name === addr.province);
  const district = province?.level2s.find(d => d.name === addr.district);
  const ward = district?.level3s.find(w => w.name === addr.ward);

  return {
    ...addr,
    province: province?.level1_id || '',
    district: district?.level2_id || '',
    ward: ward?.level3_id || ''
  };
};

const showAddressDialog = ref(false);
const dialogReady = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const dialogAddressData = ref<any>({});
const addressBeingEdited = ref<AddressResponse | null>(null);

const select = (address: AddressResponse) => {
  emit('select', address);
  emit('update:visible', false);
};

const openAddDialog = async () => {
  dialogMode.value = 'add';
  dialogAddressData.value = {
    receiverName: '',
    receiverPhone: '',
    street: '',
    ward: '',
    district: '',
    province: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    isDefault: false
  };
  dialogReady.value = false;
  await nextTick();
  dialogReady.value = true;
  showAddressDialog.value = true;
};

const editAddress = async (addr: AddressResponse) => {
  dialogMode.value = 'edit';
  addressBeingEdited.value = addr;
  dialogAddressData.value = convertNamesToIds(addr);
  dialogReady.value = false;
  await nextTick();
  dialogReady.value = true;
  showAddressDialog.value = true;
};

// ======= VALIDATE =======
const validatePhone = (phone: string) => /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
const errors = ref<{ [key: string]: string }>({});
watch(() => dialogAddressData.value.receiverPhone, (newPhone) => {
  if (!newPhone) {
    errors.value.receiverPhone = "Vui lòng nhập SĐT người nhận";
  } else if (!validatePhone(newPhone)) {
    errors.value.receiverPhone = "SĐT người nhận không hợp lệ";
  } else {
    delete errors.value.receiverPhone;
  }
});

watch(() => dialogAddressData.value.receiverName, (name) => {
  if (!name) {
    errors.value.receiverName = "Vui lòng nhập tên người nhận";
  } else if (name.length > 100) {
    errors.value.receiverName = "Tên người nhận quá dài (tối đa 100 ký tự)";
  } else {
    delete errors.value.receiverName;
  }
});

watch(() => dialogAddressData.value.street, (street) => {
  if (!street) {
    errors.value.street = "Vui lòng nhập địa chỉ chi tiết";
  } else if (street.length > 100) {
    errors.value.street = "Địa chỉ chi tiết quá dài (tối đa 100 ký tự)";
  } else {
    delete errors.value.street;
  }
});
const handleAddressSubmit = (submitted: any) => {
  // Check tên người nhận
  if (!submitted.receiverName || submitted.receiverName.trim() === '') {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng nhập tên người nhận.',
      life: 3000
    });
    return;
  }
  if (submitted.receiverName.trim().length > 100) {
    toast.add({
      severity: 'warn',
      summary: 'Tên quá dài',
      detail: 'Tên người nhận không được vượt quá 50 ký tự.',
      life: 3000
    });
    return;
  }

  // Check số điện thoại
  if (!validatePhone(submitted.receiverPhone)) {
    toast.add({
      severity: 'warn',
      summary: 'Số điện thoại không hợp lệ',
      detail: 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam.',
      life: 3000
    });
    return;
  }

  // Check tỉnh/thành
  if (!submitted.province) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng chọn Tỉnh/Thành phố.',
      life: 3000
    });
    return;
  }

  // Check quận/huyện
  if (!submitted.district) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng chọn Quận/Huyện.',
      life: 3000
    });
    return;
  }

  // Check phường/xã
  if (!submitted.ward) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng chọn Phường/Xã.',
      life: 3000
    });
    return;
  }

  // Check địa chỉ chi tiết
  if (!submitted.street || submitted.street.trim() === '') {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng nhập địa chỉ chi tiết.',
      life: 3000
    });
    return;
  }
  if (submitted.street.trim().length > 255) {
    toast.add({
      severity: 'warn',
      summary: 'Địa chỉ quá dài',
      detail: 'Địa chỉ chi tiết không được vượt quá 255 ký tự.',
      life: 3000
    });
    return;
  }

  // Nếu tất cả hợp lệ → emit dữ liệu
  emit('submitAddress', submitted);
  showAddressDialog.value = false;
};



// Gọi khi click XÓA trong AddressDialog
const handleAddressDelete = (address: any) => {
  const addressId = Number(address.id);

  if (!addressId || isNaN(addressId)) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể xác định ID địa chỉ để xoá',
      life: 3000
    });
    return;
  }

  confirm.require({
    message: 'Bạn có chắc muốn xoá địa chỉ này?',
    header: 'Xác nhận xoá',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xoá',
    rejectLabel: 'Huỷ',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        if (!props.customerId) return;
        console.log('Xoá địa chỉ với ID:', address.id, 'Loại:', typeof address.id);
        await AddressService.deleteAddress(props.customerId, addressId);

        toast.add({
          severity: 'success',
          summary: 'Đã xoá',
          detail: 'Xoá địa chỉ thành công',
          life: 3000
        });

        showAddressDialog.value = false;
        emit('deleteAddress');
      } catch (err) {
        console.error('Lỗi xoá địa chỉ:', err);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xoá địa chỉ',
          life: 3000
        });
      }
    }
  });
};


</script>

<style scoped>
.dialog-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.address-card {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #f9fafb;
}

.address-info {
  flex: 1;
}

.address-actions {
  margin-left: 12px;
}

.badge-default {
  margin-top: 6px;
  color: #f59e0b;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
