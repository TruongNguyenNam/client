import axios from 'axios';
import type { DiscountRequest, DiscountResponse } from "../../model/discount";
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/discount";
const axiosInstance = axios.create();

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
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

export const DiscountService = {
  // Lấy tất cả khuyến mãi
  getAllDiscount: async (): Promise<ApiResponse<DiscountResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DiscountResponse[]>>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      throw new Error('Failed to fetch discounts. Please try again later.');
    }
  },

  // Tạo mới khuyến mãi
  saveDiscount: async (
    discount: DiscountRequest
  ): Promise<ApiResponse<DiscountResponse>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<DiscountResponse>>(
        `${API_URL}/create`,
        discount
      );
      return response.data;
    } catch (error) {
      console.error('Error saving discount:', error);
      throw new Error('Failed to save discount. Please try again later.');
    }
  },

  // ✅ Cập nhật trạng thái khuyến mãi
  updateStatus: async (id: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_URL}/updateStatus/${id}`);
    } catch (error) {
      console.error(`Error updating status for discount ${id}:`, error);
      throw error; // để xử lý lỗi ở component
    }
  },
  // Thêm vào trong DiscountService
searchByName: async (name: string): Promise<ApiResponse<DiscountResponse[]>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DiscountResponse[]>>(
      `${API_URL}/finbyname/${encodeURIComponent(name)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching discount by name "${name}":`, error);
    throw error; // để xử lý trong component
  }
},
updateDiscount: async (
  id: number,
  discount: DiscountRequest,
  config?: { params?: any; headers?: any }  // Thêm config tùy chọn
): Promise<ApiResponse<DiscountResponse>> => {
  try {
    const response = await axiosInstance.put<ApiResponse<DiscountResponse>>(
      `${API_URL}/update/${id}`,
      discount,
      config // truyền config vào đây
    );
    return response.data;
  }catch (error) {
  console.error(`Error updating discount with id ${id}:`, error);
  throw error; // ✅ giữ nguyên để component xử lý chi tiết lỗi
}
},
 getDiscountById: async (id: number): Promise<ApiResponse<DiscountResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DiscountResponse>>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching discount with id ${id}:`, error);
      throw new Error('Failed to fetch discount details. Please try again later.');
    }
  },


};
