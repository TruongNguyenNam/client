<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <div class="left-section">
        <div class="shipping-info-card card">
          <h2 class="card-title">Thông tin giao hàng</h2>
          <div class="card-content">
            <div class="user-info">
              <div class="avatar"></div>
              <div>
                <div class="user-name">{{ authStore.userInfo?.username || authStore.userInfo?.email || 'Khách hàng' }}
                </div>
                <a href="#" class="logout-link" @click.prevent="logout">Đăng xuất</a>
              </div>
            </div>

            <AddressSelectDialog v-model:visible="showAddressDialog" :addresses="addresses || []"
              :customer-id="authStore.userInfo?.userId ?? 0" :key="addressDialogKey" @select="handleAddressSelect"
              @cancel="showAddressDialog = false" @submitAddress="handleAddressSubmit"
              @deleteAddress="handleAddressDelete" />
            <!-- Địa chỉ giao hàng -->
            <div class="shipping-address-block">
              <label class="block text-sm text-gray-600 mb-2">Địa chỉ giao hàng</label>
              <div class="bg-white p-3 rounded border mb-3">
                <div v-if="addresses.length > 0" class="mt-3">
                  <div class="mb-2">
                    <i class="pi pi-user mr-2"></i> <strong>{{ selectedAddress?.receiverName }}</strong> - {{
                      selectedAddress?.receiverPhone }}
                  </div>
                  <div class="text-sm text-gray-700 leading-relaxed">
                    <i class="pi pi-map-marker mr-2"></i> {{ fullAddress }}
                  </div>
                </div>
                <div v-if="addresses.length > 1" class="mt-3">
                  <Button label="Chọn địa chỉ giao hàng khác" icon="pi pi-map-marker" outlined class="w-full"
                    @click="showAddressDialog = true" />
                </div>
                <div v-if="addresses.length <= 1" class="mt-3">
                  <Button label="Thêm địa chỉ giao hàng" icon="pi pi-map-marker" outlined class="w-full"
                    @click="showAddressDialog = true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="shipping-method-card card">
          <h2 class="card-title">Phương thức vận chuyển</h2>
          <div class="card-content">
            <div v-if="!form.addressWard" class="shipping-note">Vui lòng chọn phường/xã để có danh sách phương thức vận
              chuyển.</div>
            <div v-else v-for="carrier in carriers" :key="carrier.id" class="shipping-option">
              <input type="radio" :id="carrier.name" v-model="form.shippingMethod" :value="carrier" />
              <label :for="carrier.name">{{ carrier.name }} ({{ shippingCost > 0 ? formatPrice(shippingCost)
                : 'Miễn Phí' }})</label>
            </div>
          </div>
        </div>

        <div class="payment-method-card card">
          <h2 class="card-title">Phương thức thanh toán</h2>
          <div class="card-content">
            <div v-for="method in paymentMethods" :key="method.id" class="payment-option">
              <input type="radio" :id="method.name" v-model="form.paymentMethod" :value="method" />
              <label :for="method.name">{{ method.name }}</label>
            </div>
          </div>
        </div>
      </div>



      <div class="right-section">
        <div class="order-summary-card card">
          <div class="card-content">
            <div v-for="item in authStore.cart" :key="item.id" class="product-item">
              <img :src="getFirstImage(item.product?.imageUrl)" alt="product" class="product-image" />
              <div class="product-details">
                <div class="product-name">{{ item.product?.name || 'Không có tên' }}</div>
                <div class="product-size">Thuộc tính: {{ getAttributesText(item.product?.productAttributeValueResponses)
                }}</div>
              </div>
              <div class="product-price">{{ formatPrice(item.product?.price * item.quantity) }}</div>
            </div>

            <div class="coupon-section">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Mã giảm giá</h3>
              <MultiSelect v-model="selectedCoupons" :options="couponUsage" optionLabel="couponCode"
                placeholder="Chọn mã giảm giá (nếu có)" class="w-full" @change="applyCoupons">
                <template #option="slotProps">
                  <div>{{ slotProps.option.couponCode }} (-{{ formatPrice(slotProps.option.couponDiscountAmount) }})
                  </div>
                </template>
              </MultiSelect>
              <p v-if="couponDiscount > 0" class="text-green-600 text-sm mt-2">
                Đã áp dụng giảm giá: -{{ formatPrice(couponDiscount) }}
              </p>
              <p v-if="couponError" class="text-red-600 text-sm mt-2">{{ couponError }}</p>
            </div>

            <div class="total-section">
              <div class="total-item">Tạm tính <span class="total-amount">{{ formatPrice(subtotal) }}</span></div>
              <div class="total-item">Giảm giá <span class="total-amount">{{ couponDiscount > 0 ? '-' +
                formatPrice(couponDiscount)
                : '—' }}</span></div>
              <div class="total-item">Phí vận chuyển <span class="total-amount">{{ shippingCost > 0 ?
                formatPrice(shippingCost) :
                'Miễn phí' }}</span></div>
              <div class="total-item total-final">Tổng cộng <span class="total-amount">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <button class="place-order-button" @click="showConfirmDialog = true" :disabled="loading || !isFormValid">Đặt
              hàng</button>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showConfirmDialog" header="Xác nhận đơn hàng" modal>
      <p>Bạn có chắc muốn đặt đơn hàng với tổng tiền {{ formatPrice(total) }}?</p>
      <template #footer>
        <Button label="Hủy" text @click="showConfirmDialog = false" />
        <Button label="Xác nhận" @click="submitOrder" :disabled="loading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { ComputedRef } from 'vue';
