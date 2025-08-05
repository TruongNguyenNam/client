import axios from 'axios';
import type { ReturnOrderResponse ,ReturnOrderDetailResponse,ReturnProductResponse,ReturnRequestRequest,ReturnRequestItemRequest, ReturnRequestResponse,returnHistoryResponse,returnHistoryItemResponse} from '../../model/client/ReturnOrder';
import type { ApiResponse } from '../../utils/ApiResponse';

const API_URL = 'http://localhost:8080/api/v1/client/bank';

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

export const BankService = {
verifyBankAccount: async (bankCode: string, accountNumber: string): Promise<string> => {
  try {
    const response = await axiosInstance.post<{ accountName: string }>(
      '/verify',
      {
        bankCode,
        accountNumber
      }
    );
    return response.data.accountName;
  } catch (error) {
    console.error('Lỗi khi xác minh tài khoản ngân hàng:', error);
    throw new Error('Không thể xác minh tài khoản. Vui lòng thử lại.');
  }
}

}
