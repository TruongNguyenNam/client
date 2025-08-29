import axios from 'axios';
import type { ApiResponse } from '../../utils/ApiResponse';
import type { CustomerRequest } from '../../model/admin/customer';
import type { CustomerResponse } from '../../model/admin/customer';
import type { AddressRequest } from '../../model/admin/address';
const API_URL = "http://localhost:8080/api/v1/admin/customers";
const axiosInstance = axios.create();

const getAuthToken = (): string | null => {
    return sessionStorage.getItem('accessToken');
};

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
             console.log('[axios] attach token:', !!token); // debug
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
    // Thêm khách hàng mới
    createCustomer: async (data: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CustomerResponse>>(
                `${API_URL}/add`,
                data
            );
            return response.data;

        } catch (error) {

            throw error;
        }
    },

    // Sửa thông tin khách hàng
    updateCustomer: async (id: number, data: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<CustomerResponse>>(
                `${API_URL}/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Tìm kiếm khách hàng theo keyword (email, phone, username)
    searchCustomers: async (keyword: string): Promise<ApiResponse<CustomerResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CustomerResponse[]>>(
                `${API_URL}/search`,
                {
                    params: {
                        keyword: keyword
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to search customers.');
        }
    },

    getCustomerById: async (id: number): Promise<ApiResponse<CustomerResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CustomerResponse>>(
                `${API_URL}/${id}`
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch customer by id.');
        }
    },
// thêm dia chi
    addAddressForCustomer: async (customerId: number, addressData: AddressRequest): Promise<ApiResponse<any>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<any>>(
                `${API_URL}/${customerId}/addresses`,
                addressData
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm địa chỉ:", error);
            throw error;
        }
    }

};