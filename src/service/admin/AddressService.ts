import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";
import type { AddressResponse } from '../../model/admin/address';
import type { AddressRequest } from '../../model/admin/address';
const API_URL = "http://localhost:8080/api/v1/admin/address";
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

export const AddressService = {

    getAllAddress: async (): Promise<ApiResponse<AddressResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<AddressResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all Address:', error);
            throw new Error('Failed to fetch Address. Please try again later.');
        }
    },
 // sua dia chi
    updateAddressForCustomer: async (
        customerId: number,
        addressId: number,
        addressData: AddressRequest
    ): Promise<ApiResponse<any>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<any>>(
                `${API_URL}/customers/${customerId}/addresses/${addressId}`,
                addressData
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật địa chỉ:", error);
            throw error;
        }
    },

    deleteAddress: async ( customerId: number, addressId: number): Promise<ApiResponse<any>> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<any>>(
                `${API_URL}/customers/${customerId}/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xoá địa chỉ:", error);
             throw new Error('Failed to delete Address. Please try again later.');
        }
    }

};

