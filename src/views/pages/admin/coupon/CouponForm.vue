<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CouponService } from "../../../../service/CouponService";
import { CustomerService } from "../../../../service/CustomerServiceLegacy";
import { CouponUsageService } from "../../../../service/CouponUsageService";


interface Customer {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  gender: string; // "MALE" | "FEMALE" | "OTHER"
}

const router = useRouter();
const route = useRoute();

const goBack = () => {
  router.push({ name: "coupon" });
};

let couponIdParam = route.params.couponId;
const couponId = Number(Array.isArray(couponIdParam) ? couponIdParam[0] : couponIdParam);
const coupon = ref<any>(null);
const customers = ref<Customer[]>([]);
const loadingCoupon = ref(true);
const loadingCustomers = ref(true);


// DataTable selection cho phép chọn từng khách hoặc tất cả
const selectedCustomers = ref<Customer[]>([]);
const giftStatus = ref<{ [customerId: string]: string }>({});
const notification = ref<{ type: "success" | "error", message: string } | null>(null);

onMounted(async () => {
  loadingCoupon.value = true;
  loadingCustomers.value = true;
  try {
    // Lấy thông tin coupon
    if (couponId) {
      const res = await CouponService.getCouponById(couponId);
      coupon.value = res.data;
    }
    // Lấy danh sách khách hàng
    const cusRes = await CustomerService.getCustomersNotReceivedCoupon(couponId);
    customers.value = Array.isArray(cusRes.data) ? cusRes.data : [];
  } finally {
    loadingCoupon.value = false;
    loadingCustomers.value = false;
  }
});

//load lại danh sách khách hàng
const reloadCustomers = async () => {
  loadingCustomers.value = true;
  try {
    const cusRes = await CustomerService.getCustomersNotReceivedCoupon(couponId);
    customers.value = Array.isArray(cusRes.data) ? cusRes.data : [];
    selectedCustomers.value = [];
  } finally {
    loadingCustomers.value = false;
  }
};
// Load lại thông tin coupon
const reloadCoupon = async () => {
  if (couponId) {
    const res = await CouponService.getCouponById(couponId);
    coupon.value = res.data;
  }
};
// Trạng thái hiển thị của coupon
const getCouponDisplayStatus = (coupon: any) => {
  const now = new Date();
  const start = coupon.startDate ? new Date(coupon.startDate) : null;
  const end = coupon.expirationDate ? new Date(coupon.expirationDate) : null;

  if (coupon.deleted) return "Đã xóa";
  if (start && now < start) return "Chưa bắt đầu";
  if (end && now > end) return "Đã hết hạn";
  return "Đang hoạt động";
};

// Tặng cho 1 khách
const handleGift = async (customer: Customer) => {
  try {
    await CouponUsageService.giveCouponToSingleCustomer({
      couponId,
      userIds: [customer.id]
    });
    giftStatus.value[customer.id] = 'success';
    showNotification("success", `Tặng coupon thành công cho khách hàng ${customer.username}`);
    setTimeout(() => giftStatus.value[customer.id] = '', 2000);
    await reloadCoupon();
    await reloadCustomers();
  } catch (err) {
    giftStatus.value[customer.id] = 'error';
    showNotification("error", `Tặng coupon thất bại cho khách hàng ${customer.username}`);
    setTimeout(() => giftStatus.value[customer.id] = '', 2000);
  }
};

// Tặng cho nhiều khách
const handleGiftSelected = async () => {
  const userIds = selectedCustomers.value.map(cus => cus.id);
  const remaining = coupon.value.quantity - (coupon.value.usedCount ?? 0);
  if (userIds.length > remaining) {
    showNotification("error", `Chỉ còn ${remaining} coupon, bạn không thể tặng quá số lượng này!`);
    return;
  }
  try {
    await CouponUsageService.giveCouponToManyCustomers({ couponId, userIds });
    userIds.forEach(id => {
      giftStatus.value[id] = 'success';
      setTimeout(() => giftStatus.value[id] = '', 2000);
    });
    showNotification("success", "Tặng coupon thành công cho các khách hàng đã chọn");
    await reloadCoupon();
    await reloadCustomers();
  } catch (err) {
    userIds.forEach(id => {
      giftStatus.value[id] = 'error';
      setTimeout(() => giftStatus.value[id] = '', 2000);
    });
    showNotification("error", "Tặng coupon thất bại cho các khách hàng đã chọn");
  }
};

