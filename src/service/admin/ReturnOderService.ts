import axios from 'axios';
import type {
  ReturnRequestListResponse,
  ReturnRequestItemResponse,
  ReturnRequestListRequest,
  ReturnMediaAdminResponse,
  ReturnPriceResponse
} from '../../model/admin/returnOrder';
import type { ApiResponse } from "../../utils/ApiResponse";

// ✅ Đặt base URL tại đây
const API_URL = "http://localhost:8080/api/v1/admin/return/request";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// ✅ Lấy token từ sessionStorage và gắn vào headers
const getAuthToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Service export
export const ReturnOderService = {
  // Lấy tất cả đơn hoàn
  getAllReturnRequests: async (): Promise<ReturnRequestListResponse[]> => {
    const response = await axiosInstance.get(`${API_URL}`);
    return response.data;
  },
   returnOrderApproved: async (): Promise<ReturnRequestListResponse[]> => {
    const response = await axiosInstance.get(`${API_URL}/return-order-approved`);
    return response.data;
  },
  
   returnPrice: async (): Promise<ReturnPriceResponse[]> => {
    const response = await axiosInstance.get('/return-price');
    return response.data;
  },

  // Lấy danh sách item của 1 đơn hoàn theo mã đơn hàng
  getReturnItemsByOrderCode: async (
    orderCode: string
  ): Promise<ReturnRequestItemResponse[]> => {
    const response = await axiosInstance.get(`/${orderCode}`);
    return response.data;
  },
  getReturnItemsByOrderCodeApproved: async (
    code: string
  ): Promise<ReturnRequestItemResponse[]> => {
    const response = await axiosInstance.get(`/fin-Code-Return-Approved/${code}`);
    return response.data;
  },
  findByCode: async (
  code: string
): Promise<ReturnRequestListResponse[]> => {
  const response = await axiosInstance.get(`/fin-code-approved/${code}`);
  return response.data;
},
updateStatus: async (id: number): Promise<void> => {
  await axiosInstance.put(`/update-status/${id}`);
},



  // ✅ Phản hồi từng item (duyệt / từ chối)
  // Trong ReturnOderService.ts
responseReturnRequestItem: async (
  id: number,
  status: string,
  data?: ReturnRequestListRequest // Thêm dấu ? để biến này thành optional
): Promise<ReturnRequestItemResponse> => {
  try {
    const response = await axiosInstance.post<ReturnRequestItemResponse>(
      `/returnresponse/${id}`,
      data, // Truyền data vào body
      {
        params: { status }, // Truyền status qua query param
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi phản hồi đơn hoàn:", error);
    throw error;
  }
  
}}