import type { CouponUsageClientResponse } from '../../../../model/client/couponUsage';
import type { CarrierClientResponse } from '../../../../model/client/carrier';
import type { PaymentMethodClientResponse } from '../../../../model/client/paymentMethod';
import type { OrderRequestClient, OrderResponseClient } from '../../../../model/client/cart';
import { CouponUsageClientService } from '../../../../service/client/CouponUsageClientService';
import { CarrierClientService } from '../../../../service/client/CarrierClientService';
import { PaymentMethodClientService } from '../../../../service/client/PaymentMethodClient';
import { CartClientService } from '../../../../service/client/CartClientService';
import { AuthService } from '../../../../service/auth/AuthService';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../../../stores/auth';
import provincesData from '../../../../assets/data/vietnam_provinces.json';
import Dialog from 'primevue/dialog'; 
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import AddressSelectDialog from '../../../../views/pages/admin/order/AddressSelectDialog.vue';
import type { AddressResponse } from '../../../../model/admin/address';
import { AddressService } from '../../../../service/admin/AddressService';
import { CustomerService } from '../../../../service/admin/CustomerServiceLegacy';

const formatPrice = (price: number | undefined | null): string => {
  if (price == null || isNaN(price)) {
    return '0 ₫';
  }
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const loading = ref<boolean>(false);
const showConfirmDialog = ref<boolean>(false);
const couponDiscount = ref<number>(0);
const couponError = ref<string>('');
const note = ref<string>('');

const paymentMethods = ref<PaymentMethodClientResponse[]>([]);
const carriers = ref<CarrierClientResponse[]>([]);
const couponUsage = ref<CouponUsageClientResponse[]>([]);
const selectedCoupons = ref<CouponUsageClientResponse[]>([]);

const form = ref<CheckoutForm>({
  fullName: '',
  phone: '',
  email: '',
  addressProvince: '',
  addressDistrict: '',
  addressWard: '',
  receiverName: '',
  receiverPhone: '',
  shippingMethod: null,
  paymentMethod: null,
});

const provinces = ref<Location[]>([]);
const districts = ref<Location[]>([]);
const wards = ref<Location[]>([]);

interface Location {
  id: string;
  name: string;
  type?: string;
  level2s?: Location[];
  level3s?: Location[];
}

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  addressProvince: string;
  addressDistrict: string;
  addressWard: string;
  receiverName?: string;
  receiverPhone?: string;
  shippingMethod: CarrierClientResponse | null;
  paymentMethod: PaymentMethodClientResponse | null;
}

interface UserResponse {
  userId: number;
  username: string;
  email: string;
  message?: string;
  role: string;
  phoneNumber: string | null;
  gender: string | null;
  isActive: boolean;
  address: UserAddress[] | null;
}

interface UserAddress {
  id: number;
  addressStreet: string;
  addressWard: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressZipcode: string;
  addressDistrict: string;
  addressProvince: string;
  receiverName?: string;
  receiverPhone?: string;
  isDefault?: boolean;
}

