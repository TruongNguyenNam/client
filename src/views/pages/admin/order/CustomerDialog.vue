<template>
    <Dialog v-model:visible="visible" modal header="Chọn khách hàng" :style="{ width: '60vw' }">
      <Toast />
  
      <div class="mb-3 flex gap-2">
        <Button
          label="Danh sách khách hàng"
          icon="pi pi-list"
          class="p-button-secondary"
          @click="currentTab = 'list'"
        />
        <Button
          label="Thêm khách hàng"
          icon="pi pi-user-plus"
          class="p-button-success"
          @click="currentTab = 'form'"
        />
      </div>
  
      <!-- Danh sách khách hàng -->
      <div v-if="currentTab === 'list'">
        <div class="mb-3">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText v-model="filters.global.value" placeholder="Tìm theo tên, email, số điện thoại..." class="w-full" />
          </span>
        </div>
  
        <DataTable
          :value="customers"
          v-model:filters="filters"
          v-model:selection="selectedCustomer"
          selectionMode="single"
          dataKey="id"
          :paginator="true"
          :rows="5"
          :loading="loading"
          :globalFilterFields="['username', 'email', 'phoneNumber']"
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" style="min-width: 4rem" />
          <Column field="username" header="Tên người dùng" style="min-width: 10rem" />
          <Column field="email" header="Email" style="min-width: 14rem" />
          <Column field="phoneNumber" header="SĐT" style="min-width: 10rem" />
          <Column field="addressDistrict" header="Quận/Huyện" />
          <Column field="addressProvince" header="Tỉnh/TP" />
          <Column field="isActive" header="Trạng thái">
            <template #body="{ data }">
              <Tag :value="data.isActive ? 'Hoạt động' : 'Không hoạt động'" :severity="data.isActive ? 'success' : 'danger'" />
            </template>
          </Column>
        </DataTable>
      </div>
  
      <!-- Form thêm khách hàng -->
      <div v-else>
        <form @submit.prevent="submitCustomer">
          <div class="grid p-fluid">
            <div class="field col-12 md:col-6">
              <label for="username">Tên khách hàng</label>
              <InputText id="username" required />
            </div>
            <div class="field col-12 md:col-6">
              <label for="email">Email</label>
              <InputText id="email" required />
            </div>
            <div class="field col-12 md:col-6">
              <label for="phoneNumber">SĐT</label>
              <InputText id="phoneNumber"  required />
            </div>
            <div class="field col-12 md:col-6">
              <label for="addressProvince">Tỉnh/TP</label>
              <InputText id="addressProvince"  />
            </div>
            <div class="field col-12 md:col-6">
              <label for="addressDistrict">Quận/Huyện</label>
              <InputText id="addressDistrict" />
            </div>
          </div>
          <div class="flex justify-content-end mt-3">
            <Button label="Hủy" class="p-button-text mr-2" @click="currentTab = 'list'" />
            <Button label="Lưu" type="submit" class="p-button-primary" />
          </div>
        </form>
      </div>
  
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="visible = false" />
        <Button
          label="Chọn"
          icon="pi pi-check"
          class="p-button-primary"
          :disabled="!selectedCustomer"
          @click="selectCustomer"
          v-if="currentTab === 'list'"
        />
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { FilterMatchMode } from 'primevue/api';
  import type { CustomerResponse } from '../../../../model/admin/customer';
  import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';
  
  const props = defineProps<{ modelValue: boolean }>();
  const emit = defineEmits(['update:modelValue', 'selected']);
  
  const visible = ref(props.modelValue);
  const loading = ref(false);
  const toast = useToast();
  
  const currentTab = ref<'list' | 'form'>('list');
  
  const customers = ref<CustomerResponse[]>([]);
  const selectedCustomer = ref<CustomerResponse | null>(null);
 
  
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  
  watch(() => props.modelValue, (val) => {
    visible.value = val;
  });
  
  watch(visible, (val) => {
    emit('update:modelValue', val);
    if (val) {
      getAllCustomers();
    }
  });
  
  const getAllCustomers = async () => {
    loading.value = true;
    try {
      const response = await CustomerService.getAllUsers();
      customers.value = response?.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách khách hàng',
        life: 3000
      });
    } finally {
      loading.value = false;
    }
  };
  
  const submitCustomer = async () => {
  
  };
  
  const selectCustomer = () => {
    if (selectedCustomer.value) {
      emit('selected', selectedCustomer.value);
      visible.value = false;
    }
  };
  </script>