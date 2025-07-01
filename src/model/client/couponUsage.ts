export interface CouponUsageClientResponse {
    id: number;
    userUserName: string;
    userRole: string;
    couponCode: string;
    couponDiscountAmount: number;
    couponStatus: string;
    usedDate: string | null;
  }
  