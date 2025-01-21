import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/attribute";
import type { productAttributesApiResponse } from '../model/productAttribute';
const axiosInstance = axios.create();

export const ProductAttributeService = {
    getAllProductAttribute: async (page: number = 0, size: number = 2): Promise<productAttributesApiResponse> => {
        const response = await axiosInstance.get<productAttributesApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data;
    }
}

















