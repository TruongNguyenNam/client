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


export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
  nodes: string;
}

// Enum tương ứng với OrderStatus trong Java
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  RETURNED = 'RETURNED'
}


export interface UpdateOrderRequest {
  id?: number;
  orderCode?: string; 
  notes?:string;
  userId?: number;  
  items?: OrderItemRequest[]; 
  payment?: PaymentRequest;   
  couponUsageIds?: number[]; 
  shipments?: ShipmentRequest[]; 
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface PaymentRequest {
  paymentMethodId: number;
  amount: number;
}

export interface ShipmentRequest {
  carrierId?: number;
  estimatedDeliveryDate: string;
}

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


  getOrderById: async (id: number): Promise<ApiResponse<OrderResponse>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<OrderResponse>>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw new Error('Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  }
  }
  ,
  getOrderByDeletedAndOrderStatus: async (): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderResponse[]>>('/findByShip');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by ship status:', error);
      throw new Error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.');
    }
  },
  //update này sai
  updateOrderItems: async (
    orderCode: string,
    requestData: OrderRequest
  ): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<OrderResponse>>(
        `/${orderCode}/edit-items`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật đơn hàng ${orderCode}:`, error);
      throw new Error('Không thể cập nhật đơn hàng. Vui lòng thử lại sau.');
    }
  },

  updateOrder: async (orderCode: string, data: UpdateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<OrderResponse>>(`/${orderCode}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating order with code ${orderCode}:`, error);
      throw new Error('Không thể cập nhật đơn hàng. Vui lòng thử lại sau.');
    }
  },

  updateOrderStatus: async (
    orderCode: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<OrderResponse>>(
        `/${orderCode}/update-status`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${orderCode}:`, error);
      throw new Error('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    }
  }
  ,

  getOrdersByStatus: async (
    status?: string
  ): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderResponse[]>>(
        '/status',
        {
          params: { status: status || undefined }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      throw new Error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.');
    }
  }

  
  ,  getAllOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderResponse[]>>('/findByShip');
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.');
    }
  }
  
  



 


};