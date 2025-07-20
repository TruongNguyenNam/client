<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Statistical } from '@/service/admin/StatisticalService';

const toast = useToast();

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayRevenue = ref(0);
const monthlyRevenue = ref(0);
const yearlyRevenue = ref(0);
const customRevenue = ref(null);

const todayProductCount = ref(0);
const todaySuccessOrders = ref(0);
const todayCancelledOrders = ref(0);
const todayReturnedOrders = ref(0);

const monthlyProductCount = ref(0);
const monthlySuccessOrders = ref(0);
const monthlyCancelledOrders = ref(0);
const monthlyReturnedOrders = ref(0);

const yearlyProductCount = ref(0);
const yearlySuccessOrders = ref(0);
const yearlyCancelledOrders = ref(0);
const yearlyReturnedOrders = ref(0);

const customStartDate = ref(null);
const customEndDate = ref(null);
const customProductCount = ref(0);
const customSuccessOrders = ref(0);
const customCancelledOrders = ref(0);
const customReturnedOrders = ref(0);

const products = ref([]);
const filterType = ref('day');
const loading = ref(false);

const rangeStartDate = ref(null);
const rangeEndDate = ref(null);

const lineData = ref({});
const lineOptions = ref({});

const filterBy = async (type) => {
  filterType.value = type;
  loading.value = true;
  try {
    let res;
    if (type === 'day') {
      res = await Statistical.getSellingToday();
    } else if (type === 'month') {
      res = await Statistical.getSellingThisMonth();
    } else if (type === 'year') {
      res = await Statistical.getSellingThisYear();
    }
    products.value = res.data || [];
  } catch (err) {
    console.error('Lỗi lọc sản phẩm:', err);
  } finally {
    loading.value = false;
  }
};

const filterByCustomRange = async () => {
  if (!rangeStartDate.value || !rangeEndDate.value) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Chọn đủ ngày bắt đầu và kết thúc', life: 3000 });
    return;
  }
  if (rangeEndDate.value < rangeStartDate.value) {
    toast.add({ severity: 'error', summary: 'Lỗi ngày', detail: 'Ngày kết thúc phải sau ngày bắt đầu', life: 3000 });
    return;
  }
  const start = formatDate(rangeStartDate.value);
  const end = formatDate(rangeEndDate.value);
  try {
    const res = await Statistical.getSellingBetween(start, end);
    products.value = res.data || [];
  } catch (err) {
    console.error('Lỗi lọc theo khoảng:', err);
  }
};

const fetchCustomStats = async () => {
  if (!customStartDate.value || !customEndDate.value) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Chọn đủ ngày bắt đầu và kết thúc', life: 3000 });
    return;
  }
  if (customEndDate.value < customStartDate.value) {
    toast.add({ severity: 'error', summary: 'Lỗi ngày', detail: 'Ngày kết thúc phải sau ngày bắt đầu', life: 3000 });
    return;
  }
  const from = formatDate(customStartDate.value);
  const to = formatDate(customEndDate.value);
  try {
    const res = await Statistical.getCustom(from, to);
    customRevenue.value = res.totalRevenue || 0;
    customProductCount.value = res.totalSoldQuantity || 0;
    customSuccessOrders.value = res.completedOrders || 0;
    customCancelledOrders.value = res.cancelledOrders || 0;
    customReturnedOrders.value = res.returnedOrders || 0;
  } catch (err) {
    console.error('Lỗi lọc tùy chọn:', err);
  }
};

const loadMonthlyOrderChart = async () => {
  try {
    const res = await Statistical.getChart();
    const chartData = res.data;
    lineData.value = {
      labels: chartData.map(i => `Tháng ${i.month}`),
      datasets: [
        { label: 'Tại Quầy', data: chartData.map(i => i.posOrders), fill: false, borderColor: '#42A5F5', tension: 0.4 },
        { label: 'SHIP', data: chartData.map(i => i.shipOrders), fill: false, borderColor: '#66BB6A', tension: 0.4 }
      ]
    };
    lineOptions.value = {
      responsive: true,
      plugins: { legend: { position: 'top' }, title: { display: true, text: '' } }
    };
  } catch (err) {
    console.error('Lỗi biểu đồ:', err);
  }
};

