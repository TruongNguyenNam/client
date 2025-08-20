<template>
  <footer class="bg-gray-900 text-white py-6 px-4 md:px-8 text-center text-sm mt-auto">
    <div class="flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="space-y-2">
        <p class="font-semibold">CÔNG TY TNHH SHOESPORTS VIỆT NAM</p>
        <p>Địa chỉ: 6, Tòa Friendship, 13 Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam</p>
        <p><span class="pi pi-phone"></span> Số điện thoại: 0974945488</p>
        <p><span class="pi pi-envelope"></span> Email: saleonline@shoesports.com</p>
        <p>© Bản quyền thuộc về ShoeSports Việt Nam | Cục cấp bộ Haravan</p>
      </div>
      <div class="space-y-2">
        <p class="font-semibold">CHÍNH SÁCH</p>
        <p><span class="pi pi-check-circle"></span> Chính sách hoàn trả</p>
        <p><span class="pi pi-refresh"></span> Chính sách đổi trả hàng</p>
        <p><span class="pi pi-lock"></span> Chính sách bảo mật thông tin</p>
        <p><span class="pi pi-search"></span> Chính sách kiểm hàng</p>
      </div>
      <div class="space-y-2">
        <p class="font-semibold">HỖ TRỢ KHÁCH HÀNG</p>
        <p><span class="pi pi-info-circle"></span> Giới thiệu</p>
        <p><span class="pi pi-book"></span> Quy định chung</p>
        <p><span class="pi pi-map-marker"></span> Hệ thống cửa hàng</p>
        <p><span class="pi pi-truck"></span> Kiểm tra đơn hàng</p>
        <p><span class="pi pi-child"></span> ShoeSports Kids</p>
      </div>
      <div class="space-y-4">
        <p class="font-semibold">ĐĂNG KÝ NHẬN TIN</p>
        <input v-model="email" type="email" placeholder="Nhập địa chỉ email" class="p-2 mb-2 w-full md:w-48 border rounded-lg text-black" />
        <button @click="subscribe" class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg w-full md:w-48 transition duration-200">
          <span class="pi pi-send"></span> Đăng ký
        </button>
        <div class="flex justify-center space-x-3 mt-2">
          <a href="#" class="text-blue-400 hover:text-blue-600"><span class="pi pi-facebook"></span></a>
          <a href="#" class="text-pink-400 hover:text-pink-600"><span class="pi pi-instagram"></span></a>
          <a href="#" class="text-gray-400 hover:text-gray-600"><span class="pi pi-tiktok"></span></a>
          <a href="#" class="text-red-400 hover:text-red-600"><span class="pi pi-youtube"></span></a>
        </div>
      </div>
    </div>
    <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <!-- <img src="https://via.placeholder.com/100" alt="Bo Thong Bao" class="mb-2 md:mb-0" />
      <div class="flex space-x-3">
        <img src="https://via.placeholder.com/40" alt="Visa" class="hover:opacity-80" />
        <img src="https://via.placeholder.com/40" alt="Mastercard" class="hover:opacity-80" />
        <img src="https://via.placeholder.com/40" alt="MoMo" class="hover:opacity-80" />
        <img src="https://via.placeholder.com/40" alt="ZaloPay" class="hover:opacity-80" />
        <img src="https://via.placeholder.com/40" alt="COD" class="hover:opacity-80" />
      </div> -->
    </div>
    <p class="mt-4 text-xs">
      Công ty TNHH ShoeSports Việt Nam, Số CN DKDN: 0318507641 - Ngày cấp: 12/06/2024 - 
      Nơi cấp: Sở Kế hoạch và đầu tư tại thành phố Hồ Chí Minh - Phòng đăng ký kinh doanh
    </p>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const currentYear = new Date().getFullYear();

const subscribe = () => {
  if (email.value) {
    alert(`Đăng ký nhận tin với email: ${email.value} vào ngày ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    email.value = '';
  }
};
</script>
