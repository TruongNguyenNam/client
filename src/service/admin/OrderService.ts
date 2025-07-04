import axios from 'axios';
import type { ApiResponse } from '../../utils/ApiResponse';
import type { OrderRequest, OrderResponse, CreateInvoiceRequest } from '../../model/admin/order';

const API_URL = 'http://localhost:8080/api/v1/admin/order';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const OrderService = {
  
  createOrder: async (orderRequest: CreateInvoiceRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<OrderResponse>>('', orderRequest);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
    }
  },

  
  addProductToOrder: async (orderCode: string, orderRequest: OrderRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
        `/${orderCode}/products`,
        orderRequest
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding product to order ${orderCode}:`, error);
      throw new Error('Không thể thêm sản phẩm vào đơn hàng. Vui lòng thử lại sau.');
    }
  },

  getAllOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderResponse[]>>('/pos');
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.');
    }
  },
  getOrderById: async (id: number): Promise<ApiResponse<OrderResponse>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<OrderResponse>>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw new Error('Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  }
}


};