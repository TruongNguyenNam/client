
export interface CouponRequest {
    couponName: string;
    quantity: number;
    discountAmount: number;
    expirationDate: string | null;
    startDate: string | null;

}


export interface CouponUpdateRequest extends CouponRequest {
    couponStatus: string;
}

export interface CouponResponse {
    id: number;
    couponName: string;
    codeCoupon: string; 
    usedCount?: number; 
    quantity: number;
    discountAmount: number;
    expirationDate: string | null;
    startDate: string | null;
    couponStatus: string;
    deleted: boolean;
}