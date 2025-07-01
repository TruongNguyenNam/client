import axios from 'axios';
import type { CategoryResponse,CategoryRequest } from '../../model/admin/category';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/category";
const axiosInstance = axios.create();

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

export const CategoryService = {
    getAllCategories: async (): Promise<ApiResponse<CategoryResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all categories:', error);
            throw new Error('Failed to fetch categories. Please try again later.');
        }
    },

    getCategoryById: async (id: number): Promise<ApiResponse<CategoryResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching category with ID ${id}:`, error);
            throw new Error('Failed to fetch category. Please try again later.');
        }
    },

    addCategory: async (categoryRequest: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CategoryResponse>>(`${API_URL}/add`, categoryRequest);
            return response.data;
        } catch (error) {
            console.error('Error adding category:', error);
            throw new Error('Failed to add category. Please try again later.');
        }
    },

    updateCategory: async (id: number, categoryRequest: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<CategoryResponse>>(`${API_URL}/update/${id}`, categoryRequest);
            return response.data;
        } catch (error) {
            console.error(`Error updating category with ID ${id}:`, error);
            throw new Error('Failed to update category. Please try again later.');
        }
    },

    deleteCategory: async (ids: number[]): Promise<ApiResponse<void>> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(`${API_URL}`, { params: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting categories:', error);
            throw new Error('Failed to delete categories. Please try again later.');
        }
    },

    findByName: async (name: string): Promise<ApiResponse<CategoryResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>(`${API_URL}/search`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error finding categories by name ${name}:`, error);
            throw new Error('Failed to find categories. Please try again later.');
        }
    }
};

