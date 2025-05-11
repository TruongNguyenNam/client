import axios from 'axios';
import type { ProductAttributeResponse } from '../model/productAttribute';
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
    }
}

















