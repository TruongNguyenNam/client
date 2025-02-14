import axios from "axios";
import type { SuppliersApiResponse, SupplierRequest, SupplierResponse } from "../model/supplier";

const API_URL = "http://localhost:8080/api/v1/admin/supplier";

const axiosInstance = axios.create();

export const SupplierService = {
    // Lấy danh sách nhà cung cấp có phân trang
    getAllSupplier: async (page: number = 0, size: number = 5): Promise<SuppliersApiResponse> => {
        const response = await axiosInstance.get<SuppliersApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data;
    },

    // Tìm nhà cung cấp theo tên
    findByName: async (name: string): Promise<SupplierResponse[]> => {
        const response = await axiosInstance.get<SupplierResponse[]>(`${API_URL}/search?name=${name}`);
        return response.data;
    },

    // Lấy thông tin nhà cung cấp theo ID
    getSupplierById: async (id: number): Promise<SupplierResponse> => {
        const response = await axiosInstance.get<SupplierResponse>(`${API_URL}/${id}`);
        return response.data;
    },

    // Thêm mới nhà cung cấp
    saveSupplier: async (supplierRequest: SupplierRequest): Promise<SupplierResponse> => {
        const response = await axiosInstance.post<SupplierResponse>(API_URL, supplierRequest);
        return response.data;
    },

    // Cập nhật nhà cung cấp
    updateSupplier: async (id: number, supplierRequest: SupplierRequest): Promise<SupplierResponse> => {
        const response = await axiosInstance.put<SupplierResponse>(`${API_URL}/${id}`, supplierRequest);
        return response.data;
    },

    // Xóa một hoặc nhiều nhà cung cấp
    deleteSupplier: async (ids: number[]): Promise<void> => {
        try {
            // Chuyển danh sách ID thành chuỗi ngăn cách bằng dấu ","
            const idsParam = ids.join(',');
            await axiosInstance.delete(`${API_URL}?id=${idsParam}`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Server response:", error.response.data);
                throw new Error(`Failed to delete suppliers: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to delete suppliers. Please try again later.");
        }
    }
};
