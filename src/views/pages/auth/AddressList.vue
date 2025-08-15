<template>
  <div class="address-container">
    <div class="address-header">
      <h2>Địa Chỉ Của Tôi</h2>
      <button class="add-btn" @click="openAddDialog">+ Thêm Địa Chỉ</button>
    </div>

    <div v-if="addresses.length === 0" class="no-address">
      Bạn chưa có địa chỉ nào.
    </div>

    <div v-for="address in sortedAddresses" :key="address.id" class="address-card">
      <div class="info">
        <div><strong>{{ address.receiverName }}</strong> - {{ address.receiverPhone }}</div>
        <div>{{ address.fullAddress }}</div>
        <span v-if="address.isDefault" class="default-tag">
          <i class="pi pi-star-fill" style="margin-right: 4px;"></i>Mặc định</span>
      </div>
      <div class="actions">
        <div>
          <button @click="editAddress(address)">Sửa</button>|
          <button class="delete-btn" @click="confirmDelete(address)">Xoá</button>
        </div>
        <button v-if="!address.isDefault" @click="setDefault(address)">Chọn làm mặc định</button>
      </div>
    </div>

    <AddressDialog v-if="dialogVisible && dialogReady" v-model:visible="dialogVisible" :mode="dialogMode"
      :data="dialogAddressData" @submit="handleSubmit" @delete="handleDeleteAddress" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import AddressDialog from '../../../views/pages/admin/address/AddressDialog.vue';
import { AddressService } from '../../../service/admin/AddressService';
import type { AddressResponse } from '../../../model/admin/address';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { CustomerService } from "../../../service/admin/CustomerServiceLegacy";
import provincesData from '../../../assets/data/vietnam_provinces.json';

const toast = useToast();
const confirm = useConfirm();

type AddressWithFull = AddressResponse & { fullAddress: string };

const addresses = ref<AddressWithFull[]>([]);
const dialogVisible = ref(false);
const dialogReady = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const dialogAddressData = ref<any>({});
const selectedAddress = ref<AddressWithFull | null>(null);
const userId = ref<number | null>(null);

// Lấy user từ sessionStorage
onMounted(async () => {
  const raw = sessionStorage.getItem('userInfo');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      userId.value = parsed?.userId || null;
      await fetchAddresses();
    } catch (error) {
      console.error('Lỗi khi parse userInfo:', error);
    }
  }
});

const fetchAddresses = async () => {
  if (!userId.value) return;
  try {
    const res = await AddressService.getAddressesByCustomerId(userId.value);
    const rawAddresses = res.data ?? [];
    addresses.value = rawAddresses.map(addr => ({
      ...addr,
      fullAddress: `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`
    }));
  } catch (error) {
    console.error('Lỗi khi lấy địa chỉ:', error);
  }
};

const sortedAddresses = computed(() =>
  [...addresses.value].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
);

const openAddDialog = async () => {
  dialogMode.value = 'add';
  dialogAddressData.value = {};
  dialogReady.value = false;
  await nextTick();
  dialogReady.value = true;
  dialogVisible.value = true;
};

const editAddress = async (address: AddressWithFull) => {
  dialogMode.value = 'edit';
  selectedAddress.value = address;

  // Tìm ID từ tên
  const province = provinceOptions.find(p => p.name === address.province);
  const district = province?.level2s.find(d => d.name === address.district);
  const ward = district?.level3s.find(w => w.name === address.ward);

  dialogAddressData.value = {
    ...address,
    province: province?.level1_id || '',
    district: district?.level2_id || '',
    ward: ward?.level3_id || ''
  };

  dialogReady.value = false;
  await nextTick();
  dialogReady.value = true;
  dialogVisible.value = true;
};


const provinceOptions = provincesData.data;
// Biến lưu lỗi
const errors = ref<{ [key: string]: string }>({});

// Regex kiểm tra email, phone

function validatePhone(phone: string) {
  return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}

// them dia chi
const handleSubmit = async (formData: any) => {
  if (!userId.value) return;
  if (!formData.receiverName || !formData.receiverPhone || !formData.street) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu thông tin',
      detail: 'Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.',
      life: 3000
    });
    return;
  }

  if (!validatePhone(formData.receiverPhone)) {
    toast.add({
      severity: 'warn',
      summary: 'Số điện thoại không hợp lệ',
      detail: 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam.',
      life: 3000
    });
    return;
  }

  const provinceName = provinceOptions.find(p => p.level1_id === formData.province)?.name || '';
  const districtName = provinceOptions.find(p => p.level1_id === formData.province)?.level2s?.find(d => d.level2_id === formData.district)?.name || '';
  const wardName = provinceOptions.find(p => p.level1_id === formData.province)?.level2s?.find(d => d.level2_id === formData.district)?.level3s?.find(w => w.level3_id === formData.ward)?.name || '';

  const newAddr = {
    ...formData,
    ward: wardName,
    district: districtName,
    province: provinceName,
    country: "Việt Nam"
  };
  try {
    if (dialogMode.value === 'add') {
      await CustomerService.addAddressForCustomer(userId.value, newAddr);
    } else if (selectedAddress.value) {
      await AddressService.updateAddressForCustomer(userId.value, selectedAddress.value.id, newAddr);
    }
    await fetchAddresses();
    dialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu địa chỉ', life: 3000 });
  } catch (error) {
    console.error('Lỗi khi submit địa chỉ:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu địa chỉ', life: 3000 });
  }
};

