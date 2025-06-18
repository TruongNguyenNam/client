<script setup>
import { onMounted, ref } from 'vue';
import { Statistical } from '@/service/admin/StatisticalService';

// Chart data: Đơn hàng theo tháng (Ship + POS)
const monthlyOrderData = ref({
    labels: [],
    datasets: []
});
const lineData = ref({});
const lineOptions = ref({});

const monthlyOrderOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: 'Số lượng đơn hàng theo tháng (POS & SHIP)'
        }
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
});

// Doanh thu
const todayRevenue = ref(0);
const monthlyRevenue = ref(0);
const yearlyRevenue = ref(0);
const customRevenue = ref(null);

// Sản phẩm & đơn hàng hôm nay
const todayProductCount = ref(0);
const todaySuccessOrders = ref(0);
const todayCancelledOrders = ref(0);
const todayReturnedOrders = ref(0);

// Tháng này
const monthlyProductCount = ref(0);
const monthlySuccessOrders = ref(0);
const monthlyCancelledOrders = ref(0);
const monthlyReturnedOrders = ref(0);

// Năm nay
const yearlyProductCount = ref(0);
const yearlySuccessOrders = ref(0);
const yearlyCancelledOrders = ref(0);
const yearlyReturnedOrders = ref(0);

// Tùy chọn thời gian
const customStartDate = ref(null);
const customEndDate = ref(null);
const customProductCount = ref(0);
const customSuccessOrders = ref(0);
const customCancelledOrders = ref(0);
const customReturnedOrders = ref(0);

// Sản phẩm bán chạy
const products = ref([]);
const filterType = ref('day'); // Mặc định lọc theo ngày
const loading = ref(false);
// Biến riêng cho lọc sản phẩm theo khoảng thời gian
const rangeStartDate = ref(null);
const rangeEndDate = ref(null);

// Lọc theo ngày/tháng/năm
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

// Lọc theo khoảng thời gian tuỳ chọn
const filterByCustomRange = async () => {
    if (!rangeStartDate.value || !rangeEndDate.value) return;
    const start = rangeStartDate.value.toISOString().split('T')[0];
    const end = rangeEndDate.value.toISOString().split('T')[0];
    try {
        const res = await Statistical.getSellingBetween(start, end);
        products.value = res.data || [];
    } catch (err) {
        console.error('Lỗi lọc theo khoảng thời gian:', err);
    }
};

// Format tiền tệ
const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Thống kê theo khoảng tùy chọn
const fetchCustomStats = async () => {
    if (!customStartDate.value || !customEndDate.value) return;
    const fromDate = customStartDate.value.toISOString().split('T')[0];
    const toDate = customEndDate.value.toISOString().split('T')[0];
    try {
        const data = await Statistical.getCustom(fromDate, toDate);
        customRevenue.value = data.totalRevenue || 0;
        customProductCount.value = data.totalSoldQuantity || 0;
        customSuccessOrders.value = data.completedOrders || 0;
        customCancelledOrders.value = data.cancelledOrders || 0;
        customReturnedOrders.value = data.returnedOrders || 0;
    } catch (err) {
        console.error('Lỗi khi lọc tùy chọn:', err);
    }
};

// Load dữ liệu thống kê đơn hàng theo tháng
const loadMonthlyOrderChart = async () => {
    try {
        const res = await Statistical.getChart();
        const chartData = res.data;

        // Xử lý dữ liệu cho biểu đồ
        const labels = chartData.map(item => `Tháng ${item.month}`);
        const posData = chartData.map(item => item.posOrders);
        const shipData = chartData.map(item => item.shipOrders);

        lineData.value = {
            labels,
            datasets: [
                {
                    label: 'Đơn bán tại chỗ',
                    data: posData,
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4
                },
                {
                    label: 'Đơn giao hàng',
                    data: shipData,
                    fill: false,
                    borderColor: '#66BB6A',
                    tension: 0.4
                }
            ]
        };

        lineOptions.value = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: ''
                }
            }
        };
    } catch (error) {
        console.error('Lỗi load biểu đồ đơn hàng tháng:', error);
    }
};



