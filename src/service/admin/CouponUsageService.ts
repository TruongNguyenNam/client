import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
import type { CouponUsageResponse } from '../../model/admin/couponUsage';
import type { CouponUsageMultiRequest } from '../../model/admin/couponUsage';


const API_URL = "http://localhost:8080/api/v1/admin/coupon_usage";
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


 


