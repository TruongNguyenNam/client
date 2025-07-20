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
  bankAccountNumber:string;
  bankAccountName:string;
  bankName:string
  items: ReturnRequestItemResponse[];
  returnMediaResponses:returnMediaResponses[]

}
export interface ReturnRequestItemRequest {
  mediaRequests:ReturnMediaRequest[]
  orderItemId: number;
  quantity: number;
  reason: string;
  note: string;
}
export interface ReturnRequestRequest {
  orderId: number;
  note: string;
  requestDate: Date; 
  bankAccountNumber:string;
  bankAccountName:string;
  bankName:string
  items: ReturnRequestItemRequest[];
}

export interface returnMediaResponses {
  returnRequestItemId: number;
  url: string;
  type: string; 

}
export interface ReturnMediaRequest {


  type: string; 
  fileName:string

}
export interface returnHistoryResponse{
  code:string,
  requestDate:Date,
  bankAccountName:String,
  bankAccountNumber:String,
  bankName:string,
  note:string,
  totalProduct:number
  thumbnailUrl:string
}
export interface returnHistoryItemResponse{
  productName:string
  imageProduct:string
  quantity:number
  reason:string
  note:string
  status:string
  unitPrice:number
  totalRefundAmount:number
  attributes: { [key: string]: string }; 
}


