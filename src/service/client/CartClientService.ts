import axios from 'axios';
import type { ShoppingCartRequest,ShoppingCartResponse,OrderRequestClient,OrderResponseClient } from '../../model/client/cart';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/client/cart";
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

export const CartClientService = {
    addToCart: async (request: ShoppingCartRequest): Promise<ApiResponse<ShoppingCartResponse>> => {
        const response = await axiosInstance.post<ApiResponse<ShoppingCartResponse>>(`${API_URL}/add`, request);
        return response.data;
    },


    viewCart: async (userId: number): Promise<ApiResponse<ShoppingCartResponse[]>> => {
        const response = await axiosInstance.get<ApiResponse<ShoppingCartResponse[]>>(`${API_URL}/view`, {
            params: { userId }
        });
        return response.data;
    },

    removeProductFromCart: async (cartItemId: number): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`${API_URL}/remove/${cartItemId}`);
        return response.data;
    },

    updateCartQuantity: async (cartItemId: number, quantity: number): Promise<ApiResponse<ShoppingCartResponse>> => {
        const response = await axiosInstance.put<ApiResponse<ShoppingCartResponse>>(
            `${API_URL}/update/${cartItemId}`,
            null,
            { params: { quantity } }
        );
        return response.data;
    },

    countCartItemsByUserId: async (userId: number): Promise<ApiResponse<number>> => {
        const response = await axiosInstance.get<ApiResponse<number>>(`${API_URL}/count`, {
            params: { userId }
        });
        return response.data;
    }
    ,
    checkout: async (request: OrderRequestClient): Promise<ApiResponse<OrderResponseClient>> => {
        const response = await axiosInstance.post<ApiResponse<OrderResponseClient>>(`${API_URL}/checkout`, request);
        return response.data;
    },

    getOrdersByUserId: async (userId: number): Promise<ApiResponse<OrderResponseClient[]>> => {
        const response = await axiosInstance.get<ApiResponse<OrderResponseClient[]>>(`${API_URL}/order/${userId}`);
        return response.data;
      }
      ,
      cancelOrderByCode: async (orderCode: string): Promise<ApiResponse<OrderResponseClient>> => {
        const response = await axiosInstance.put<ApiResponse<OrderResponseClient>>(
          `${API_URL}/cancel/${orderCode}`
        );
        return response.data;
      }
      


}