export interface OrderRequest {
    id?: number;
    orderCode?: string; 
    notes?:string;
    userId?: number;  
    items?: OrderItemRequest[]; 
    payment?: PaymentRequest;   
    couponUsageIds?: number[]; 
    shipments?: ShipmentRequest[]; 
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
    carrierId?: number;
    shippingCost: number;
    estimatedDeliveryDate: string;
    orderItemIds: number[];
  }


  
  export interface OrderResponse {
    id: number;
    orderCode: string;
    notes?: string;
    address?: AddressResponse; 
    orderStatus: string;
    orderTotal: number;
    isPos: boolean;
    deleted: boolean;
    orderDate: string; 
    items: OrderItemResponse[];
    payment: PaymentResponse;
    couponUsages: CouponResponse[];
    shipments: ShipmentResponse[];
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
    paymentMethodId:number;
    amount: number;
    status: string;
    paidDate?: string; 
  }
  
  export interface AddressResponse {
    id: number;
    email: string;
    userId:number;
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
    carrierName: string;
    carrierId: number;
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




  // export interface UpdateOrderStatusRequest {
  //   newStatus: OrderStatus;
  //   nodes: string;
  // }
  
  // export enum OrderStatus {
  //   PENDING = 'PENDING',
  //   COMPLETED = 'COMPLETED',
  //   CANCELLED = 'CANCELLED',
  //   SHIPPED = 'SHIPPED',
  //   RETURNED = 'RETURNED'
  // }
  










