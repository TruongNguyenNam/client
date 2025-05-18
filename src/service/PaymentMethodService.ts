import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { PaymentMethodResponse } from './../model/paymentMethod';

const API_URL = "http://localhost:8080/api/v1/admin/payment_method";
const axiosInstance = axios.create();

export const PaymentMethodService = {
    getAllPaymentMethod: async (): Promise<ApiResponse<PaymentMethodResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<PaymentMethodResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all PaymentMethod:', error);
            throw new Error('Failed to fetch PaymentMethod. Please try again later.');
        }
    },

};
