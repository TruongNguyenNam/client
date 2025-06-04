import axios from 'axios';
import type { CouponUsageMultiRequest, CouponUsageResponse } from '../model/couponUsage';
import type { ApiResponse } from "../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/coupon_usage";
const axiosInstance = axios.create();

export const CouponUsageService = {
  giveCouponToManyCustomers: async (payload: { couponId: number, userIds: number[] }): Promise<ApiResponse<CouponUsageResponse[]>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<CouponUsageResponse[]>>(`${API_URL}/add-multi`, payload);
      return response.data;
    } catch (error) {
      console.error('Error gifting coupon to multiple customers:', error);
      throw new Error('Failed to gift coupon. Please try again later.');
    }
  },
  giveCouponToSingleCustomer: async (payload: { couponId: number, userIds: number[] }): Promise<ApiResponse<CouponUsageResponse>> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/add`, payload);
      return response.data;
    } catch (error) {
      console.error('Error gifting coupon to single customer:', error);
      throw new Error('Failed to gift coupon. Please try again later.');
    }
  }
};