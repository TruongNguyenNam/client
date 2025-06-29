export interface WishlistRequest {
    userId: number;
    productId: number;
    addedDate: Date;
    deleted: boolean;
  }

  
  export interface WishlistResponse {
    id: number;
    userName: string;
    product: Product[];
    addedDate: Date;
    deleted: boolean;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    parentProductId:number;
    originalPrice: number;
    stockQuantity: number;
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
  











