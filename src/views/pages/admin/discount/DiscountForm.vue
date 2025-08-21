

<template>
  <div class="p-4 max-w-4xl mx-auto bg-white rounded shadow">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Tạo khuyến mãi</h2>
      <Button 
        label="Quay lại" 
        icon="pi pi-arrow-left" 
        class="p-button-secondary" 
        style="margin-left: 800px;"
        @click="$router.back()" 
      />
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex gap-6">
        <!-- Cột trái -->
        <div class="flex-1 space-y-4">
          <div>
            <label class="block font-medium">Tên khuyến mãi</label>
            <input
              v-model="discount.name"
              :class="{'border-red-500': errors.name}"
              class="w-full border px-2 py-1 rounded"
              placeholder="Nhập tên"
            />
            <small v-if="errors.name" class="text-red-600 mt-1 block text-sm">{{ errors.name }}</small>
          </div>

          <div>
            <label class="block font-medium">Phần trăm giảm (%)</label>
            <input
              v-model.number="discount.percentValue"
              type="number"
              :class="{'border-red-500': errors.percentValue}"
              class="w-full border px-2 py-1 rounded"
            
            />
            <small v-if="errors.percentValue" class="text-red-600 mt-1 block text-sm">{{ errors.percentValue }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngày bắt đầu</label>
            <input
              v-model="discount.startDate"
              type="datetime-local"
              :class="{'border-red-500': errors.startDate}"
              class="w-full border px-2 py-1 rounded"
            />
            <small v-if="errors.startDate" class="text-red-600 mt-1 block text-sm">{{ errors.startDate }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngày kết thúc</label>
            <input
              v-model="discount.endDate"
              type="datetime-local"
              :class="{'border-red-500': errors.endDate}"
              class="w-full border px-2 py-1 rounded"
            />
            <small v-if="errors.endDate" class="text-red-600 mt-1 block text-sm">{{ errors.endDate }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngưỡng giá áp dụng</label>
            <input
              v-model.number="discount.priceThreshold"
              type="number"
              class="w-full border px-2 py-1 rounded"
              min="0"
            />
          </div>
        </div>

        <!-- Cột phải -->
        <div class="flex-1 space-y-4">
        <div>
  <label class="block font-medium mb-2">Danh mục áp dụng</label>
  <Dropdown
    v-model="selectedCategoryId"
    :options="categories"
    optionLabel="name"
    optionValue="id"
    placeholder="Chọn danh mục"
    class="w-full"
    @change="fetchProductsByCategory"
  />
</div>
          <div>
            <label class="block font-medium mb-2">Sản phẩm áp dụng</label>
              <InputText
              v-model="searchKeyword"
              placeholder="Tìm kiếm sản phẩm theo tên"
              class="p-inputtext-sm w-full mb-2"
              @input="onSearchInput"
            />
            <DataTable
              :value="products"
              dataKey="id"
              v-model:selection="selectedProducts"
              selectionMode="multiple"
              paginator
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20]"
              class="mt-2"
            >
              <Column selectionMode="multiple" style="width: 3em" />
              <Column field="id" header="ID" sortable />
              <Column field="name" header="Tên sản phẩm" sortable />
          <Column field="price" header="Giá" sortable>
  <template #body="{ data }">
    {{ formatPrice(data.price) }}
  </template>
</Column>
            </DataTable>
          </div>
        </div>
      </div>
      

    <div class="flex justify-start mt-4">
  <Button 
    type="submit"
    label="Lưu khuyến mãi" 
    icon="pi pi-save" 
    severity="primary"
    class="px-4 py-2"
  />
</div>

    </form>

    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { CategoryService } from '../../../../service/admin/CategoryService'
import { ProductService } from '../../../../service/admin/ProductServiceLegacy'
import { DiscountService } from '../../../../service/admin/DiscountService'

interface Category {
  id: number
  name: string
}

interface Product {
 id: number
  name: string
  price: number | null
}

interface DiscountRequest {
  name: string
  percentValue: number
  startDate: string
  endDate: string
  priceThreshold: number
  applyToAll: boolean
  productIds: number[]
}

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])
const selectedCategoryId = ref<number | null>(0) // Mặc định chọn "Tất cả sản phẩm"
const searchKeyword = ref('')
const discount = ref<DiscountRequest>({
  name: '',
  percentValue: 0,
  startDate: '',
  endDate: '',
  priceThreshold: 0,
  applyToAll: false,
  productIds: []
})

const errors = ref<{ [key: string]: string }>({})
const toast = useToast()

// Load danh mục khi component mounted
onMounted(async () => {
  try {
    const res = await CategoryService.getAllCategories()
    categories.value = res.data || []
      categories.value = [{ id: 0, name: 'Tất cả sản phẩm' }, ...(res.data || [])]
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi tải danh mục', detail: 'Không thể tải danh mục.', life: 4000 })
  }

  // Load toàn bộ sản phẩm con ban đầu
  await loadAllChildProducts()
})

// Hàm load tất cả sản phẩm con từ API gốc
const loadAllChildProducts = async () => {
  try {
    const prodRes = await ProductService.getAllChildProducts()
    const rawData = prodRes.data || []

    products.value = rawData.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price ?? null // để đảm bảo đúng với kiểu Product
    }))
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi tải sản phẩm',
      detail: 'Không thể tải danh sách sản phẩm.',
      life: 4000
    })
  }
}