interface UpdateUserForm {
  email: string;
  phoneNumber: string;
  gender: string;
  address: AddressForm;
}

interface AddressForm {
  id: number;
  addressStreet: string;
  addressWard: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressZipcode: string;
  addressDistrict: string;
  addressProvince: string;
  receiverName?: string;
  receiverPhone?: string;
  isDefault?: boolean;
}
console.log('Selected userInfo:', authStore.userInfo);
console.log('Selected address:', authStore.userInfo?.addresses);
// dia chi

// Map UserAddress[] -> AddressResponse[]
const addresses = computed(() => {
  const addressesRaw = authStore.userInfo?.addresses ?? [];
  return addressesRaw.map(addr => ({
    id: addr.id,
    street: addr.addressStreet,
    ward: addr.addressWard,
    city: addr.addressCity,
    state: addr.addressState,
    country: addr.addressCountry,
    zipcode: addr.addressZipcode,
    district: addr.addressDistrict,
    province: addr.addressProvince,
    receiverName: addr.receiverName ?? "",
    receiverPhone: addr.receiverPhone ?? "",
    isDefault: !!addr.isDefault,
  }));
});

const handleAddressDelete = async () => {
  await authStore.fetchUserInfo(); // Đồng bộ lại dữ liệu user và địa chỉ
  addressDialogKey.value++;        // Nếu cần reset dialog
  // Vue sẽ tự động cập nhật addresses và selectedAddress nếu bạn dùng computed như hướng dẫn ở trên
};

const showAddressDialog = ref(false);
const selectedAddress = ref<UserAddress | null>(null);
const addressDialogKey = ref(0);

// Xử lý khi chọn địa chỉ từ dialog
function handleAddressSelect(address: AddressResponse) {
  const addr = mapToUserAddress(address);
  selectedAddress.value = addr;
  showAddressDialog.value = false;
  form.value.addressProvince = addr.addressProvince;
  form.value.addressDistrict = addr.addressDistrict;
  form.value.addressWard = addr.addressWard;
  form.value.receiverName = addr.receiverName || '';
  form.value.receiverPhone = addr.receiverPhone || '';
  form.value.shippingMethod = null; // reset nếu muốn chọn lại
}

// Chuyển đổi AddressResponse sang UserAddress
function mapToUserAddress(address: AddressResponse): UserAddress {
  return {
    id: address.id,
    addressStreet: address.street,
    addressWard: address.ward,
    addressCity: address.city,
    addressState: address.state,
    addressCountry: address.country,
    addressZipcode: address.zipcode,
    addressDistrict: address.district,
    addressProvince: address.province,
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    isDefault: address.isDefault,
  };
}

const fullAddress = computed(() => {
  if (!selectedAddress.value) return '';
  const addr = selectedAddress.value;
  return [
    addr.addressStreet,
    addr.addressWard,
    addr.addressDistrict,
    addr.addressProvince,
    addr.addressCity,
    addr.addressZipcode,

  ].filter(Boolean).join(', ');
});
console.log('Selected address:', selectedAddress.value);

const provinceOptions = provincesData.data;
// id của địa chỉ được chọn
const selectedAddressId = ref<number | null>(null);

// Lấy địa chỉ mặc định hoặc đầu tiên nếu không có địa chỉ mặc định
watch(addresses, (newAddresses) => {
  if (newAddresses.length > 0) {
    const defaultAddress = newAddresses.find(addr => addr.isDefault) || newAddresses[0];
    selectedAddress.value = mapToUserAddress(defaultAddress);
  } else {
    selectedAddress.value = null;
  }
}, { immediate: true });

