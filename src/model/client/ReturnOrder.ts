export interface ReturnOrderResponse {
  oderId:number;
    code: string;
    status: string;
    orderDate: Date;
    orderTotal: number;
    productResponses: ReturnProductResponse[];
}

export interface ReturnProductResponse {
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string;
    attributes: { [key: string]: string }; 
}
export interface ReturnOrderDetailResponse {
  oderId:number;
  code: string;
  orderDate: Date;
  status: string;
  paymentMethod: string;
  shippingMethod?: string | null;
  shippingFee?: number | null;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note?: string | null;
  totalAmount: number;
  productDetails: ReturnProductResponse[];
}
export interface ReturnRequestItemResponse {
  orderItemId: number;
  quantity: number;
  reason: string;
  note: string;
  status: string; // ví dụ: "PENDING", "APPROVED", "REJECTED"
}
export interface ReturnRequestResponse {
  orderId: number;
  userId: number;
  note: string;
  requestDate: Date;
  items: ReturnRequestItemResponse[];
}
export interface ReturnRequestItemRequest {
  orderItemId: number;
  quantity: number;
  reason: string;
  note: string;
}
export interface ReturnRequestRequest {
  orderId: number;
  note: string;
  requestDate: Date; // ISO string (e.g., 2025-07-01T10:00:00)
  items: ReturnRequestItemRequest[];
}


