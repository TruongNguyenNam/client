<template>
    <div class="grid">
      <Toast ref="toast" />
      <div class="col-12">
        <div class="card">
          <h5>Danh Sách Đơn Hàng</h5>
  
          <!-- TabView cho các trạng thái đơn hàng -->
          <TabView v-model:activeIndex="activeTab" @update:activeIndex="onTabChange">
            <TabPanel :header="`Tất cả (${totalRecords})`">
              <span>Tất cả đơn hàng</span>
            </TabPanel>
            <TabPanel :header="`Đang chờ (${statusCounts.PENDING || 0})`">
              <span>Đơn hàng đang chờ</span>
            </TabPanel>
            <TabPanel :header="`xác nhận (${statusCounts.CONFIRMED || 0})`">
              <span>Đơn hàng đã xác nhận</span>
            </TabPanel>
            <TabPanel :header="`Hoàn thành (${statusCounts.COMPLETED || 0})`">
              <span>Đơn hàng hoàn thành</span>
            </TabPanel>
            <TabPanel :header="`Huỷ bỏ (${statusCounts.CANCELLED || 0})`">
              <span>Đơn hàng huỷ bỏ</span>
            </TabPanel>
            <TabPanel :header="`Đang giao (${statusCounts.SHIPPED || 0})`">
              <span>Đơn hàng đang giao</span>
            </TabPanel>
            <TabPanel :header="`Trả hàng (${statusCounts.RETURNED || 0})`">
              <span>Đơn hàng trả hàng</span>
            </TabPanel>
          </TabView>

  
          <DataTable
            :value="orderList"
            :paginator="true"
            :first="lazyParams.page * lazyParams.size"
            :rows="lazyParams.size"
            :totalRecords="totalRecords"
            :rowHover="true"
            class="p-datatable-gridlines"
            filterDisplay="menu"
            v-model:filters="filters"
            :loading="loading"
            :lazy="false"
            @page="onPage"
            responsiveLayout="scroll"
            :globalFilterFields="['orderCode', 'orderStatus']"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} đơn hàng"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            :pageLinkSize="3"
          >
            <template #header>
              <div class="flex justify-content-between flex-column sm:flex-row gap-2">
                <!-- Bên trái: nút Clear -->
                <div class="flex align-items-center">
                  <Button
                    type="button"
                    icon="pi pi-filter-slash"
                    label="Clear"
                    class="p-button-outlined"
                    @click="initFilters()"
                  />
                </div>
  
                <!-- Bên phải: Tìm kiếm + Dropdown loại đơn -->
                <div class="flex align-items-center gap-2">
                  <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                      v-model="filters.global.value"
                      placeholder="Tìm kiếm..."
                      style="width: 15rem"
                      @input="getOrderList"
                    />
                  </span>
  
                  <Dropdown
                    :options="[
                      { label: 'Tất cả', value: null },
                      { label: 'Tại Quầy', value: true },
                      { label: 'Ship', value: false }
                    ]"
                    v-model="filters.isPos.value"
                    placeholder="Loại đơn"
                    class="w-12rem"
                    optionLabel="label"
                    optionValue="value"
                    @change="getOrderList"
                  />
                </div>
              </div>
            </template>
            <Column header="STT" style="width: 4rem"  >
                    <template #body="slotProps">
                    {{ lazyParams.page * lazyParams.size + slotProps.index + 1 }}
                    </template>
            </Column>
            
            <!-- <Column header="ID" style="min-width: 6rem">
              <template #body="slotProps">{{ slotProps.data.id }}</template>
            </Column> -->
  
            <Column header="Mã đơn hàng" style="min-width: 10rem" sortable field="orderCode">
              <template #body="slotProps">{{ slotProps.data.orderCode }}</template>
            </Column>
  
            <Column header="Người đặt" sortable field="address.username" style="min-width: 10rem">
              <template #body="slotProps">
                {{ slotProps.data.address?.username || 'Vãng lai' }}
              </template>
            </Column>

  
            <Column header="Tổng tiền" sortable field="orderTotal" style="min-width: 10rem">
              <template #body="slotProps">
                {{ slotProps.data.orderTotal?.toLocaleString('vi-VN') }} đ
              </template>
            </Column>
  
            <Column header="Trạng thái đơn" field="orderStatus" sortable style="min-width: 8rem">
              <template #body="slotProps">
                {{ formatOrderStatus(slotProps.data.orderStatus) }}
              </template>
            </Column>
  
            <Column header="Loại đơn"   field="isPos" sortable style="min-width: 8rem">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.isPos ? 'Tại Quầy' : 'Ship'"
                  :severity="slotProps.data.isPos ? 'success' : 'info'"
                />
              </template>
            </Column>
  
            <Column header="Trạng thái vận chuyển" field="shipmentStatus"  sortable style="min-width: 12rem">
              <template #body="slotProps">
                {{ formatShipmentStatus(slotProps.data.shipments?.[0]?.shipmentStatus || '---') }}
              </template>
            </Column>
  
            <Column header="Hành động" style="min-width: 8rem">
              <template #body="slotProps">
                <Button
                  label="Chi tiết"
                  icon="pi pi-eye"
                  class="p-button-text p-button-info"
                  @click="$router.push(`/certificationorder/${slotProps.data.id}`)"
                />

                <Button
                v-if="slotProps.data.orderStatus === 'COMPLETED'"
                  label="In hóa đơn"
                  icon="pi pi-print"
                  class="p-button-text p-button-success"
                  @click="printInvoice(slotProps.data)"
                />

              </template>
            </Column>
  
            <template #empty>
              Không tìm thấy đơn hàng nào.
            </template>
  
            <template #loading>
              Đang tải dữ liệu...
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { FilterMatchMode } from 'primevue/api';
  import { OrderService } from '../../../../service/admin/OrderService';
  import { useRoute } from 'vue-router';
  import type { OrderResponse } from '../../../../model/admin/order';
  import { OrderStatus } from '../../../../service/admin/OrderService';
  
  const route = useRoute();
  const loading = ref(false);
  const orderList = ref<OrderResponse[]>([]);
  const totalRecords = ref(0);
  const activeTab = ref(0); // Tab đang được chọn (0 = Tất cả, 1 = PENDING, 2 = COMPLETED, ...)
  const statusCounts = ref<Record<string, number>>({});



  // Define filters with proper typing for PrimeVue DataTable
  const filters = ref({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    isPos: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
    orderStatus: { value: null as string | null, matchMode: FilterMatchMode.EQUALS }
  });
  
  const lazyParams = ref({
    page: 0,
    size: 5
  });
  
  const formatOrderStatus = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Đang chờ';
      case OrderStatus.CONFIRMED:
        return 'xác nhận';
      case OrderStatus.COMPLETED:
        return 'Hoàn thành';
      case OrderStatus.CANCELLED:
        return 'Huỷ bỏ';
      case OrderStatus.SHIPPED:
        return 'Đang giao';
      case OrderStatus.RETURNED:
        return 'Trả hàng';
      default:
        return status;
    }
  };

  const formatShipmentStatus = (status: string): string => {
  const shipmentStatusLabels = {
    PENDING: 'Chờ chuyển giao',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao hàng',
    RETURNED: 'Trả hàng',
    CANCELED: 'Hủy'
  };
  return shipmentStatusLabels[status as keyof typeof shipmentStatusLabels] || '---';
};
  
  const fetchOrderStatusCounts = async () => {
  try {
    const response = await OrderService.getOrderStatusCounts();
    const data = response.data;

    const map: Record<string, number> = {};
    data?.forEach((item) => {
      map[item.orderStatus] = item.count;
    });

    statusCounts.value = map;
  } catch (error) {
    console.error('Lỗi lấy thống kê trạng thái:', error);
  }
};




  
const getOrderList = async () => {
  loading.value = true;
  try {
    const statusMap = [
      null,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
      OrderStatus.SHIPPED,
      OrderStatus.RETURNED
    ];
    const status = statusMap[activeTab.value];
    filters.value.orderStatus.value = status;

    const response = status
      ? await OrderService.getOrdersByStatus(status)
      : await OrderService.getAllOrders();
    console.log('Fetched orders:', response.data); // Debug log
    if (response.data) {
      orderList.value = response.data
        .filter(order => {
          const isPosFilter = filters.value.isPos.value;
          if (isPosFilter !== null && isPosFilter !== undefined) {
            return order.isPos === isPosFilter;
          }
          return true;
        })
        .filter(order => {
          const globalSearch = filters.value.global.value;
          if (globalSearch) {
            const searchValue = globalSearch.toLowerCase();
            return (
              order.orderCode.toLowerCase().includes(searchValue) ||
              formatOrderStatus(order.orderStatus).toLowerCase().includes(searchValue)
            );
          }
          return true;
        });
      console.log('Filtered orders:', orderList.value); // Debug log
      totalRecords.value = orderList.value.length;
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
  }
  loading.value = false;
};
  
  const onTabChange = (index: number) => {
    activeTab.value = index;
    lazyParams.value.page = 0; // Reset to first page when changing tabs
    getOrderList();
  };
  
  const onPage = (event: any) => {
    lazyParams.value.page = event.first / event.rows;
    lazyParams.value.size = event.rows;
    getOrderList();
    fetchOrderStatusCounts();
  };
  
  const initFilters = () => {
    filters.value = {
      global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      isPos: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
      orderStatus: { value: null as string | null, matchMode: FilterMatchMode.EQUALS }
    };
    activeTab.value = 0; // Reset to "Tất cả" tab
    lazyParams.value.page = 0;
    lazyParams.value.size = 5;
    getOrderList();
  };
  
  onMounted(() => {
    getOrderList();
    fetchOrderStatusCounts();
  });


//   const printInvoice = (order: OrderResponse) => {
//   const printWindow = window.open('', '', 'width=800,height=600');
//   if (!printWindow) return;

//   const formatCurrency = (value?: number | null) =>
//     (value ?? 0)
//       .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
//       .replace('₫', 'đ');

//   const discount = order.couponUsages?.[0]?.discountAmount ?? 0;
//   const paymentAmount = order.payment?.amount ?? 0;
//   const changeAmount = paymentAmount - ((order.orderTotal ?? 0) - discount);

//   const rowsHtml = order.items?.map((item, index) => `
//     <tr>
//       <td class="text-center">${index + 1}</td>
//       <td>${item.productName || '---'}</td>
//       <td class="text-center">${item.quantity || 0}</td>
//       <td class="text-right">${formatCurrency(item.unitPrice)}</td>
//       <td class="text-right">${formatCurrency((item.unitPrice ?? 0) * (item.quantity ?? 0))}</td>
//     </tr>
//   `).join('') || '';

//   const htmlContent = `
//     <html>
//     <head>
//       <title>Hóa đơn - ${order.orderCode}</title>
//       <style>
//         body { font-family: Arial, sans-serif; font-size: 14px; padding: 20px; }
//         .text-center { text-align: center; }
//         .text-right { text-align: right; }
//         .font-bold { font-weight: bold; }
//         table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//         th, td { border: 1px solid #000; padding: 6px; }
//         th { background: #f5f5f5; }
//         .mb-2 { margin-bottom: 8px; }
//         .mb-3 { margin-bottom: 12px; }
//         .mb-4 { margin-bottom: 16px; }
//       </style>
//     </head>
//     <body>
//       <div class="text-center mb-4">
//         <h2 class="font-bold">CỬA HÀNG BÁN GIÀY THỂ THAO SHOESHOP</h2>
//         <p>Địa chỉ: 13 Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội.</p>
//         <p>Hotline: 0123 456 789</p>
//       </div>

//       <h2 class="text-center font-bold mb-4">HÓA ĐƠN THANH TOÁN</h2>

//       <div class="mb-3">
//         <p><strong>Ngày in:</strong> ${new Date().toLocaleString('vi-VN')}</p>
//         <p><strong>Mã đơn:</strong> ${order.orderCode}</p>
//         <p><strong>Loại đơn:</strong> ${order.isPos ? 'Tại quầy' : 'Ship'}</p>
//         <p><strong>Khách hàng:</strong> ${order.address?.receiverName || 'Vãng lai'}</p>
//         <p><strong>SĐT:</strong> ${order.address?.receiverPhone || ''}</p>
//         <p><strong>Địa chỉ:</strong> 
//           ${order.address?.addressStreet || ''}, 
//           ${order.address?.addressWard || ''}, 
//           ${order.address?.addressDistrict || ''}, 
//           ${order.address?.addressProvince || ''}
//         </p>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th>STT</th>
//             <th>Sản phẩm</th>
//             <th>Số lượng</th>
//             <th>Đơn giá</th>
//             <th>Thành tiền</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${rowsHtml}
//         </tbody>
//       </table>

//       <div class="text-right" style="margin-top: 12px;">
//         <p><strong>Tổng tiền hàng:</strong> ${formatCurrency(order.orderTotal)}</p>
//         <p><strong>Số tiền giảm:</strong> ${formatCurrency(discount)}</p>
//         <p><strong>Khách thanh toán:</strong> ${formatCurrency(paymentAmount)}</p>
//         <p><strong>Tiền thừa:</strong> ${formatCurrency(changeAmount)}</p>
//       </div>
//     </body>
//     </html>
//   `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();

//   // Đảm bảo in sau khi nội dung đã render xong
//   printWindow.onload = () => {
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };
// };
const printInvoice = (order: OrderResponse) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;

  const formatCurrency = (value?: number | null) =>
    (value ?? 0)
      .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace('₫', 'đ');

  // Kiểm tra discount, chỉ hiển thị nếu > 0
  const discount = order.couponUsages?.[0]?.discountAmount ?? 0;
  const discountDisplay = discount > 0 ? `<p><strong>Số tiền giảm:</strong> ${formatCurrency(discount)}</p>` : '';

  // Sử dụng payment.amount làm paymentAmount
  const paymentAmount = order.payment?.amount ?? 0;
  const orderTotal = order.orderTotal ?? 0;
  const changeAmount = paymentAmount > orderTotal ? paymentAmount - orderTotal : 0;
  const logoUrl = new URL('@/assets/img/logo-shoe.png', import.meta.url).href;
  // Xử lý rowsHtml
  const rowsHtml = order.items?.map((item, index) => `
    <tr>
      <td class="text-center">${index + 1}</td>
      <td>${item.productName || '---'}</td>
      <td class="text-center">${item.quantity || 0}</td>
      <td class="text-right">${formatCurrency(item.unitPrice)}</td>
      <td class="text-right">${formatCurrency((item.unitPrice ?? 0) * (item.quantity ?? 0))}</td>
    </tr>
  `).join('') || '';

  const htmlContent = `
    <html>
    <head>
      <title>Hóa đơn - ${order.orderCode || 'Không xác định'}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; padding: 20px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; }
        th { background: #f5f5f5; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="text-center mb-4">
        <h2 class="font-bold">CỬA HÀNG BÁN GIÀY THỂ THAO SHOESHOP</h2>
        <img src="${logoUrl}" alt="Logo công ty" class="mx-auto mb-2" width="70" />


        <p>Địa chỉ: 13 Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội.</p>
        <p>Hotline: 0123 456 789</p>
      </div>

      <h2 class="text-center font-bold mb-4">HÓA ĐƠN THANH TOÁN</h2>

      <div class="mb-3">
        <p><strong>Ngày in:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>Mã đơn:</strong> ${order.orderCode || 'N/A'}</p>
        <p><strong>Loại đơn:</strong> ${order.isPos ? 'Tại quầy' : 'Ship'}</p>
        <p><strong>Khách hàng:</strong> ${order.address?.receiverName || 'Vãng lai'}</p>
        <p><strong>SĐT:</strong> ${order.address?.receiverPhone || ''}</p>
        <p><strong>Địa chỉ:</strong> 
          ${order.address?.addressStreet || ''}, 
          ${order.address?.addressWard || ''}, 
          ${order.address?.addressDistrict || ''}, 
          ${order.address?.addressProvince || ''}
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="text-right" style="margin-top: 12px;">
        <p><strong>Tổng tiền hàng:</strong> ${formatCurrency(orderTotal)}</p>
        ${discountDisplay} <!-- Chỉ hiển thị nếu discount > 0 -->
        <p><strong>Khách thanh toán:</strong> ${formatCurrency(paymentAmount)}</p>
        <p><strong>Tiền thừa:</strong> ${formatCurrency(changeAmount)}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};





</script>
  
  <style scoped>
  
  .p-tabview .p-tabview-nav {
    margin-bottom: 1rem;
  }
  </style>