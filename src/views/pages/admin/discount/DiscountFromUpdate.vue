<template>
  <div class="p-4 max-w-4xl mx-auto bg-white rounded shadow">
      
      
      <br>
    <h2 class="text-xl font-semibold mb-4">Cập nhật khuyến mãi</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex gap-6">
        <!-- Cột trái: các input cơ bản -->
        <div class="flex-1 space-y-4">
          <div>
            <label class="block font-medium">Tên khuyến mãi</label>
            <input v-model="discount.name" :class="{ 'border-red-500': errors.name }" class="w-full border px-2 py-1 rounded" placeholder="Nhập tên" />
            <small v-if="errors.name" class="text-red-600 mt-1 block text-sm">{{ errors.name }}</small>
          </div>

          <div>
            <label class="block font-medium">Phần trăm giảm (%)</label>
            <input v-model.number="discount.percentValue" type="number" :class="{ 'border-red-500': errors.percentValue }" class="w-full border px-2 py-1 rounded"/>
            <small v-if="errors.percentValue" class="text-red-600 mt-1 block text-sm">{{ errors.percentValue }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngày bắt đầu</label>
            <input v-model="discount.startDate" type="datetime-local" :class="{ 'border-red-500': errors.startDate }" class="w-full border px-2 py-1 rounded" />
            <small v-if="errors.startDate" class="text-red-600 mt-1 block text-sm">{{ errors.startDate }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngày kết thúc</label>
            <input v-model="discount.endDate" type="datetime-local" :class="{ 'border-red-500': errors.endDate }" class="w-full border px-2 py-1 rounded" />
            <small v-if="errors.endDate" class="text-red-600 mt-1 block text-sm">{{ errors.endDate }}</small>
          </div>

          <div>
            <label class="block font-medium">Ngưỡng giá áp dụng</label>
            <input v-model.number="discount.priceThreshold" type="number" class="w-full border px-2 py-1 rounded" min="0" />
          </div>
        </div>

        <!-- Cột phải: chọn danh mục + sản phẩm -->
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
              <!-- <Column field="price" header="Giá" :body="formatPrice" sortable /> -->
               <Column field="price" header="Giá" sortable>
  <template #body="{ data }">
    {{ formatPrice(data.price) }}
  </template>
</Column>

            </DataTable>

            <!-- Hiển thị danh sách sản phẩm đã chọn để chắc chắn người dùng biết -->
            <!-- <div v-if="selectedProducts.length" class="mt-4 p-2 border rounded bg-gray-50">
              <h4 class="font-semibold mb-2">Sản phẩm đã chọn:</h4>
              <ul class="list-disc list-inside text-sm">
                <li v-for="p in selectedProducts" :key="p.id">{{ p.name }} - {{ formatPrice(p) }}</li>
              </ul>
            </div> -->
          </div>
        </div>
      </div>

<div class="flex justify-start mt-4">
  <Button 
    type="submit"
    label="Cập nhật sản phẩm" 
    icon="pi pi-box"
    severity="primary"
    class="px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
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
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
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
  categoryIds?: number[]
  priceThreshold: number
  applyToAll: boolean
  productIds: number[]
}

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])
const searchKeyword = ref('')
const selectedCategoryId = ref<number | null>(0) // Mặc định chọn "Tất cả"
const discount = ref<DiscountRequest>({
  name: '',
  percentValue: 0,
  startDate: '',
  endDate: '',
  categoryIds: [],
  priceThreshold: 0,
  applyToAll: false,
  productIds: []
})
const errors = ref<{ [key: string]: string }>({})
const toast = useToast()
const route = useRoute()
const id = route.params.id as string | undefined

// const formatPrice = (product: Product) => {
//   console.log(product.price)
//   if (product.price === null) return '0 ₫'; // hoặc bạn có thể trả về 'Chưa có giá'
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


