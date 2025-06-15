import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { CustomerRequest } from '../model/customer';
import type { CustomerResponse } from '../model/customer';
const API_URL = "http://localhost:8080/api/v1/admin/customers";
const axiosInstance = axios.create();

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

            throw new Error('Failed to create customer.');
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
            throw new Error('Failed to update customer.');
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
};