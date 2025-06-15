export interface ProductResponseClient {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    stockQuantity: number;
    parentProductId: number | null;
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