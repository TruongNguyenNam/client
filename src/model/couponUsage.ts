export interface CouponUsageRequest {
  userId: number;
  couponId: number;
  quantity?: number; 
}


export interface CouponUsageMultiRequest {
  couponId: number;
  userIds: number[];
}


export interface CouponUsageResponse {
  id: number;
  userUserName: string;
  userRole: string;
  couponCode: string;
  couponDiscountAmount: number;
  couponStatus: string;
  usedDate: string | null;
}