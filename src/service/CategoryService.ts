import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/category";
import type { CategoryApiResponse, CategoryRequest, CategoryResponse } from "../model/category";

const axiosInstance = axios.create();

export const CategoryService = {
    getCategoryById: async (id: number): Promise<CategoryResponse> => {
        const response = await axiosInstance.get<CategoryResponse>(`${API_URL}/${id}`);
        return response.data;
    },

    getAllCategories: async (page: number = 0, size: number = 2): Promise<CategoryApiResponse> => {
        const response = await axiosInstance.get<CategoryApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data;
    },

    findByName: async (name: string): Promise<CategoryResponse[]> => {
        const response = await axiosInstance.get<CategoryResponse[]>(`${API_URL}/search?name=${name}`);
        return response.data;
    },

    saveCategory: async (categoryRequest: CategoryRequest): Promise<CategoryResponse> => {
        const response = await axiosInstance.post<CategoryResponse>(API_URL, categoryRequest);
        return response.data;
    },

    updateCategory: async (id: number, categoryRequest: CategoryRequest): Promise<CategoryResponse> => {
        const response = await axiosInstance.put<CategoryResponse>(`${API_URL}/${id}`, categoryRequest);
        return response.data;
    },

    deleteCategory: async (ids: number[]): Promise<void> => {
        try {
            // Thay vì gửi dữ liệu trong body, sử dụng tham số query với dấu "," ngăn cách các ID
            const idsParam = ids.join(',');
            await axiosInstance.delete(`${API_URL}?id=${idsParam}`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to delete categories: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to delete categories. Please try again later.');
        }
    }
    
};
