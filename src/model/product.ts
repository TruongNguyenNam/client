import type { ApiResponse } from "./apiResponse";

export interface ProductRequest {
    name: string;
    description: string;
    price: number | null; 
    stockQuantity: number | null; 
    sportType: string;
    sku: string;
    supplierId: number | null; 
    categoryId: number | null; 
    tagId: number[];
    productAttributeValues: ProductAttributeValue[]; 
    productImageIds: number[]; 
    inventoryIds: number[]; 
}

export interface ProductAttributeValue {
    attributeId: number;
    value: string;
}


export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number | null; // Changed to match Double
    stockQuantity: number | null; // Changed to match Integer
    sportType: string;
    sku: string;
    supplierName: string;
    categoryName: string;
    sportTypeName: string[]; // Added new property
    productAttributeValueResponses: ProductAttributeValueResponse[]; // Changed type
    tagName: string[]; 
    imageUrl: string[]; // Changed to lowercase 'u'
    inventories: InventoryResponse[]; // Added new property
}

export interface ProductAttributeValueResponse {
    id: number; // Changed to Long
    attributeName: string; // Added new property
    productId: number; // Changed to Long
    value: string;
}

export interface InventoryResponse {
    id: number; // Changed to Long
    productName: string; // Added new property
    stockQuantity: string; // Changed to String
}

export interface ProductApiResponse extends ApiResponse<ProductResponse> {}