const handleAddressSubmit = async (submittedData: any) => {
  if (!authStore.userInfo?.userId) return;
  const province = provinceOptions.find(p => p.level1_id === submittedData.province);
  const district = province?.level2s.find(d => d.level2_id === submittedData.district);
  const ward = district?.level3s.find(w => w.level3_id === submittedData.ward);

  const finalAddress = {
    ...submittedData,
    province: province?.name || '',
    district: district?.name || '',
    ward: ward?.name || '',
    country: 'Việt Nam'
  };
  try {
    if (submittedData.id) {
      // Cập nhật địa chỉ
      const resAdd = await AddressService.updateAddressForCustomer(authStore.userInfo?.userId, submittedData.id, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã cập nhật địa chỉ thành công.',
        life: 3000
      });
      if (resAdd.data?.id) {
        await authStore.fetchUserInfo();
        // RESET lại dialog
        addressDialogKey.value++;
        showAddressDialog.value = false;
      }
      selectedAddressId.value = submittedData.id; // Cập nhật lại địa chỉ đang chọn
    } else {
      // Thêm mới địa chỉ
      const resAdd = await CustomerService.addAddressForCustomer(authStore.userInfo.userId, finalAddress);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã thêm địa chỉ mới cho khách hàng.',
        life: 3000
      });

    }
    await authStore.fetchUserInfo();
    // RESET lại dialog
    addressDialogKey.value++;
    showAddressDialog.value = false;
  } catch (error) {
    console.error('Lỗi xử lý địa chỉ:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xử lý địa chỉ', life: 3000 });
  }
};


//
// Computed properties
const subtotal: ComputedRef<number> = computed(() =>
  authStore.cart.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    const quantity = item.quantity ?? 0;
    return sum + price * quantity;
  }, 0)
);

const shippingCost: ComputedRef<number> = computed(() => {
  return subtotal.value > 500000 ? 0 : 30000; // Miễn phí nếu đơn hàng > 500k, ngược lại 30k
});

const total: ComputedRef<number> = computed(() => {
  return Math.max(0, subtotal.value - couponDiscount.value + shippingCost.value);
});

const isFormValid: ComputedRef<boolean> = computed(() =>
  !!form.value.fullName &&
  !!form.value.phone &&
  /^\d{10}$/.test(form.value.phone) &&
  !!form.value.email &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
  !!form.value.addressProvince &&
  !!form.value.addressDistrict &&
  !!form.value.addressWard &&
  !!form.value.shippingMethod &&
  !!form.value.paymentMethod
);

