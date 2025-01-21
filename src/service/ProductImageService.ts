import axios from 'axios';
import type { ProductResponse } from '../model/product'; // Adjust the import path as necessary
import type { AxiosResponse } from 'axios';

const API_URL = "http://localhost:8080/api/v1/admin/ProductImage";
const axiosInstance = axios.create();

export const ProductImageService = {
    uploadProductImages: async (images: File[]): Promise<number[]> => {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });

        try {
            const response: AxiosResponse<number[]> = await axiosInstance.post<number[]>(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to upload images", error);
            throw new Error("Failed to upload images");
        }
    },

    getProductImageById: async (id: number): Promise<ProductResponse | null> => {
        try {
            const response: AxiosResponse<ProductResponse> = await axiosInstance.get<ProductResponse>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch product image", error);
            return null;
        }
    }
};









