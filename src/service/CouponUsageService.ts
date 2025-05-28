import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { CouponUsageResponse } from '../model/couponUsage';

const API_URL = "http://localhost:8080/api/v1/admin/coupon_usage";
const axiosInstance = axios.create();

export const CouponUsageService = {
    getAllCouponUsage: async (customerId: number): Promise<ApiResponse<CouponUsageResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponUsageResponse[]>>(`${API_URL}/${customerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all CouponUsage:', error);
            throw new Error('Failed to fetch CouponUsage. Please try again later.');
        }
    },

};