const loadInitialData = async () => {
  try {
    const catRes = await CategoryService.getAllCategories()
    categories.value = catRes.data || []

    const prodRes = await ProductService.getAllChildProducts()
    products.value = prodRes.data || []
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi tải dữ liệu', detail: 'Không thể tải danh mục hoặc sản phẩm.', life: 4000 })
  }
}

const loadDiscount = async () => {
  if (!id) return;

  try {
    const data = await DiscountService.getDiscountById(Number(id));
    
    discount.value.name = data.name || '';
    discount.value.percentValue = parseFloat(String(data.discountPercentage || '').replace(/[^\d.]/g, '')) || 0;
    discount.value.startDate = data.startDate?.slice(0, 16) || '';
    discount.value.endDate = data.endDate?.slice(0, 16) || '';
    
    // Sửa ở đây - kiểm tra tồn tại trước khi truy cập length
    discount.value.categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds : [];
    discount.value.priceThreshold = data.priceThreshold || 0;
    discount.value.applyToAll = data.applyToAll || false;
    discount.value.productIds = Array.isArray(data.productResponses) 
      ? data.productResponses.map((p: any) => p.id) 
      : [];

    if (products.value.length === 0) {
      await loadProductsAll();
    }

    selectedProducts.value = products.value.filter(p =>
      discount.value.productIds.includes(p.id)
    );

    // Sửa phần chọn category - kiểm tra mảng có phần tử không
    if (discount.value.categoryIds?.length > 0) {
      selectedCategoryId.value = discount.value.categoryIds[0];
    } else {
      selectedCategoryId.value = 0; // Mặc định "Tất cả"
    }
    
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi tải chi tiết',
      detail: 'Không tìm thấy khuyến mãi hoặc lỗi server.',
      life: 4000
    });
  }
};

const loadProductsAll = async () => {
  try {
    const res = await ProductService.getAllChildProducts()
    products.value = res.data || []
  } catch {
toast.add({ severity: 'error', summary: 'Lỗi tải sản phẩm', detail: 'Không thể tải danh sách sản phẩm.', life: 3000 })
  }
}

// Đồng bộ selectedProducts thành productIds trong discount
watch(selectedProducts, (val) => {
  discount.value.productIds = val.map(p => p.id)
})

