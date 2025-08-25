import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
const API_URL = "http://localhost:8080/api/v1/admin/attribute_value";
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
export const ProductAttributeValueService = {
    getFirstVariantAttributes: async (
        parentId: number
      ): Promise<ApiResponse<ProductAttributeValueResponse[]>> => {
        const response = await axiosInstance.get<
          ApiResponse<ProductAttributeValueResponse[]>
        >(`${API_URL}/${parentId}`);
        return response.data;
      },
}

export interface ProductAttributeValueResponse {
    id: number;
  
    attributeId: number;
    productName: string;
  
    attributeName: string;
  
    value: string;
  }
  