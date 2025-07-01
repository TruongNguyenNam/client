import axios from 'axios';
import type { CarrierRequest,CarrierResponse } from '../../model/admin/carrier';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/carrier";
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

export const CarrierService = {
    getAllCarriers: async (): Promise<ApiResponse<CarrierResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CarrierResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all carriers:', error);
            throw new Error('Failed to fetch carriers. Please try again later.');
        }
    },

}