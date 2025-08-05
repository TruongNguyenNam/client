import axios from 'axios';
import type { ReturnOrderResponse ,ReturnOrderDetailResponse,ReturnProductResponse,ReturnRequestRequest,ReturnRequestItemRequest, ReturnRequestResponse,returnHistoryResponse,returnHistoryItemResponse} from '../../model/client/ReturnOrder';
import type { ApiResponse } from '../../utils/ApiResponse';

const API_URL = 'http://localhost:8080/api/v1/client/returnorder';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const ReturnOrderClientService = {
  getAllReturnOrders: async (): Promise<ReturnOrderResponse[]> => {
    try {
      const response = await axiosInstance.get<ReturnOrderResponse[]>('');
      console.log('Data từ API:', response.data);

      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng hoàn:', error);
      throw new Error('Không thể lấy đơn hàng hoàn. Vui lòng thử lại sau.');
    }
  },
    getReturnOrderDetail: async (code: string): Promise<ReturnOrderDetailResponse> => {
    try {
      const response = await axiosInstance.get<ReturnOrderDetailResponse>(`/finDetail/${code}`);
      console.log(`Chi tiết đơn hàng [${code}]:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết đơn hàng với mã ${code}:`, error);
      throw new Error('Không thể lấy chi tiết đơn hàng. Vui lòng thử lại sau.');
    }
  }
  ,createReturnOrderRequest: async (
  formData: FormData
): Promise<ApiResponse<ReturnRequestResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<ReturnRequestResponse>>(
      '/create_return_oder',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo yêu cầu hoàn hàng:', error);
    throw error;
  }
},
fetchReturnHistory: async (): Promise<returnHistoryResponse[]> => {
  try {
    const response = await axiosInstance.get<returnHistoryResponse[]>('/history');
    console.log('✅ API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi gọi API /history:', error);
    return [];
  }
},
fetchReturnHistoryItem: async (code: string): Promise<returnHistoryItemResponse[]> => {
  try {
    const response = await axiosInstance.get<returnHistoryItemResponse[]>(`/history_item/${code}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API /history_item/:code:', error);
    return [];
  }
},



}