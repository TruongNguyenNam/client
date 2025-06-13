import axios from 'axios';
import type { ProductAttributeResponse } from '../../model/productAttribute';
import type { ProductAttributeRequest } from '../../model/productAttribute';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/attribute";
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

export const ProductAttributeService = {
  getAllProductAttribute: async (): Promise<ApiResponse<ProductAttributeResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductAttributeResponse[]>>(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all product attributes:', error);
      throw new Error('Failed to fetch product attributes. Please try again later.');
    }
  },

  getProductAttributeById: async (id: number): Promise<ApiResponse<ProductAttributeResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductAttributeResponse>>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product attribute with ID ${id}:`, error);
      throw new Error('Failed to fetch product attribute. Please try again later.');
    }
  },

  saveProductAttribute: async (data: ProductAttributeRequest): Promise<ApiResponse<ProductAttributeResponse>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<ProductAttributeResponse>>(`${API_URL}/save`, data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lưu thuộc tính sản phẩm:", error);
      throw new Error("Không thể lưu thuộc tính. Vui lòng thử lại sau.");
    }
  },

  updateProductAttribute: async (id: number, data: ProductAttributeRequest): Promise<ApiResponse<ProductAttributeResponse>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<ProductAttributeResponse>>(`${API_URL}/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật thuộc tính sản phẩm:", error);
      throw new Error("Không thể cập nhật thuộc tính. Vui lòng thử lại sau.");
    }
  },

  searchProductAttribute: async (keyword: string) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/search/name/${keyword}`);
      return response.data; // Trả về dữ liệu của response
    } catch (error) {
      console.error('Lỗi khi gọi API tìm kiếm thuộc tính:', error);
      throw error; // Ném lỗi lên để được xử lý ở nơi gọi
    }
  }
};