onMounted(async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const [soldToday, soldMonth, soldYear, revToday, revMonth, revYear,
      cancelToday, doneToday, returnToday, cancelMonth, doneMonth, returnMonth,
      cancelYear, doneYear, returnYear] = await Promise.all([
        Statistical.getSoldToday(), Statistical.getSoldThisMonth(), Statistical.getSoldThisYear(),
        Statistical.getDailyRevenue(), Statistical.getMonthlyRevenue(year, month), Statistical.getYearlyRevenue(year),
        Statistical.getCancelledToday(), Statistical.getCompletedToday(), Statistical.getReturnedToday(),
        Statistical.getCancelledThisMonth(), Statistical.getCompletedThisMonth(), Statistical.getReturnedThisMonth(),
        Statistical.getCancelledThisYear(), Statistical.getCompletedThisYear(), Statistical.getReturnedThisYear()
      ]);

    todayProductCount.value = soldToday.data?.quantity || 0;
    monthlyProductCount.value = soldMonth.data?.quantity || 0;
    yearlyProductCount.value = soldYear.data?.quantity || 0;

    todayRevenue.value = revToday.data?.[0]?.totalRevenue || 0;
    monthlyRevenue.value = revMonth.data?.reduce((acc, i) => acc + i.totalRevenue, 0) || 0;
    yearlyRevenue.value = revYear.data?.reduce((acc, i) => acc + i.totalRevenue, 0) || 0;

    todayCancelledOrders.value = cancelToday.data?.date === todayStr ? cancelToday.data.totalOrders : 0;
    todaySuccessOrders.value = doneToday.data?.date === todayStr ? doneToday.data.totalOrders : 0;
    todayReturnedOrders.value = returnToday.data?.date === todayStr ? returnToday.data.totalOrders : 0;

    monthlyCancelledOrders.value = cancelMonth.data?.totalOrders || 0;
    monthlySuccessOrders.value = doneMonth.data?.totalOrders || 0;
    monthlyReturnedOrders.value = returnMonth.data?.totalOrders || 0;

    yearlyCancelledOrders.value = cancelYear.data?.totalOrders || 0;
    yearlySuccessOrders.value = doneYear.data?.totalOrders || 0;
    yearlyReturnedOrders.value = returnYear.data?.totalOrders || 0;

    await filterBy(filterType.value);
    await loadMonthlyOrderChart();
  } catch (err) {
    console.error('Lỗi load dữ liệu:', err);
  }
});

const formatCurrency = (value) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
</script>


