import axios from "axios";
import type { ProductReviewRequestClient, ProductReviewResponseClient } from "../../model/client/productReview";
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/client/product_review";
const axiosInstance = axios.create();

const getAuthToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const ProductReviewClientService = {
  getReviewsByParentProductId: async (parentProductId: number): Promise<ApiResponse<ProductReviewResponseClient[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductReviewResponseClient[]>>(`${API_URL}/product/${parentProductId}/review`);
      console.log('ProductReview API response:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw new Error("Failed to fetch product reviews. Please try again later.");
    }
  },

  addReview: async (review: ProductReviewRequestClient, imageFile?: File): Promise<ApiResponse<void>> => {
    try {
      const formData = new FormData();
      formData.append("review", new Blob([JSON.stringify(review)], { type: "application/json" }));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axiosInstance.post<ApiResponse<void>>(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding product review:", error);
      throw new Error("Failed to add product review. Please try again later.");
    }
  },

  deleteReview: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product review:", error);
      throw new Error("Failed to delete product review. Please try again later.");
    }
  },
};
