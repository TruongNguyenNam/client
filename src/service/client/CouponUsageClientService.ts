import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
import type { CouponUsageClientResponse } from '../../model/client/couponUsage';


const API_URL = "http://localhost:8080/api/v1/client/coupon_usage";
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

export const CouponUsageClientService = {
    getAllCouponUsage: async (userId: number): Promise<ApiResponse<CouponUsageClientResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponUsageClientResponse[]>>(`${API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all CouponUsage:', error);
            throw new Error('Failed to fetch CouponUsage. Please try again later.');
        }
    },

}