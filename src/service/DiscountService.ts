import axios from 'axios';
import type { DiscountRequest, DiscountResponse } from "../model/discount";
import type { ApiResponse } from "../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/discount";
const axiosInstance = axios.create();

export const DiscountService = {
  getAllDiscount: async (): Promise<ApiResponse<DiscountResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DiscountResponse[]>>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      throw new Error('Failed to fetch discounts. Please try again later.');
    }
  },

  saveDiscount: async (
    discount: DiscountRequest,
    productIds: number[] = [],
    categoryIds: number[] = []
  ): Promise<ApiResponse<DiscountResponse>> => {
    try {
      const params = new URLSearchParams();
      productIds.forEach(id => params.append('productIds', id.toString()));
      categoryIds.forEach(id => params.append('categoryIds', id.toString()));

      const response = await axiosInstance.post<ApiResponse<DiscountResponse>>(
        `${API_URL}/create?${params.toString()}`,
        discount
      );
      return response.data;
    } catch (error) {
      console.error('Error saving discount:', error);
      throw new Error('Failed to save discount. Please try again later.');
    }
  }
};
