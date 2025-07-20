export interface ShoppingCartRequest {
    userId: number;
    productId: number;
    quantity: number;
  }

  
  export interface ShoppingCartResponse {
    id: number;
    userName: string;
    product: ShoppingCartProduct;
    quantity: number;
    totalPrice: number;
    deleted: boolean;
  }
  
  export interface ShoppingCartProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    stockQuantity: number;
    parentProductId: number;
    sportType: string;
    sku: string;
    supplierName: string;
    categoryName: string;
    productAttributeValueResponses: ProductAttributeValueResponse[];
    tagName: string[];
    imageUrl: string[];
  }
  
  export interface ProductAttributeValueResponse {
    id: number;
    attributeId: number;
    attributeName: string;
    productId: number;
    value: string;
  }



// check out

export interface OrderRequestClient {
  userId: number;
  nodes?: string;
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
  carrierId: number;
  estimatedDeliveryDate: string; 
  orderItemIds?: number[];
}



export interface OrderResponseClient {
  id: number;
  orderCode: string;
  address?: AddressResponse;
  orderStatus: string;
  orderTotal: number;
  nodes?: string;
  isPos: boolean;
  deleted: boolean;
  orderDate: string; 
  items: OrderItemResponse[];
  payment: PaymentResponse;
  couponUsages?: CouponResponse[];
  shipment?: ShipmentResponse;
  createdBy: number;
  createdDate: string;
  lastModifiedBy: number;
  lastModifiedDate: string;
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
  carrierName: string;
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

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  paymentStatus: string;
  paymentDate: string;
  changeAmount: number;
  paymentMethodName: string;
}







  