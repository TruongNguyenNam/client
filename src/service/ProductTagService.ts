import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/productTag";
import type { ProductTagResponse } from '../model/ProductTag';
import type { ApiResponse } from "../utils/ApiResponse";
const axiosInstance = axios.create();

export const ProductTagService = {
    getAllTags: async (): Promise<ApiResponse<ProductTagResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductTagResponse[]>>(`${API_URL}`);
            return {
                status: 200,
                message: "lấy danh sách nhãn thành công",
                data: response.data.data || []
            }; 
        } catch (error) {
            console.error('Error fetching all product tags:', error);
            throw new Error('Failed to fetch product tags. Please try again later.');
        }
    },

    getTagById: async (id: number): Promise<ApiResponse<ProductTagResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductTagResponse>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product tag with ID ${id}:`, error);
            throw new Error('Failed to fetch product tag. Please try again later.');
        }
    }
};


