<template>
  <div class="grid">
    <!-- DOANH THU HÔM NAY -->
    <div class="col-12 md:col-6 xl:col-3">
      <!-- <div class="card bg-cyan-700 text-white "> -->
        <div class="card h-full min-h-[160px] flex-col justify-between bg-cyan-700 text-white">
        <div class="flex justify-content-between">
          <div>
            <span class="text-sm">Doanh thu hôm nay</span>
            <div class="text-2xl font-bold">{{ formatCurrency(todayRevenue) }}</div>
          </div>
          <i class="pi pi-calendar text-white text-xl"></i>
        </div>
        <div class="mt-3 text-sm">
          {{ todayProductCount }} Sản Phẩm, {{ todaySuccessOrders }} Thành Công, {{ todayCancelledOrders }} Huỷ, {{ todayReturnedOrders }} Trả
        </div>
      </div>
    </div>

    <!-- DOANH THU THÁNG NÀY -->
    <div class="col-12 md:col-6 xl:col-3">
       <div class="card h-full min-h-[160px] flex-col justify-between bg-indigo-700 text-white">
        <div class="flex justify-content-between">
          <div>
            <span class="text-sm">Doanh thu tháng này</span>
            <div class="text-2xl font-bold">{{ formatCurrency(monthlyRevenue) }}</div>
          </div>
          <i class="pi pi-calendar text-white text-xl"></i>
        </div>
        <div class="mt-3 text-sm">
          {{ monthlyProductCount }} Sản Phẩm, {{ monthlySuccessOrders }} Thành Công, {{ monthlyCancelledOrders }} Huỷ, {{ monthlyReturnedOrders }} Trả
        </div>
      </div>
    </div>

    <!-- DOANH THU NĂM NAY -->
    <div class="col-12 md:col-6 xl:col-3">
      <div class="card h-full min-h-[160px] flex-col justify-between bg-orange-600 text-white">
        <div class="flex justify-content-between">
          <div>
            <span class="text-sm">Doanh thu năm nay</span>
            <div class="text-2xl font-bold">{{ formatCurrency(yearlyRevenue) }}</div>
          </div>
          <i class="pi pi-calendar text-white text-xl"></i>
        </div>
        <div class="mt-3 text-sm">
          {{ yearlyProductCount }} Sản Phẩm, {{ yearlySuccessOrders }} Thành Công, {{ yearlyCancelledOrders }} Huỷ, {{ yearlyReturnedOrders }} Trả
        </div>
      </div>
    </div>

    <!-- DOANH THU TUY CHON -->
    <div class="col-12 md:col-6 xl:col-3">
      <div class="card bg-gray-800 text-white">
        <div class="flex justify-content-between mb-3">
          <span class="text-sm">Doanh thu tuỳ chọn</span>
          <i class="pi pi-filter text-white text-xl"></i>
        </div>
        <div class="flex gap-2 mb-2">
          <Calendar v-model="customStartDate" dateFormat="yy-mm-dd" placeholder="Từ ngày" showIcon class="w-full" />
          <Calendar v-model="customEndDate" dateFormat="yy-mm-dd" placeholder="Đến ngày" showIcon class="w-full" />
        </div>
        <Button label="Lọc" icon="pi pi-search" class="w-full" @click="fetchCustomStats" />
        <div v-if="customRevenue !== null" class="mt-3 text-2xl font-bold">{{ formatCurrency(customRevenue) }}</div>
        <div v-if="customRevenue !== null" class="mt-2 text-sm">
          {{ customProductCount }} Sản Phẩm, {{ customSuccessOrders }} Thành công, {{ customCancelledOrders }} Huỷ, {{ customReturnedOrders }} Trả
        </div>
      </div>
    </div>

    <!-- BẢNG SẢN PHẨM BÁN CHẠY -->
    <div class="col-12">
      <div class="card">
        <h5 class="mb-3">Sản phẩm bán được</h5>
        <div class="flex gap-2 mb-3">
          <Button label="NGÀY" @click="filterBy('day')" />
          <Button label="THÁNG" @click="filterBy('month')" />
          <Button label="NĂM" @click="filterBy('year')" />
        </div>
        <div class="flex gap-2 mb-3">
          <Calendar v-model="rangeStartDate" dateFormat="yy-mm-dd" placeholder="Từ ngày" showIcon />
          <Calendar v-model="rangeEndDate" dateFormat="yy-mm-dd" placeholder="Đến ngày" showIcon />
          <Button icon="pi pi-filter" @click="filterByCustomRange" />
        </div>
        <DataTable :value="products" :rows="5" :paginator="true" responsiveLayout="scroll">
          <Column field="id" header="ID" style="width: 10%" />
          <Column>
            <template #header>Hình</template>
            <template #body="slotProps">
              <img :src="slotProps.data.imgUrl" width="50" class="shadow-2 border-round" />
            </template>
          </Column>
          <Column field="productName" header="Tên sản phẩm" />
          <Column field="soldQuantity" header="SL bán" />
        </DataTable>
      </div>
    </div>

    <!-- BIỂU ĐỒ -->
    <div class="col-12">
      <div class="card">
        <h5 class="mb-3">Tổng quan đơn hàng</h5>
        <Chart type="line" :data="lineData" :options="lineOptions" />
      </div>
    </div>

    <!-- BEST SELLING PRODUCTS -->
    <div class="col-12">
      <div class="card">
        <h5 class="mb-3">Top Sản Phẩm Bán Chạy</h5>
        <ul class="list-none p-0 m-0">
          <li v-for="item in products" :key="item.id" class="mb-4">
            <div class="flex justify-content-between items-center">
              <div>
                <span class="font-medium">{{ item.productName }}</span>
                <div class="text-sm text-gray-500">Sản phẩm bán chạy</div>
              </div>
              <div class="flex items-center w-40">
                <div class="w-full h-2 bg-gray-300 rounded">
                  <div class="h-full bg-indigo-500 rounded" :style="{ width: item.percentage + '%' }"></div>
                </div>
                <span class="ml-2 text-indigo-500 text-sm">{{ item.percentage }}%</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
