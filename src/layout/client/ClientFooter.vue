<template>
  <footer class="bg-gray-900 text-white py-4 px-6 text-center text-sm mt-auto">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div>
        <p>CÔNG TY TNHH ANTA SPORTS VIỆT NAM</p>
        <p>Địa chỉ: 6, Tòa Friendship, Số 3, Đường Lê Duẩn, Phường Bến Nghé, Quận 1, Hồ Chí Minh, Việt Nam</p>
        <p>Số điện thoại: 0974945488</p>
        <p>Email: saleonline@anta.com</p>
        <p>© Bản quyền thuộc về Anta Việt Nam | Cục cấp bộ Haravan</p>
      </div>
      <div>
        <p>CHÍNH SÁCH</p>
        <p>Chính sách hoàn chuện</p>
        <p>Chính sách đổi trả hàng</p>
        <p>Chính sách bảo mật thông tin</p>
        <p>Chính sách kiểm hàng</p>
      </div>
      <div>
        <p>HỖ TRỢ KHÁCH HÀNG</p>
        <p>Giới thiệu</p>
        <p>Quy định chung</p>
        <p>Hệ thống cửa hàng</p>
        <p>Kiếm Tra Đơn Hàng</p>
        <p>ANTA Kids</p>
      </div>
      <div>
        <p>ĐĂNG KÝ NHẬN TIN</p>
        <input v-model="email" type="email" placeholder="Nhập địa chỉ email" class="p-2 mb-2 w-full md:w-auto" />
        <button @click="subscribe" class="bg-blue-500 text-white p-2 w-full md:w-auto">Đăng ký</button>
        <div class="flex justify-center space-x-2 mt-2">
          <a href="#" class="text-blue-500"><i class="pi pi-facebook"></i></a>
          <a href="#" class="text-blue-500"><i class="pi pi-instagram"></i></a>
          <a href="#" class="text-blue-500"><i class="pi pi-tiktok"></i></a>
          <a href="#" class="text-red-500"><i class="pi pi-youtube"></i></a>
        </div>
      </div>
    </div>
    <div class="mt-4 flex flex-col md:flex-row justify-between items-center">
      <img src="https://via.placeholder.com/100" alt="Bo Thong Bao" class="mb-2 md:mb-0" />
      <div class="flex space-x-2">
        <img src="https://via.placeholder.com/40" alt="Visa" />
        <img src="https://via.placeholder.com/40" alt="Mastercard" />
        <img src="https://via.placeholder.com/40" alt="MoMo" />
        <img src="https://via.placeholder.com/40" alt="ZaloPay" />
        <img src="https://via.placeholder.com/40" alt="COD" />
      </div>
    </div>
    <p class="mt-2">Cõng ty TNHH Anta Sports Việt Nam, Số CN DKDN: 0318507641 - Ngày cấp: 12/06/2024 - Nơi cấp: Sở Kế hoạch và đầu tư tại thành phố Hồ Chí Minh - Phòng đăng ký kinh doanh</p>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const currentYear = new Date().getFullYear();

const subscribe = () => {
  if (email.value) {
    alert(`Đăng ký nhận tin với email: ${email.value}`);
    email.value = '';
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>