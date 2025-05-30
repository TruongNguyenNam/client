export interface OrderRequest {
    id?: number;
    orderCode?: string; 
    userId?: number;  
    items?: OrderItemRequest[]; 
    payment?: PaymentRequest;   
    couponUsageIds?: number[]; 
    shipments?: ShipmentRequest[]; // Optional
  }
  
  export interface OrderItemRequest {
    productId: number;
    quantity: number;
  }
  
  export interface PaymentRequest {
    paymentMethodId: number;
    amount: number;
  }
  
  export interface ShipmentRequest {
    shipmentId?: number;
    estimatedDeliveryDate: string;
    orderItemIds: number[];
  }

  
  export interface OrderResponse {
    id: number;
    orderCode: string;
    address?: AddressResponse; 
    orderStatus: string;
    orderTotal: number;
    isPos: boolean;
    deleted: boolean;
    orderDate: string; 
    items: OrderItemResponse[];
    payment: PaymentResponse;
    couponUsages: CouponResponse[];
    shipment?: ShipmentResponse;
    createdBy: number;
    createdDate: string; 
    lastModifiedBy: number;
    lastModifiedDate: string; 
  }
  
  export interface OrderItemResponse {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface PaymentResponse {
    id: number;
    paymentMethodName: string;
    amount: number;
    status: string;
    paidDate?: string; 
  }
  
  export interface AddressResponse {
    id: number;
    email: string;
    username: string;
    phoneNumber: string;
    role: string;
    addressStreet: string;
    addressWard: string;
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressZipcode: string;
    addressDistrict: string;
    addressProvince: string;
    isActive: boolean;
  }
  
  export interface ShipmentResponse {
    id: number;
    shipmentDate: string; 
    shipmentStatus: string;
    trackingNumber: string;
    carrier: string;
    estimatedDeliveryDate: string; 
  }
  
  export interface CouponResponse {
    id: number;
    couponCode: string;
    discountAmount: number;
    usedDate: string; 
    createdBy: number;
    createdDate: string; 
    lastModifiedBy: number;
    lastModifiedDate: string;
  }


  export interface CreateInvoiceRequest {
    isPos: boolean;
  }
  










