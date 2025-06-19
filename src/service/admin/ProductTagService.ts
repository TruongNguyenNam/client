import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/admin/productTag";

import type { ProductTagRequest, ProductTagResponse } from '../../model/admin/ProductTag';
import type { ApiResponse } from "../../utils/ApiResponse";
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
    },
    addProductTag: async (request: ProductTagRequest): Promise<ApiResponse<ProductTagResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<ProductTagResponse>>(`${API_URL}/add`, request);
            return response.data;
        } catch (error) {
            console.error('Error adding product tag:', error);
            throw new Error('Failed to add product tag. Please try again later.');
        }
    },
    updateProductTag: async (id: number, request: ProductTagRequest): Promise<ApiResponse<ProductTagResponse>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<ProductTagResponse>>(`${API_URL}/update/${id}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating product tag with ID ${id}:`, error);
            throw new Error('Failed to update product tag. Please try again later.');
        }
    },

    deleteProductTags: async (ids: number[]): Promise<ApiResponse<void>> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(`${API_URL}`, { params: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting product tags:', error);
            throw new Error('Failed to delete product tags. Please try again later.');
        }
    },

    findProductTagsByName: async (name: string): Promise<ApiResponse<ProductTagResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductTagResponse[]>>(`${API_URL}/search`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error finding product tags by name ${name}:`, error);
            throw new Error('Failed to find product tags. Please try again later.');
        }
    }

};


































