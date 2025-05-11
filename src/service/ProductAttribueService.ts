import axios from 'axios';
import type { ProductAttributeResponse } from '../model/productAttribute';
import type { ProductAttributeRequest } from '../model/productAttribute';
import type { ApiResponse } from "../utils/ApiResponse";
const API_URL = "http://localhost:8080/api/v1/admin/attribute";
const axiosInstance = axios.create();

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
    
    // Lấy product attribute theo ID
    getProductAttributeById: async (id: number): Promise<ApiResponse<ProductAttributeResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductAttributeResponse>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product attribute with ID ${id}:`, error);
            throw new Error('Failed to fetch product attribute. Please try again later.');
        }
    },
    //addadd
    saveProductAttribute: async (data: ProductAttributeRequest): Promise<ApiResponse<ProductAttributeResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<ProductAttributeResponse>>(`${API_URL}/save`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lưu thuộc tính sản phẩm:", error);
            throw new Error("Không thể lưu thuộc tính. Vui lòng thử lại sau.");
        }
    },
    updateProductAttribute: async (
        id: number,
        data: ProductAttributeRequest
      ): Promise<ApiResponse<ProductAttributeResponse>> => {
        try {
          const response = await axiosInstance.put<ApiResponse<ProductAttributeResponse>>(
            `${API_URL}/update/${id}`,
            data
          );
          return response.data;
        } catch (error) {
          console.error("Lỗi khi cập nhật thuộc tính sản phẩm:", error);
          throw new Error("Không thể cập nhật thuộc tính. Vui lòng thử lại sau.");
        }
      }      
   
}

















