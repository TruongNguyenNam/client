import axios from 'axios';
import type { CarrierClientResponse } from '../../model/client/carrier';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/client/carrier";
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

export const CarrierClientService = {
    getAllCarriers: async (): Promise<ApiResponse<CarrierClientResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CarrierClientResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all carriers:', error);
            throw new Error('Failed to fetch carriers. Please try again later.');
        }
    },

}