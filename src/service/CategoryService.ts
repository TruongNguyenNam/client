import axios from 'axios';
const API_URL = "http://localhost:8080/api/v1/admin/category";
import type { CategoryApiResponse } from "../model/category";

const axiosInstance = axios.create();

export const CategoryService = {
    getAllCategories: async (page: number = 0, size: number = 2): Promise<CategoryApiResponse> => {
        const response = await axiosInstance.get<CategoryApiResponse>(`${API_URL}?page=${page}&size=${size}`);
        return response.data; // Trả về đối tượng CategoryApiResponse
    },
};



