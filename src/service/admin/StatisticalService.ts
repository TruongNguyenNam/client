import axios from 'axios';
import type { DailyRevenueResponse, MonthlyRevenueResponse, YearlyRevenueResponse, MonthlyOrderTypeResponse } from '../../model/admin/statistical';
import type { OrderStatusMonthResponse, OrderStatusTodayResponse, OrderStatusYearResponse, CustomStatisticalResponse } from '../../model/admin/statistical';
import type { SoldQuantityResponse, SoldQuantityByMonthResponse, SoldQuantityByYearResponse, SellingProductsResponse } from '../../model/admin/statistical';
import type { ApiResponse } from "../../utils/ApiResponse";

const API_URL = "http://localhost:8080/api/v1/admin/order";
const API_URLS = "http://localhost:8080/api/v1/admin/orderItems";

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
export const Statistical = {
  getDailyRevenue: async (): Promise<ApiResponse<DailyRevenueResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DailyRevenueResponse[]>>(`${API_URL}/revenue/daily`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      throw new Error('Failed to fetch daily revenue. Please try again later.');
    }
  },

  getMonthlyRevenue: async (year: number, month: number): Promise<ApiResponse<MonthlyRevenueResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<MonthlyRevenueResponse[]>>(
        `${API_URL}/revenue/monthly`,
        { params: { year, month } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw new Error('Failed to fetch monthly revenue. Please try again later.');
    }
  },

  getYearlyRevenue: async (year: number): Promise<ApiResponse<YearlyRevenueResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<YearlyRevenueResponse[]>>(
        `${API_URL}/revenue/yearly`,
        { params: { year } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching yearly revenue:', error);
      throw new Error('Failed to fetch yearly revenue. Please try again later.');
    }
  },

  getCancelledToday: async (): Promise<ApiResponse<OrderStatusTodayResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusTodayResponse>>(`${API_URL}/cancelled/today`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cancelled orders today:', error);
      throw new Error('Failed to fetch cancelled orders today.');
    }
  },

  getCancelledThisMonth: async (): Promise<ApiResponse<OrderStatusMonthResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusMonthResponse>>(`${API_URL}/cancelled/month`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cancelled orders this month:', error);
      throw new Error('Failed to fetch cancelled orders this month.');
    }
  },

  getCancelledThisYear: async (): Promise<ApiResponse<OrderStatusYearResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusYearResponse>>(`${API_URL}/cancelled/year`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cancelled orders this year:', error);
      throw new Error('Failed to fetch cancelled orders this year.');
    }
  },

  // Đơn hàng đã hoàn thành
  getCompletedToday: async (): Promise<ApiResponse<OrderStatusTodayResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusTodayResponse>>(`${API_URL}/completed/today`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed orders today:', error);
      throw new Error('Failed to fetch completed orders today.');
    }
  },

  getCompletedThisMonth: async (): Promise<ApiResponse<OrderStatusMonthResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusMonthResponse>>(`${API_URL}/completed/month`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed orders this month:', error);
      throw new Error('Failed to fetch completed orders this month.');
    }
  },

  getCompletedThisYear: async (): Promise<ApiResponse<OrderStatusYearResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusYearResponse>>(`${API_URL}/completed/year`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed orders this year:', error);
      throw new Error('Failed to fetch completed orders this year.');
    }
  },

  // Đơn hàng đã trả lại
  getReturnedToday: async (): Promise<ApiResponse<OrderStatusTodayResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusTodayResponse>>(`${API_URL}/returned/today`);
      return response.data;
    } catch (error) {
      console.error('Error fetching returned orders today:', error);
      throw new Error('Failed to fetch returned orders today.');
    }
  },

  getReturnedThisMonth: async (): Promise<ApiResponse<OrderStatusMonthResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusMonthResponse>>(`${API_URL}/returned/month`);
      return response.data;
    } catch (error) {
      console.error('Error fetching returned orders this month:', error);
      throw new Error('Failed to fetch returned orders this month.');
    }
  },

  getReturnedThisYear: async (): Promise<ApiResponse<OrderStatusYearResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStatusYearResponse>>(`${API_URL}/returned/year`);
      return response.data;
    } catch (error) {
      console.error('Error fetching returned orders this year:', error);
      throw new Error('Failed to fetch returned orders this year.');
    }
  },
  //Sản phẩm bán theo ngày tháng năm
  getSoldToday: async (): Promise<ApiResponse<SoldQuantityResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SoldQuantityResponse>>(
        `${API_URLS}/total-sold-quantity/day`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity today:', error);
      throw new Error('Failed to fetch sold quantity today.');
    }
  },
  getSoldThisMonth: async (): Promise<ApiResponse<SoldQuantityByMonthResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SoldQuantityByMonthResponse>>(
        `${API_URLS}/total-sold-quantity/month`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity this month:', error);
      throw new Error('Failed to fetch sold quantity this month.');
    }
  },

  getSoldThisYear: async (): Promise<ApiResponse<SoldQuantityByYearResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SoldQuantityByYearResponse>>(
        `${API_URLS}/total-sold-quantity/year`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity this year:', error);
      throw new Error('Failed to fetch sold quantity this year.');
    }
  },
  getSellingToday: async (): Promise<ApiResponse<SellingProductsResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SellingProductsResponse>>(
        `${API_URLS}/top-selling-products-today`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity today:', error);
      throw new Error('Failed to fetch sold quantity today.');
    }
  },

  getSellingThisMonth: async (): Promise<ApiResponse<SellingProductsResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SellingProductsResponse>>(
        `${API_URLS}/top-selling-products-month`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity this month:', error);
      throw new Error('Failed to fetch sold quantity this month.');
    }
  },

  getSellingThisYear: async (): Promise<ApiResponse<SellingProductsResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SellingProductsResponse>>(
        `${API_URLS}/top-selling-products-year`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity this year:', error);
      throw new Error('Failed to fetch sold quantity this year.');
    }
  },
  getSellingBetween: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<SellingProductsResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SellingProductsResponse>>(
        `${API_URLS}/top-selling-products-between`,
        {
          params: {
            filterBy: 'custom',
            startDate: startDate,
            endDate: endDate
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sold quantity between dates:', error);
      throw new Error('Failed to fetch sold quantity between dates.');
    }
  },
  getCustom: async (fromDate: string, toDate: string): Promise<CustomStatisticalResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<CustomStatisticalResponse>>(
        `${API_URL}/custom`,
        {
          params: {
            from: fromDate,
            to: toDate
          }
        }
      );

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching custom statistics:', error);
      throw new Error('Failed to fetch custom statistics.');
    }
  },
  getChart: async (): Promise<ApiResponse<MonthlyOrderTypeResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<MonthlyOrderTypeResponse[]>>(
        `${API_URL}/chart/monthly-orders`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly orders:', error);
      throw new Error('Failed to fetch monthly orders.');
    }
  }




};