// Hàm load sản phẩm theo danh mục khi chọn dropdown
const fetchProductsByCategory = async () => {
  if (selectedCategoryId.value === 0 || selectedCategoryId.value === null) {
    await loadProductsAll() // Load tất cả sản phẩm khi chọn "Tất cả"
  } else {
    try {
      const res = await ProductService.getChildProductsByCategoryId(selectedCategoryId.value)
      products.value = res
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err)
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Không thể tải sản phẩm từ danh mục.', 
        life: 4000 
      })
    }
  }
}
// Validation form
const validate = () => {
  errors.value = {}

  if (!discount.value.name.trim()) errors.value.name = 'Tên khuyến mãi không được để trống.'
   else if (discount.value.name.length > 50) {
    errors.value.name = 'Tên khuyến mãi không được vượt quá 50 ký tự.'
  }
  if (!discount.value.startDate) errors.value.startDate = 'Ngày bắt đầu không được để trống.'
  if (!discount.value.endDate) errors.value.endDate = 'Ngày kết thúc không được để trống.'

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) {
    toast.add({ severity: 'warn', summary: 'Lỗi dữ liệu', detail: 'Vui lòng điền đúng thông tin trước khi lưu.', life: 4000 })
    return
  }

  try {
    const payload: DiscountRequest = {
      ...discount.value,
      startDate: discount.value.startDate + ':00',
      endDate: discount.value.endDate + ':00'
    }

 if (!id) {
  // Xử lý trường hợp id không tồn tại (undefined hoặc rỗng)
  console.error("ID không tồn tại");
} else {
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    console.error("ID không hợp lệ, không phải số");
  } else {
    // dùng idNumber kiểu number rồi gọi API, hàm, ...
    await DiscountService.updateDiscount(idNumber, payload);
  }
}


    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật khuyến mãi thành công!', life: 3000 })
  } catch (err: any) {
    let msg = 'Đã xảy ra lỗi khi gửi dữ liệu.'
    if (err.response?.status === 400 && err.response.data?.message) msg = err.response.data.message
    else if (err.response?.status === 405) msg = 'Phương thức không được hỗ trợ (405).'
    else if (err.response?.data?.error) msg = err.response.data.error

    toast.add({ severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 })
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

const doSearch = async (keyword: string) => {
  if (!keyword.trim()) {
    // Nếu xóa hết search thì load lại toàn bộ sản phẩm
    await loadProductsAll()
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

onMounted(async () => {
  try {
    const catRes = await CategoryService.getAllCategories()
    categories.value = [
      { id: 0, name: 'Tất cả sản phẩm' }, // Thêm option "Tất cả"
      ...(catRes.data || [])
    ]
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi tải dữ liệu', detail: 'Không thể tải danh mục.', life: 4000 })
  }
  await loadDiscount()
})
</script>

<style scoped>
.discount-banner {
  width: 100%;
  height: 70px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f8edb 0%, #7ab0f5 100%); /* xanh biển nhẹ */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;
  box-shadow: 0 2px 6px rgba(122, 176, 245, 0.5); /* bóng nhẹ cùng tông */
  padding: 10px;
}

.banner-text {
  font-size: 24px;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15); /* bóng chữ nhẹ */
  margin-bottom: 4px;
}

.banner-subtext {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

/* Container chính */
div.p-4 {
  background-color: #fff;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
  border-radius: 8px;
}

/* Tiêu đề */
h2 {
  color: #1e40af; /* xanh dương đậm */
  font-weight: 700;
  border-bottom: 2px solid #3b82f6; /* viền dưới màu xanh sáng */
  padding-bottom: 0.5rem;
}

/* Label */
label {
  color: #374151; /* xám đậm */
  font-weight: 600;
}

/* Input, select, textarea chung */
input,
.MultiSelect,
.InputText,
.p-inputtext {
  border: 1.5px solid #d1d5db; /* xám nhạt */
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

/* Khi input focus */
input:focus,
.MultiSelect:focus,
.InputText:focus,
.p-inputtext:focus {
  outline: none;
  border-color: #2563eb; /* xanh dương */
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
}

/* Lỗi input */
.border-red-500 {
  border-color: #ef4444 !important; /* đỏ */
}

/* Text lỗi */
.text-red-600 {
  color: #b91c1c;
  font-weight: 500;
}

/* Nút submit */
button[type="submit"] {
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  border: none;
  cursor: pointer;
  padding: 0.75rem 0;
border-radius: 8px;
}

button[type="submit"]:hover {
  background-color: #1d4ed8;
}

/* Khoảng cách giữa các trường */
.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Khoảng cách cột */
.flex.gap-6 {
  gap: 1.5rem;
}

/* Style cho DataTable */
.p-datatable {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.05);
}

/* Tiêu đề cột */
.p-datatable-thead > tr > th {
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

/* Dòng dữ liệu */
.p-datatable-tbody > tr {
  transition: background-color 0.2s ease;
}

.p-datatable-tbody > tr:hover {
  background-color: #e0e7ff; /* xanh nhạt khi hover */
}

/* MultiSelect chip hiển thị đẹp */
.p-multiselect-token {
  background-color: #3b82f6;
  color: white;
  border-radius: 12px;
  padding: 0 0.5rem;
  margin: 0 4px 4px 0;
  font-weight: 500;
}

/* Placeholder input */
input::placeholder,
.InputText::placeholder {
  color: #9ca3af;
  font-style: italic;
}

/* Scroll bar cho bảng sản phẩm nếu cần */
.p-datatable-wrapper {
  max-height: 320px;
  overflow-y: auto;
}


</style>