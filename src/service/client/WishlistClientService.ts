import axios from 'axios';
import type { WishlistRequest,WishlistResponse } from '../../model/client/wishlist';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/client/wishlist";
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

export const WishlistClientService = {
    addToWishlist: async (wishlistRequest: WishlistRequest): Promise<ApiResponse<WishlistResponse>> => {
        try {
          const response = await axiosInstance.post<ApiResponse<WishlistResponse>>(`${API_URL}/add`, wishlistRequest);
          return response.data;
        } catch (error) {
          console.error("Add to Wishlist Error:", error);
          throw new Error("Không thể thêm sản phẩm vào yêu thích.");
        }
      },
    
      getWishlistByUserId: async (userId: number): Promise<ApiResponse<WishlistResponse[]>> => {
        try {
          const response = await axiosInstance.get<ApiResponse<WishlistResponse[]>>(`${API_URL}/all/${userId}`);
          return response.data;
        } catch (error) {
          console.error("Get Wishlist Error:", error);
          throw new Error("Không thể lấy danh sách yêu thích.");
        }
      },
    
      removeFromWishlist: async (id: number): Promise<ApiResponse<string>> => {
        try {
          const response = await axiosInstance.delete<ApiResponse<string>>(`${API_URL}/remove/${id}`);
          return response.data;
        } catch (error) {
          console.error("Remove Wishlist Error:", error);
          throw new Error("Không thể xoá sản phẩm khỏi danh sách yêu thích.");
        }
      }



    


}