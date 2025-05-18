import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";

import  type { CustomerResponse } from '../model/customer';

const API_URL = "http://localhost:8080/api/v1/admin/customers";
const axiosInstance = axios.create();

export const CustomerService = {
    getAllCustomers: async (): Promise<ApiResponse<CustomerResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CustomerResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all Customer:', error);
            throw new Error('Failed to fetch Customer. Please try again later.');
        }
    },

};