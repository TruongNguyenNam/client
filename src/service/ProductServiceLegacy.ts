import type { ProductRequest, ProductApiResponse, ProductResponse } from "../model/product";
import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/admin/product";
const axiosInstance = axios.create();

export const ProductService = {
    getAllProducts: async (page: number = 0, size: number = 2): Promise<ProductApiResponse> => {
        try {
            const response = await axiosInstance.get<ProductApiResponse>(`${API_URL}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products. Please try again later.');
        }
    },

    searchProducts: async (
        page: number = 0,
        size: number = 5,
        filters: {
            name?: string;
            sizeParam?: string;
            material?: string;
            sportType?: string;
            color?: string;
            supplierName?: string;
            categoryName?: string;
            minPrice?: number;
            maxPrice?: number;
        }
    ): Promise<ProductApiResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== undefined)
                )
            });

            const response = await axiosInstance.get<ProductApiResponse>(`${API_URL}/search?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products. Please try again later.');
        }
    },

    // Add new product
    addProduct: async (productRequest: ProductRequest): Promise<ProductResponse> => {
        try {
            const response = await axiosInstance.post<ProductResponse>(API_URL, productRequest);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to add product: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to add product. Please try again later.');
        }
    },

    // Update product
    updateProduct: async (id: number, productRequest: ProductRequest): Promise<ProductResponse> => {
        try {
            const response = await axiosInstance.put<ProductResponse>(`${API_URL}/${id}`, productRequest);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to update product: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to update product. Please try again later.');
        }
    },

    // Delete multiple products
    deleteProducts: async (ids: number[]): Promise<void> => {
        try {
            await axiosInstance.delete(API_URL, { data: ids });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to delete products: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to delete products. Please try again later.');
        }
    }
};