import type { ApiResponse } from "./apiResponse";
export interface DailyRevenueResponse {
    day: string; 
    totalRevenue: number; 
}
export interface MonthlyRevenueResponse {
    day: string; 
    totalRevenue: number; 
}
export interface YearlyRevenueResponse {
    day: string; 
    totalRevenue: number; 
}

export interface OrderStatusMonthResponse {
    month: number;
    year: number;
    totalOrders: number;
}
export interface OrderStatusTodayResponse {
    date: number;
    totalOrders: number;
}
export interface OrderStatusYearResponse {
    year: number;
    totalOrders: number;
}

export interface SoldQuantityResponse {
    date: String;
    quantity: number;
}

export interface SoldQuantityByMonthResponse {
    month: String;
    quantity: number;
}
export interface SoldQuantityByYearResponse {
    year: number;
    quantity: number;
}
export interface SellingProductsResponse {
    id: number;
    imgUrl: String;
    productName: String;
    soldQuantity: number;
    percentage: number;
    orderDate: String;
}
export interface CustomStatisticalResponse{
    totalRevenue : number;
    totalSoldQuantity : number;
    completedOrders : number;
    cancelledOrders : number;
    returnedOrders : number;
}