function showNotification(type: "success" | "error", message: string) {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
}

// Format tiền tệ
const formatCurrency = (value: number | null): string => {
  if (!value) return '0đ';
  return value.toLocaleString('vi-VN') + 'đ';
};
// Format ngày
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

const searchEmail = ref(""); 
const filteredCustomers = computed(() =>
  searchEmail.value
    ? customers.value.filter((cus) =>
      cus.email.toLowerCase().includes(searchEmail.value.toLowerCase())
    )
    : customers.value
);

const remaining = computed(() => coupon.value.quantity - (coupon.value.usedCount ?? 0));
const selectedCount = computed(() => selectedCustomers.value.length);
const exceeded = computed(() => selectedCount.value - remaining.value);

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Nút trở lại -->
        <div class="flex align-items-center mb-3">
          <h5 style="margin-left: 1rem;">Thông tin phiếu giảm giá</h5>
        </div>
        <!-- Coupon Image Card -->
        <div v-if="loadingCoupon" class="loading-text">Đang tải...</div>
        <div v-else-if="coupon">
          <div class="coupon-card">
            <div class="coupon-left">
              <div class="coupon-circle"></div>
              <div class="coupon-code">{{ coupon.codeCoupon }}</div>
              <div class="coupon-amount">{{ formatCurrency(coupon.couponAmount) }}</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ coupon.couponName }}</div>
              <div class="coupon-info-row">
                <span>Số lượng:</span>
                <span>{{ coupon.quantity }}</span>
              </div>
              <div class="coupon-info-row">
                <span>Số lượng còn lại:</span>
                <span>{{ coupon.quantity - (coupon.usedCount ?? 0) }}</span>
              </div>
              <div class="coupon-info-row">
                <span>Ngày bắt đầu:</span>
                <span>{{ formatDate(coupon.startDate) }}</span>
              </div>
              <div class="coupon-info-row">
                <span>Ngày hết hạn:</span>
                <span>{{ formatDate(coupon.expirationDate) }}</span>
              </div>
              <div class="coupon-info-row">
                <span>Trạng thái:</span>
                <span>{{ getCouponDisplayStatus(coupon) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="empty-text">Không tìm thấy phiếu giảm giá.</div>
        </div>
        <Button label="← Trở lại" class="back-btn" @click="goBack" /><br /><br />
        <!-- Thông báo -->
        <div v-if="notification" :class="['notification', notification.type]">
          {{ notification.message }}
        </div>

        <div v-if="loadingCustomers" class="loading-text">Đang tải...</div>
        <template v-else>
          <div class="flex justify-content-between align-items-center mb-3">
            <span class="table-title-text">Danh sách khách hàng</span>
            <Button label="Tặng các khách đã chọn" icon="pi pi-gift" class="p-button-info"
              :disabled="!selectedCustomers.length" @click="handleGiftSelected" />
          </div>
          <div class="flex justify-content-between align-items-center mb-3">
            <input v-model="searchEmail" type="text" placeholder="Nhập email khách hàng..." class="search-box" />
          </div>
          <div class="selected-count" :class="{ 'over-limit': selectedCount > remaining }">
            Đã chọn: {{ selectedCount }} khách hàng
            <template v-if="selectedCount > remaining">
              (<span class="over-number">{{ exceeded }}</span> vượt quá)
            </template>
          </div>
          <DataTable v-model:selection="selectedCustomers" :value="filteredCustomers" selectionMode="multiple"
            dataKey="id" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" responsiveLayout="scroll"
            emptyMessage="Không tìm thấy khách hàng nào." class="custom-customer-table">
            <Column selectionMode="multiple" headerStyle="width: 3em" />
            <Column field="username" header="Tên khách hàng" headerClass="center-header" bodyClass="center-cell" />
            <Column field="email" header="Email" headerClass="center-header" bodyClass="center-cell" />
            <Column field="phoneNumber" header="Số điện thoại" headerClass="center-header" bodyClass="center-cell" />
            <Column field="gender" header="Giới tính" headerClass="center-header" bodyClass="center-cell">
              <template #body="slotProps">
                {{
                  slotProps.data.gender === 'MALE' ? 'Nam'
                    : slotProps.data.gender === 'FEMALE' ? 'Nữ'
                      : slotProps.data.gender === 'OTHER' ? 'Khác'
                : ''
                }}
              </template>
            </Column>
            <Column header="Hành động" headerClass="center-header" bodyClass="center-cell">
              <template #body="slotProps">
                <Button label="Tặng" icon="pi pi-gift" class="p-button-success p-button-sm"
                  :disabled="giftStatus[slotProps.data.id] === 'success' || remaining <= 0"
                  @click="handleGift(slotProps.data)" />
                <span v-if="giftStatus[slotProps.data.id] === 'success'" style="color:green;margin-left:8px;">✔️</span>
                <span v-if="giftStatus[slotProps.data.id] === 'error'" style="color:red;margin-left:8px;">Lỗi</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Coupon Card Style */
.coupon-card {
  display: flex;
  background: linear-gradient(90deg, #f9fafb, #f1f8fd 80%);
  border-radius: 18px;
  box-shadow: 0 2px 14px 0 #c1d8e8b8;
  margin: 1.5rem 0 2rem 0;
  overflow: hidden;
  min-height: 140px;
  position: relative;
  border: 2px dashed #6cb7ef;

  .coupon-left {
    background: #6cb7ef;
    color: #fff;
    padding: 1.5rem 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-top-left-radius: 18px;
    border-bottom-left-radius: 18px;
    min-width: 140px;
    position: relative;

    .coupon-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #fff;
      opacity: 0.13;
      position: absolute;
      left: -15px;
      top: 50%;
      transform: translateY(-50%);
    }

    .coupon-code {
      font-size: 1.2rem;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 0.8rem;
      z-index: 1;
    }

    .coupon-amount {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      z-index: 1;
    }
  }

  .coupon-right {
    flex: 1;
    padding: 1.1rem 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .coupon-name {
      font-size: 1.23rem;
      font-weight: 600;
      margin-bottom: 0.8rem;
      color: #138b3b;
    }

    .coupon-info-row {
      display: flex;
      justify-content: space-between;
      font-size: 1.04rem;
      margin-bottom: 0.3rem;

      span:first-child {
        color: #4e4e4e;
      }
    }
  }
}

.back-btn {
  background: #f1f8fd;
  color: #3182ce;
  border: 1px solid #6cb7ef;
  font-weight: bold;
}

.coupon-info {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;

  li {
    padding: 0.3rem 0;
    font-size: 1.06rem;
  }
}

.mt-4 {
  margin-top: 2rem;
}

.mb-2 {
  margin-bottom: 1rem;
}

.loading-text,
.empty-text {
  color: #888;
  font-size: 1.12rem;
  padding: 1rem 0;
}

.p-mt-3 {
  margin-top: 1.5rem;
}

.custom-customer-table {
  .p-datatable-thead>tr>th {
    font-weight: bold;
    font-size: 1.13rem;
    background: #f7f8fa;
    color: #222;
    text-align: center;
    vertical-align: middle;
  }

  .center-header,
  .center-cell {
    text-align: center !important;
    vertical-align: middle !important;
  }

  .p-datatable-tbody>tr {
    font-size: 1.06rem;
    height: 48px;
  }
}

.table-title-text {
  font-weight: bold;
  font-size: 1.25rem;
  color: #222;
}

.search-box {
  padding: 8px;
  width: 30%;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.notification {
  margin-bottom: 1rem;
  padding: 10px 18px;
  border-radius: 5px;
  font-size: 1.09rem;
  font-weight: 500;

  &.success {
    background: #e6ffec;
    color: #138b3b;
    border: 1px solid #b3e6c9;
  }

  &.error {
    background: #ffeaea;
    color: #b71c1c;
    border: 1px solid #ffb3b3;
  }
}

.selected-count {
  margin-top: 0.5rem;
  font-size: 1.07rem;
  color: #222;

  &.over-limit {
    color: #d32f2f;
    font-weight: bold;
  }

  .over-number {
    color: #d32f2f;
    font-weight: bold;
  }
}
</style>