// Gọi dữ liệu khi mounted
onMounted(async () => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const todayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const [
            soldToday, soldMonth, soldYear,
            dailyRev, monthlyRev, yearlyRev,
            cancelledToday, completedToday, returnedToday,
            cancelledMonth, completedMonth, returnedMonth,
            cancelledYear, completedYear, returnedYear
        ] = await Promise.all([
            Statistical.getSoldToday(),
            Statistical.getSoldThisMonth(),
            Statistical.getSoldThisYear(),
            Statistical.getDailyRevenue(),
            Statistical.getMonthlyRevenue(year, month),
            Statistical.getYearlyRevenue(year),
            Statistical.getCancelledToday(),
            Statistical.getCompletedToday(),
            Statistical.getReturnedToday(),
            Statistical.getCancelledThisMonth(),
            Statistical.getCompletedThisMonth(),
            Statistical.getReturnedThisMonth(),
            Statistical.getCancelledThisYear(),
            Statistical.getCompletedThisYear(),
            Statistical.getReturnedThisYear()
        ]);

        todayProductCount.value = soldToday.data?.quantity || 0;
        monthlyProductCount.value = soldMonth.data?.quantity || 0;
        yearlyProductCount.value = soldYear.data?.quantity || 0;

        todayRevenue.value = dailyRev.data?.[0]?.totalRevenue || 0;
        monthlyRevenue.value = monthlyRev.data?.reduce((acc, cur) => acc + cur.totalRevenue, 0) || 0;
        yearlyRevenue.value = yearlyRev.data?.reduce((acc, cur) => acc + cur.totalRevenue, 0) || 0;

        todayCancelledOrders.value = (cancelledToday.data?.date === todayString) ? cancelledToday.data.totalOrders || 0 : 0;
        todaySuccessOrders.value = (completedToday.data?.date === todayString) ? completedToday.data.totalOrders || 0 : 0;
        todayReturnedOrders.value = (returnedToday.data?.date === todayString) ? returnedToday.data.totalOrders || 0 : 0;

        monthlyCancelledOrders.value = cancelledMonth.data?.totalOrders || 0;
        monthlySuccessOrders.value = completedMonth.data?.totalOrders || 0;
        monthlyReturnedOrders.value = returnedMonth.data?.totalOrders || 0;

        yearlyCancelledOrders.value = cancelledYear.data?.totalOrders || 0;
        yearlySuccessOrders.value = completedYear.data?.totalOrders || 0;
        yearlyReturnedOrders.value = returnedYear.data?.totalOrders || 0;

        await filterBy(filterType.value); // Load top sản phẩm theo ngày (mặc định)
        await loadMonthlyOrderChart(); // Tải biểu đồ đơn hàng
    } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
    }
});
</script>



