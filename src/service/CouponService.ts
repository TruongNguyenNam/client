import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { CouponResponse } from './../model/coupon';

const API_URL = "http://localhost:8080/api/v1/admin/coupon";
const axiosInstance = axios.create();

export const CouponService = {
    getAllCoupons: async (): Promise<ApiResponse<CouponResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all Coupon:', error);
            throw new Error('Failed to fetch Coupon. Please try again later.');
        }
    },

};