
import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/supplier";
import type { SuppliersApiResponse } from "../model/supplier";

const axiosInstance = axios.create();

export const SupplierService = {
    getAllSupplier: async (page: number = 0, size: number = 2): Promise<SuppliersApiResponse> => {
        const response = await axiosInstance.get<SuppliersApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data; 
    },
};

