// Hàm load sản phẩm theo danh mục khi chọn dropdown
const fetchProductsByCategory = async () => {
  if (selectedCategoryId.value === 0 || selectedCategoryId.value === null) {
    await loadAllChildProducts()
  } else {
    try {
      const res = await ProductService.getChildProductsByCategoryId(selectedCategoryId.value)
      products.value = res
    } catch (err) {
      console.error('Fetch products by category error:', err)
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi tải sản phẩm', 
        detail: 'Không thể tải sản phẩm từ danh mục.', 
        life: 4000 
      })
    }
  }
}
// Cập nhật danh sách productIds mỗi khi chọn sản phẩm thay đổi
watch(selectedProducts, (val) => {
  discount.value.productIds = val.map(p => p.id)
})

// const formatPrice = (product: Product) => {
//   if (product.price === null) return '0 ₫'; // hoặc bạn có thể trả về 'Chưa có giá'
//   return product.price.toLocaleString('vi-VN', {
//     style: 'currency',
//     currency: 'VND'
//   });
// }
const formatPrice = (price: number | string | null): string => {
  if (price === null || price === undefined || price === '') return '0 ₫';
  
  // Convert string to number nếu cần
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^\d.]/g, '')) 
    : price;

  return numericPrice.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}


const validate = () => {
  errors.value = {}
  // const nameRegex = /^[\p{L}\d\s]+$/u 
  // \p{L} = chữ cái Unicode, \d = số, \s = khoảng trắng

  // ✅ Check tên khuyến mãi
  if (!discount.value.name?.trim()) {
    errors.value.name = 'Tên khuyến mãi không được để trống.'
  } else if (discount.value.name.length > 50) {
    errors.value.name = 'Tên khuyến mãi không được vượt quá 50 ký tự.'
  // } else if (!nameRegex.test(discount.value.name.trim())) {
  //   errors.value.name = 'Tên khuyến mãi không được chứa ký tự đặc biệt.'
  // }
  }
  if (!discount.value.percentValue || discount.value.percentValue < 1 || discount.value.percentValue > 100) {
    errors.value.percentValue = 'Phần trăm giảm phải từ 1 đến 100.'
  }
  if (!discount.value.startDate) errors.value.startDate = 'Ngày bắt đầu không được để trống.'
  if (!discount.value.endDate) errors.value.endDate = 'Ngày kết thúc không được để trống.'
 

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) {
    toast.add({ severity: 'warn', summary: 'Lỗi dữ liệu', detail: 'Vui lòng điền đúng thông tin.', life: 4000 })
    return
  }

  try {
    const payload = {
      ...discount.value,
      startDate: discount.value.startDate + ':00',
      endDate: discount.value.endDate + ':00'
    }

    console.log('Payload:', payload)

    await DiscountService.saveDiscount(payload)

    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Lưu khuyến mãi thành công!', life: 3000 })

    discount.value = {
      name: '',
      percentValue: 0,
      startDate: '',
      endDate: '',
      priceThreshold: 0,
      applyToAll: false,
      productIds: []
    }
    selectedProducts.value = []
    selectedCategoryId.value = null
    products.value = []
    
    // Load lại toàn bộ sản phẩm con sau khi reset form
    await loadAllChildProducts()
  } catch (err: any) {
    let msg = 'Đã xảy ra lỗi khi gửi dữ liệu.'
    if (err.response?.status === 400 && err.response.data?.message) msg = err.response.data.message
    else if (err.response?.status === 405) msg = 'Phương thức không được hỗ trợ (405).'
    else if (err.response?.data?.error) msg = err.response.data.error

    toast.add({ severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 })
  }
}
const doSearch = async (keyword: string) => {
  if (!keyword.trim()) {
    // Nếu xóa hết search thì load lại toàn bộ sản phẩm
    await loadAllChildProducts()
    return
  }

  try {
    const res = await ProductService.findChildProductsByName(keyword)
    const data = Array.isArray(res) 
    products.value = res
    // Giữ nguyên selectedProducts, KHÔNG đổi gì cả
  } catch {
    toast.add({ severity: 'error', summary: 'Lỗi tìm kiếm', detail: 'Không thể tìm sản phẩm.', life: 3000 })
  }
}

// Debounce để search khi gõ, tránh gọi API quá nhiều
let debounceTimeout: number | undefined
const onSearchInput = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    doSearch(searchKeyword.value)
  }, 300)
}

</script>

<style scoped>
form > div.flex {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1rem;
  gap: 2rem;
}
form > div.flex > div.flex-1:first-child {
  border-right: 1px solid #ddd;
  padding-right: 1.5rem;
}
form > div.flex > div.flex-1:last-child {
  padding-left: 1.5rem;
}
.flex-1 > div {
  margin-bottom: 1.8rem;
}
label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  font-size: 1rem;
}
input {
  padding: 0.7rem 0.9rem;
  font-size: 1rem;
  border-radius: 0.4rem;
  border: 1px solid #ccc;
  transition: border-color 0.2s ease-in-out;
}
.border-red-500 {
  border-color: #ef4444 !important;
  box-shadow: 0 0 5px #ef4444aa;
}
input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 6px #3b82f6bb;
}
.p-datatable-tbody > tr > td {
  padding: 0.9rem 1.2rem;
}
.p-dropdown-items-wrapper .p-dropdown-item:first-child {
  font-weight: bold;
  color: #3b82f6;
}
</style>