import axios from 'axios';

const API_URL = 'http://localhost:8080/api/';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Định nghĩa interface cho phản hồi từ VNPay
interface VnPayResponse {
  status: number;
  message?: string;
  orderCode?: string; // Thêm orderCode để khớp với vnp_TxnRef
}

// Định nghĩa interface cho phản hồi của service
interface ApiResponse<T> {
  status: boolean;
  data: {
    success: boolean;
    message: string;
    orderCode?: string; // Thêm orderCode để sử dụng trong VNPayCallback
  };
}

export const VnPayService = {
  async verifyVnpayCallback(queryParams: any): Promise<ApiResponse<VnPayResponse>> {
    try {
      const response = await axiosInstance.get('/vnpay/callback', {
        params: queryParams, // Truyền query parameters từ callback URL
      });

      // Kiểm tra phản hồi từ backend
      if (response.status === 200 && response.data.status === 200) {
        return {
          status: true,
          data: {
            success: true,
            message: response.data.message || 'Thanh toán VNPay cho đơn hàng thành công',
            orderCode: queryParams.vnp_TxnRef || response.data.orderCode, // Lấy orderCode từ vnp_TxnRef hoặc backend
          },
        };
      } else {
        return {
          status: false,
          data: {
            success: false,
            message: response.data.message || 'Thanh toán VNPay thất bại',
            orderCode: queryParams.vnp_TxnRef || response.data.orderCode,
          },
        };
      }
    } catch (error: any) {
      console.error('Lỗi khi xác minh callback VNPay:', error);
      return {
        status: false,
        data: {
          success: false,
          message: error.response?.data?.message || 'Lỗi hệ thống khi xác minh thanh toán VNPay',
          orderCode: queryParams.vnp_TxnRef || '', // Đảm bảo orderCode luôn được trả về
        },
      };
    }
  },
};