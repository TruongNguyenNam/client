export interface ShoppingCartRequest {
    userId: number;
    productId: number;
    quantity: number;
    // totalPrice: number;
    // deleted: boolean;
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
    ImageUrl: string[];
  }
  
  export interface ProductAttributeValueResponse {
    id: number;
    attributeId: number;
    attributeName: string;
    productId: number;
    value: string;
  }
  