<template>
    <h1>Doanh Thu</h1>
    <div class="grid">
        <div class="flex flex-wrap gap-6 justify-center">
            <!-- Hôm nay -->
            <div
                class="card bg-cyan-700 text-white p-6 rounded-xl shadow-lg w-[600px] max-w-[600px] min-h-[220px] overflow-hidden">
                <div class="flex items-center gap-2 mb-6">
                    <i class="pi pi-calendar text-2xl"></i>
                    <span class="text-xl font-semibold">Hôm nay</span>
                </div>
                <div class="text-4xl font-bold mb-6 break-words">
                    {{ formatCurrency(todayRevenue) }}
                </div>
                <div class="grid grid-cols-4 gap-4 text-center text-base font-medium">
                    <div>
                        <div class="mb-1">Sản phẩm</div>
                        <div class="text-2xl font-semibold">{{ todayProductCount }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn thành công</div>
                        <div class="text-2xl font-semibold">{{ todaySuccessOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn huỷ</div>
                        <div class="text-2xl font-semibold">{{ todayCancelledOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn trả</div>
                        <div class="text-2xl font-semibold">{{ todayReturnedOrders }}</div>
                    </div>
                </div>
            </div>

            <!-- Tháng này -->
            <div
                class="card bg-indigo-700 text-white p-6 rounded-xl shadow-lg w-[600px] max-w-[600px] min-h-[220px] overflow-hidden">
                <div class="flex items-center gap-2 mb-6">
                    <i class="pi pi-calendar text-2xl"></i>
                    <span class="text-xl font-semibold">Tháng này</span>
                </div>
                <div class="text-4xl font-bold mb-6 break-words">
                    {{ formatCurrency(monthlyRevenue) }}
                </div>
                <div class="grid grid-cols-4 gap-4 text-center text-base font-medium">
                    <div>
                        <div class="mb-1">Sản phẩm</div>
                        <div class="text-2xl font-semibold">{{ monthlyProductCount }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn thành công</div>
                        <div class="text-2xl font-semibold">{{ monthlySuccessOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn huỷ</div>
                        <div class="text-2xl font-semibold">{{ monthlyCancelledOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn trả</div>
                        <div class="text-2xl font-semibold">{{ monthlyReturnedOrders }}</div>
                    </div>
                </div>
            </div>

            <!-- Năm nay -->
            <div
                class="card bg-orange-600 text-white p-6 rounded-xl shadow-lg w-[600px] max-w-[600px] min-h-[220px] overflow-hidden">
                <div class="flex items-center gap-2 mb-6">
                    <i class="pi pi-calendar text-2xl"></i>
                    <span class="text-xl font-semibold">Năm nay</span>
                </div>
                <div class="text-4xl font-bold mb-6 break-words">
                    {{ formatCurrency(yearlyRevenue) }}
                </div>
                <div class="grid grid-cols-4 gap-4 text-center text-base font-medium">
                    <div>
                        <div class="mb-1">Sản phẩm</div>
                        <div class="text-2xl font-semibold">{{ yearlyProductCount }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn thành công</div>
                        <div class="text-2xl font-semibold">{{ yearlySuccessOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn huỷ</div>
                        <div class="text-2xl font-semibold">{{ yearlyCancelledOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn trả</div>
                        <div class="text-2xl font-semibold">{{ yearlyReturnedOrders }}</div>
                    </div>
                </div>
            </div>

            <!-- Tùy chọn thời gian -->
            <div
                class="card bg-gray-700 text-white p-6 rounded-xl shadow-lg w-[600px] max-w-[600px] min-h-[220px] overflow-hidden">
                <div class="flex items-center gap-2 mb-6">
                    <i class="pi pi-calendar text-2xl"></i>
                    <span class="text-xl font-semibold">Tùy chọn thời gian</span>
                </div>

                <div class="flex flex-wrap gap-4 items-center mb-4 text-black">
                    <Calendar v-model="customStartDate" placeholder="Từ ngày" showIcon class="w-full md:w-1/3"
                        dateFormat="yy-mm-dd" />
                    <Calendar v-model="customEndDate" placeholder="Đến ngày" showIcon class="w-full md:w-1/3"
                        dateFormat="yy-mm-dd" />

                    <Button label="Lọc" icon="pi pi-filter" class="mt-1" @click="fetchCustomStats" />
                </div>

                <div v-if="customRevenue !== null" class="text-4xl font-bold text-white mb-4">
                    {{ formatCurrency(customRevenue) }}
                </div>

                <div v-if="customRevenue !== null" class="grid grid-cols-4 gap-4 text-center text-base font-medium">
                    <div>
                        <div class="mb-1">Sản phẩm</div>
                        <div class="text-2xl font-semibold">{{ customProductCount }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn thành công</div>
                        <div class="text-2xl font-semibold">{{ customSuccessOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn huỷ</div>
                        <div class="text-2xl font-semibold">{{ customCancelledOrders }}</div>
                    </div>
                    <div>
                        <div class="mb-1">Đơn trả</div>
                        <div class="text-2xl font-semibold">{{ customReturnedOrders }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!--  -->

        <div class="col-12 xl:col-6">
            <!-- Bộ lọc thời gian -->
            <div class="card">
                <h5>Recent Sales</h5>
                <div class="flex flex-wrap gap-2 mb-3">
                    <Button label="NGÀY" @click="filterBy('day')" />
                    <Button label="THÁNG" @click="filterBy('month')" />
                    <Button label="NĂM" @click="filterBy('year')" />
                </div>

                <!-- Bộ lọc theo khoảng thời gian -->
                <div class="flex flex-wrap align-items-center gap-2 mb-3">
                    <Calendar v-model="rangeStartDate" dateFormat="yy-mm-dd" placeholder="Từ ngày" showIcon />
                    <Calendar v-model="rangeEndDate" dateFormat="yy-mm-dd" placeholder="Đến ngày" showIcon />
                    <Button label="LỌC" icon="pi pi-filter" @click="filterByCustomRange" />
                </div>


                <!-- Bảng sản phẩm -->
                <DataTable :value="products" :rows="5" :paginator="true" responsiveLayout="scroll">
                    <Column field="id" header="ID" :sortable="true" style="width: 10%" />
                    <Column style="width: 15%">
                        <template #header>Hình ảnh</template>
                        <template #body="slotProps">
                            <img :src="slotProps.data.imgUrl" width="50" class="shadow-2 border-round" />
                        </template>
                    </Column>
                    <Column field="productName" header="Tên sản phẩm" :sortable="true" style="width: 35%" />
                    <Column field="soldQuantity" header="Số lượng bán" :sortable="true" style="width: 30%" />
                </DataTable>
            </div>

            <!-- Top bán chạy theo % -->
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-5">
                    <h5>Best Selling Products</h5>
                    <div>
                        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded"
                            @click="$refs.menu2.toggle($event)" />
                        <Menu ref="menu2" :popup="true" :model="[]" />
                    </div>
                </div>

                <ul class="list-none p-0 m-0">
                    <li v-for="item in products" :key="item.id"
                        class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">{{ item.productName }}</span>
                            <div class="mt-1 text-600">Sản phẩm bán chạy</div>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-indigo-500 h-full" :style="{ width: item.percentage + '%' }"></div>
                            </div>
                            <span class="text-indigo-500 ml-3 font-medium">{{ item.percentage }}%</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Sales Overview</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>

        </div>
    </div>
</template>
