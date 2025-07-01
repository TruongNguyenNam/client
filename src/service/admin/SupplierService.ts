import axios from "axios";
import type { SupplierRequest, SupplierResponse } from "../../model/admin/supplier";
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/supplier";

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

export const SupplierService = {
    // Lấy danh sách nhà cung cấp có phân trang
    getAllSuppliers: async (): Promise<ApiResponse<SupplierResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<SupplierResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            
        
            console.error('Error fetching all suppliers:', error);
            throw new Error('Failed to fetch suppliers. Please try again later.');
        }
    },

    // Tìm nhà cung cấp theo tên
    findByName: async (name: string): Promise<ApiResponse<SupplierResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<SupplierResponse[]>>(`${API_URL}/search`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error finding suppliers by name ${name}:`, error);
            throw new Error('Failed to find suppliers. Please try again later.');
        }
    },

    // Lấy thông tin nhà cung cấp theo ID
    getSupplierById: async (id: number): Promise<ApiResponse<SupplierResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<SupplierResponse>>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching supplier with ID ${id}:`, error);
            throw new Error('Failed to fetch supplier. Please try again later.');
        }
    },

    // Thêm mới nhà cung cấp
    saveSupplier: async (supplierRequest: SupplierRequest): Promise<ApiResponse<SupplierResponse>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<SupplierResponse>>(`${API_URL}/add`, supplierRequest);
            return response.data;
        } catch (error) {
            console.error('Error saving supplier:', error);
            throw new Error('Failed to save supplier. Please try again later.');
        }
    },

    // Cập nhật nhà cung cấp
    updateSupplier: async (id: number, supplierRequest: SupplierRequest): Promise<ApiResponse<SupplierResponse>> => {
        try {
            const response = await axiosInstance.put<ApiResponse<SupplierResponse>>(`${API_URL}/${id}`, supplierRequest);
            return response.data;
        } catch (error) {
            console.error(`Error updating supplier with ID ${id}:`, error);
            throw new Error('Failed to update supplier. Please try again later.');
        }
    },

    // Xóa một hoặc nhiều nhà cung cấp
    deleteSupplier: async (ids: number[]): Promise<ApiResponse<void>> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(`${API_URL}`, { params: { id: ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting suppliers:', error);
            throw new Error('Failed to delete suppliers. Please try again later.');
        }
    }
};
