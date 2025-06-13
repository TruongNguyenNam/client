import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
import type { CouponRequest, CouponResponse } from '../../model/coupon';

const API_URL = "http://localhost:8080/api/v1/admin/coupon";
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

export const CouponService = {
    // Lấy tất cả coupon
    getAllCoupons: async (): Promise<ApiResponse<CouponResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all Coupon:', error);
            throw new Error('Failed to fetch Coupon. Please try again later.');
        }
    },

    // Thêm mới coupon
    saveCoupon: async (coupon: CouponRequest): Promise<ApiResponse<CouponResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CouponResponse>>(`${API_URL}/add`, coupon);
            return response.data;
        } catch (error) {
            console.error('Error saving Coupon:', error);
            throw new Error('Failed to save Coupon. Please try again later.');
        }
    },

    // Sửa coupon
    updateCoupon: async (id: number, coupon: CouponRequest): Promise<ApiResponse<CouponResponse>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<CouponResponse>>(`${API_URL}/${id}`, coupon);
            return response.data;
        } catch (error) {
            console.error('Error updating Coupon:', error);
            throw new Error('Failed to update Coupon. Please try again later.');
        }
    },

    // Lấy coupon theo id
    getCouponById: async (id: number): Promise<ApiResponse<CouponResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponResponse>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Coupon by id:', error);
            throw new Error('Failed to fetch Coupon by id. Please try again later.');
        }
    },
    findByCriteria: async (code?: string, discountAmount?: number): Promise<ApiResponse<CouponResponse[]>> => {
        try {
            const params: Record<string, string | number> = {};
            if (code) params.code = code;
            if (discountAmount !== undefined) params.discountAmount = discountAmount;

            const response = await axiosInstance.get<ApiResponse<CouponResponse[]>>(
                `${API_URL}/search`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error searching Coupon:', error);
            throw new Error('Failed to search Coupon. Please try again later.');
        }
    },
    // Xóa mềm coupon
    deleteCoupon: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<void>>(`${API_URL}/xoa/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting Coupon:', error);
            throw new Error('Failed to delete Coupon. Please try again later.');
        }
    },
    // Tìm kiếm coupon theo mã
    getCouponsByCode: async (code: string): Promise<ApiResponse<CouponResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CouponResponse[]>>(
                `${API_URL}/search`,
                { params: { codeCoupon: code } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching Coupons by code:', error);
            throw new Error('Failed to fetch Coupons by code. Please try again later.');
        }
    },
};