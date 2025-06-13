import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";

import type { CustomerResponse } from '../../model/customer';

const API_URL = "http://localhost:8080/api/v1/admin/customers";
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

export const CustomerService = {
    getAllUsers: async (): Promise<ApiResponse<CustomerResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CustomerResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all Customer:', error);
            throw new Error('Failed to fetch Customer. Please try again later.');
        }
    },
    getCustomersNotReceivedCoupon: async (couponId: number): Promise<ApiResponse<CustomerResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CustomerResponse[]>>(
                `${API_URL}/not-received-coupon/${couponId}`
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch customers not received coupon.');
        }
    },

};
