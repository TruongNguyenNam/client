import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/productTag";
import type { ProductTagApiResponse } from '../model/ProductTag';

const axiosInstance = axios.create();

export const ProductTagService = {
    getAllTags: async (page: number = 0, size: number = 2): Promise<ProductTagApiResponse> => {
        const response = await axiosInstance.get<ProductTagApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data; 
    },
};


