const setDefault = async (address: AddressWithFull) => {
  confirm.require({
    message: 'Bạn có chắc chắn đặt địa chỉ này là mặc định?',
    header: 'Xác nhận đặt mặc định',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xác nhận',
    rejectLabel: 'Huỷ',
    accept: async () => {
      try {
        if (!userId.value) return;
        await AddressService.setDefaultAddress(userId.value, address.id);
        await fetchAddresses();
        toast.add({ severity: 'success', summary: 'Thành Công', detail: 'Đặt địa chỉ mặc định thành công.', life: 3000 });
      } catch (error) {
        console.error('Xoá thất bại:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi khi đặt mặc định:', life: 3000 });
      }
    }
  });
  // try {
  //   await AddressService.setDefault(address.id);
  //   await fetchAddresses();
  // } catch (error) {
  //   console.error('Lỗi khi đặt mặc định:', error);
  // }
};

const confirmDelete = (address: AddressWithFull) => {
  if (address.isDefault && addresses.value?.filter(a => a.isDefault).length === 1) {
    toast.add({
      severity: 'warn',
      summary: 'Không thể xoá',
      detail: 'Không thể xoá địa chỉ mặc định duy nhất. Hãy đặt địa chỉ khác làm mặc định trước.',
      life: 4000
    });
    return;
  }
  confirm.require({
    message: 'Bạn có chắc chắn muốn xoá địa chỉ này không?',
    header: 'Xác nhận xoá',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xoá',
    rejectLabel: 'Huỷ',
    accept: async () => {
      try {
        if (!userId.value) return;
        await AddressService.deleteAddress(userId.value, address.id);
        await fetchAddresses();
        toast.add({ severity: 'success', summary: 'Đã xoá', detail: 'Địa chỉ đã được xoá.', life: 3000 });
      } catch (error) {
        console.error('Xoá thất bại:', error);
        toast.add({ severity: 'error', summary: 'Lỗi xoá', detail: 'Không thể xoá địa chỉ.', life: 3000 });
      }
    }
  });
};


const handleDeleteAddress = (formData: any) => {
  console.log("Xoá địa chỉ:", formData); // 👈 kiểm tra
  if (formData.isDefault && addresses.value?.filter(a => a.isDefault).length === 1) {
    toast.add({
      severity: 'warn',
      summary: 'Không thể xoá',
      detail: 'Không thể xoá địa chỉ mặc định duy nhất. Hãy đặt địa chỉ khác làm mặc định trước.',
      life: 4000
    });
    return;
  }
  confirm.require({
    message: 'Bạn có chắc chắn muốn xoá địa chỉ này không?',
    header: 'Xác nhận xoá',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xoá',
    rejectLabel: 'Huỷ',
    accept: async () => {
      try {
        if (!userId.value) return;
        await AddressService.deleteAddress(userId.value, formData.id);
        await fetchAddresses();
        dialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Đã xoá', detail: 'Địa chỉ đã được xoá.', life: 3000 });
      } catch (error) {
        console.error('Xoá thất bại:', error);
        toast.add({ severity: 'error', summary: 'Lỗi xoá', detail: 'Không thể xoá địa chỉ.', life: 3000 });
      }
    }
  });
};
</script>

<style scoped>
.address-container {
  width: 100%;
  margin: 0 auto;
  background-color: white;
  padding: 24px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.06);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.address-header h2 {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.add-btn {
  background-color: #ee4d2d;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #d94424;
}

.address-card {
  margin-top: 16px;
  padding: 16px;
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #f0f0f0;
}

.address-card .info {
  font-size: 14px;
  line-height: 1.6;
}

.address-card .info div:first-child {
  font-weight: 500;
  margin-bottom: 4px;
}

.address-card .actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.actions button {
  background: none;
  border: none;
  color: #0055aa;
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 6px;
}

.actions .delete-btn {
  color: #d11a2a;
}

.actions button:hover {
  text-decoration: underline;
}

.default-tag {
  background-color: #13c97a;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 2px;
  margin-top: 6px;
  display: inline-block;
}

.no-address {
  font-style: italic;
  font-size: 14px;
  padding: 12px 0;
  color: #888;
}
</style>
