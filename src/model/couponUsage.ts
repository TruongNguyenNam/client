export interface CouponUsageResponse {
    id: number;
    userUserName: string;
    userRole: string;
    couponCode: string; 
    couponDiscountAmount: number;
    couponStatus: string;
    usedDate: Date;
}
