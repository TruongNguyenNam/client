import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
import type { ShipmentResponse } from '../../model/admin/shipment';

const API_URL = "http://localhost:8080/api/v1/admin/shipment";
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

export const ShipmentService = {
    getAllshipment: async (): Promise<ApiResponse<ShipmentResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ShipmentResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all shipment:', error);
            throw new Error('Failed to fetch shipment. Please try again later.');
        }
    },

};