const normalizeLocationName = (name: string): string => {
  return name
    .replace(/^Thành phố\s+|^Tỉnh\s+|^Quận\s+|^Phường\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const onProvinceChange = () => {
  const province = provinces.value.find(p => p.name === form.value.addressProvince);
  districts.value = province?.level2s || [];
  form.value.addressDistrict = '';
  form.value.addressWard = '';
  wards.value = [];
  form.value.shippingMethod = null; // Reset shipping method
};

const onDistrictChange = () => {
  const district = districts.value.find(d => d.name === form.value.addressDistrict);
  wards.value = district?.level3s || [];
  form.value.addressWard = '';
  form.value.shippingMethod = null; // Reset shipping method
};

const applyCoupons = async () => {
  couponDiscount.value = 0;
  couponError.value = '';
  if (selectedCoupons.value.length === 0) {
    toast.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Không có mã giảm giá nào được chọn.',
      life: 3000,
    });
    return;
  }

  try {
    couponDiscount.value = selectedCoupons.value.reduce((sum, coupon) => {
      const discount = coupon.couponDiscountAmount ?? 0;
      if (discount <= 0) {
        throw new Error(`Mã ${coupon.couponCode} có số tiền giảm không hợp lệ: ${discount}`);
      }
      return sum + discount;
    }, 0);

    if (couponDiscount.value > subtotal.value) {
      couponDiscount.value = subtotal.value;
      couponError.value = 'Tổng số tiền giảm đã được giới hạn bằng tổng giá trị đơn hàng.';
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: couponError.value,
        life: 3000,
      });
    }

    if (couponDiscount.value > 0) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã áp dụng ${selectedCoupons.value.length} mã giảm giá, tổng giảm: ${formatPrice(couponDiscount.value)}.`,
        life: 3000,
      });
    }
  } catch (error: any) {
    console.error('Lỗi khi áp dụng mã giảm giá:', error);
    couponError.value = error.message || 'Có lỗi khi áp dụng mã giảm giá. Vui lòng thử lại.';
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: couponError.value,
      life: 3000,
    });
    couponDiscount.value = 0;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    provinces.value = provincesData.data.map((province: any) => ({
      id: province.level1_id,
      name: province.name,
      type: province.type,
      level2s: province.level2s?.map((district: any) => ({
        id: district.level2_id,
        name: district.name,
        type: district.type,
        level3s: district.level3s?.map((ward: any) => ({
          id: ward.level3_id,
          name: ward.name,
          type: ward.type,
        })) || [],
      })) || [],
    }));

    await Promise.all([
      authStore.fetchUserInfo(),
      authStore.fetchCart(),
      getAllPaymentMethods(),
      getAllCouponUsage(),
      getAllCarriers(),
    ]);

    if (authStore.cart.some(item => !item.product || item.product.price == null)) {
      console.error('Dữ liệu giỏ hàng không hợp lệ:', authStore.cart);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Dữ liệu giỏ hàng không hợp lệ. Vui lòng thử lại.',
        life: 3000,
      });
      authStore.cart = [];
    }

    if (authStore.userInfo && authStore.userInfo.addresses && authStore.userInfo.addresses.length > 0) {
      const defaultAddress = authStore.userInfo.addresses.find(addr => addr.isDefault) || authStore.userInfo.addresses[0];
      form.value.addressProvince = defaultAddress.addressProvince;
      form.value.addressDistrict = defaultAddress.addressDistrict;
      form.value.addressWard = defaultAddress.addressWard;
      form.value.receiverName = defaultAddress.receiverName || '';
      form.value.receiverPhone = defaultAddress.receiverPhone || '';
    }
    note.value = route.query.note?.toString() || localStorage.getItem('cartNote') || '';

    // Thông báo miễn phí vận chuyển nếu subtotal > 500k
    if (subtotal.value > 500000) {
      toast.add({
        severity: 'info',
        summary: 'Thông báo',
        detail: 'Đơn hàng của bạn được miễn phí vận chuyển!',
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
});

const getAllPaymentMethods = async () => {
  loading.value = true;
  try {
    const response = await PaymentMethodClientService.getAllPaymentMethod();
    if (response && response.data) {
      paymentMethods.value = response.data;
      if (response.data.length > 0 && !form.value.paymentMethod) {
        form.value.paymentMethod = response.data.find(m => m.name === 'COD') || response.data[0];
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phương thức thanh toán:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách phương thức thanh toán',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const getAllCouponUsage = async () => {
  loading.value = true;
  try {
    const userId = authStore.userId;
    if (!userId) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng đăng nhập để xem mã giảm giá',
        life: 3000,
      });
      return;
    }
    const response = await CouponUsageClientService.getAllCouponUsage(userId);
    if (response && response.data) {
      couponUsage.value = response.data.filter(
        coupon => coupon.couponStatus === 'ACTIVE' && coupon.usedDate === null
      );
      console.log('Coupon Usage:', couponUsage.value);
      if (couponUsage.value.length === 0) {
        toast.add({
          severity: 'info',
          summary: 'Thông báo',
          detail: 'Bạn hiện không có mã giảm giá khả dụng.',
          life: 3000,
        });
      }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách mã giảm giá.',
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách mã giảm giá. Vui lòng thử lại.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const getAllCarriers = async () => {
  loading.value = true;
  try {
    const response = await CarrierClientService.getAllCarriers();
    if (response && response.data) {
      carriers.value = response.data;
    } else {
      carriers.value = [];
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn vị vận chuyển:', error);
    carriers.value = [];
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách đơn vị vận chuyển',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userInfo');
  localStorage.removeItem('cartNote');
  authStore.clearUser();
  router.push('/login');
};

const getFirstImage = (images: string[] | null | undefined): string => {
  return images && images.length > 0 ? images[0] : 'https://via.placeholder.com/80';
};

const getAttributesText = (attributes: { attributeName: string; value: string }[] | null | undefined): string => {
  if (!attributes || attributes.length === 0) return 'Không có thuộc tính';
  const mainAttributes = attributes.filter(attr =>
    ['size', 'kích thước', 'color', 'màu sắc'].includes(attr.attributeName.toLowerCase())
  );
  return mainAttributes.length > 0
    ? mainAttributes.map(attr => `${attr.attributeName}: ${attr.value}`).join(', ')
    : 'Không có thuộc tính chính';
};

const submitOrder = async () => {
  if (!authStore.userId) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng đăng nhập để thanh toán.',
      life: 3000,
    });
    router.push('/login');
    return;
  }

  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin và đảm bảo số điện thoại và email hợp lệ.',
      life: 3000,
    });
    return;
  }

  if (authStore.cart.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng thêm sản phẩm vào giỏ hàng.',
      life: 3000,
    });
    return;
  }

  if (authStore.cart.some(item => item.quantity > (item.product?.stockQuantity ?? 0))) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Một số sản phẩm trong giỏ hàng không đủ tồn kho.',
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    const updateForm: UpdateUserForm = {
      email: form.value.email,
      phoneNumber: form.value.phone,
      gender: authStore.userInfo?.gender || '',
      address: {
        id: authStore.userInfo?.addresses?.id || 0,
        addressStreet: '',
        addressWard: form.value.addressWard,
        addressDistrict: form.value.addressDistrict,
        addressProvince: form.value.addressProvince,
        addressCity: authStore.userInfo?.addresses?.addressCity || '',
        addressState: authStore.userInfo?.addresses?.addressState || '',
        addressCountry: authStore.userInfo?.addresses?.addressCountry || 'Việt Nam',
        addressZipcode: authStore.userInfo?.addresses?.addressZipcode || '',
      },
    };
    
    await AuthService.updateUserAddress(authStore.userId!, updateForm);
    await authStore.fetchUserInfo();

    const orderRequest: OrderRequestClient = {
      userId: authStore.userId,
      nodes: note.value,
      items: authStore.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      payment: {
        paymentMethodId: form.value.paymentMethod?.id || 1,
        amount: total.value,
        returnUrl: window.location.origin + '/payment-return',
      },
      couponUsageIds: selectedCoupons.value.map(coupon => coupon.id) || [],
      shipments: [
        {
          carrierId: form.value.shippingMethod?.id || 1,
          shippingCost: shippingCost.value,
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          orderItemIds: authStore.cart.map(item => item.id),
        },
      ],
    };

    console.log('Payload gửi đến backend:', orderRequest);

    const response = await CartClientService.checkout(orderRequest);
    console.log('Response from checkout API:', response);

    if (response.status === 200 && response.data) {
      const orderResponse: OrderResponseClient = response.data;
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đơn hàng ${orderResponse.orderCode} đã được tạo.`,
        life: 5000,
      });

      // Xử lý thanh toán VNPay
      if (orderResponse.paymentUrl) {
        window.location.href = orderResponse.paymentUrl; // Chuyển hướng đến VNPay
      } else {
        authStore.cart = [];
        localStorage.removeItem('cartNote');
        authStore.cartCount = 0;
        router.push(`/client/cart/${authStore.userId}`);
        // router.push('/cart/${}')
      }
    }
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    let errorMessage = error.response?.data?.message || 'Không thể tạo đơn hàng.';
    if (error.response?.status === 400) {
      errorMessage = error.response.data.message || 'Dữ liệu không hợp lệ.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Vui lòng đăng nhập lại.';
      router.push('/login');
    }
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMessage,
      life: 3000,
    });
  } finally {
    loading.value = false;
    showConfirmDialog.value = false;
  }
};
</script>

