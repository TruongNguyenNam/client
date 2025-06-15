import axios from 'axios';
import type { ProductResponseClient } from '../../model/client/product';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/client/product";
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

export const ProductClientService = {
    getAllChildProducts: async (): Promise<ApiResponse<ProductResponseClient[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductResponseClient[]>>(`${API_URL}`);
            return response.data; 
        } catch (error) {
            console.error("Get All Child Products Error:", error);
            throw new Error("Không thể lấy danh sách sản phẩm con. Vui lòng thử lại sau.");
        }
      },


    findByParentProductId: async (id: number): Promise<ApiResponse<ProductResponseClient[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProductResponseClient[]>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Get Product By Id Error:", error);
            throw new Error("Không thể lấy danh sách sản phẩm con. Vui lòng thử lại sau.");
        }
    }

    


}