<style scoped>
.checkout-page {
  min-height: 80vh;
  font-family: Arial, sans-serif;
  margin-top: 60px;
}

.checkout-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

@media (min-width: 768px) {
  .checkout-container {
    flex-direction: row;
  }

  .left-section {
    width: 33.33%;
    padding-right: 12px;
  }

  .right-section {
    width: 66.66%;
    padding-left: 12px;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.card-content {
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 50%;
}

.user-name {
  font-weight: bold;
}

.logout-link {
  color: #007bff;
  text-decoration: none;
  font-size: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.shipping-note {
  color: #757575;
  font-style: italic;
  font-size: 12px;
}

.shipping-option,
.payment-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.payment-option label,
.shipping-option label {
  margin: 0;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.product-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: bold;
  font-size: 14px;
}

.product-size {
  color: #757575;
  font-size: 12px;
}

.product-price {
  font-weight: bold;
  font-size: 14px;
}

.coupon-section {
  margin-bottom: 16px;
}

.total-section {
  margin-bottom: 16px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.total-final {
  font-weight: bold;
  font-size: 18px;
  margin-top: 16px;
}

.total-amount {
  color: #000;
}

.place-order-button {
  width: 100%;
  padding: 12px;
  background-color: #800080;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.place-order-button:hover {
  background-color: #660066;
}

.place-order-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

:deep(.p-multiselect) {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

:deep(.p-multiselect-label) {
  padding: 8px;
  font-size: 14px;
}

:deep(.p-multiselect-trigger) {
  background: #f5f5f5;
}
</style>