import type { ApiResponse } from "../apiResponse";

export interface ProductRequest {
    name: string;
    description: string;
    sportType: string;
    sku: string;
    supplierId: number | null;
    categoryId: number | null;
    productAttributeValues: ProductAttributeValue[];
    variants: ProductVariant[];
    tagId: number[];
    parentImages?: File[];
    inventoryIds?: number[];
}

export interface ProductAttributeValue {
    attributeId: number;
    value: string;
    variantImages?: File[];
    price?: number;
    stockQuantity?: number;
}

export interface ProductVariant {
    price?: number;
    stockQuantity?: number;
    images?: File[]; 
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number | null;
    originalPrice : number | null;
    stockQuantity: number | null;
    sportType: string;
    sku: string;
    supplierName: string; 
    categoryName: string; 
    productAttributeValueResponses: ProductAttributeValueResponse[];
    tagName: string[]; 
    imageUrl: string[]; 
    inventories: InventoryResponse[];
}







export interface ProductAttributeValueResponse {
    id: number;
    attributeId: number;
    attributeName: string; 
    productId: number;
    value: string;
}

export interface InventoryResponse {
    id: number;
    productName: string;
    stockQuantity: string; 
}

export interface ProductUpdateChild {
    name: string;
    description: string;
    sportType: string;
    sku: string;
    price?: number;
    stockQuantity?: number;
    supplierId: number;
    categoryId: number;
    tagId: number[];
    productAttributeValues: ProductAttributeValueUpdate[];
    images?: File[];

}

interface ProductAttributeValueUpdate {
    attributeId: number;
    value: string;
}

export interface ProductUpdateParent {
    name: string;
    description: string;
    sportType: string;
    sku: string;
    supplierId: number; // Changed from Long to number for TypeScript compatibility
    categoryId: number; // Changed from Long to number for TypeScript compatibility
    tagId: number[]; // Changed from List<Long> to number[] for TypeScript compatibility
    parentImages?: File[]; // Changed from List<MultipartFile> to File[] for TypeScript compatibility
}


export interface AddProductChild {
    parentProductId: number;
    productAttributeValues: ProductAttributeValue[];
    variants: ProductVariant[];
}


export interface VariantCountDTO {
    parentProductId: number;
    variantCount: number;
  }
  



  




// export interface ProductApiResponse extends ApiResponse<ProductResponse> {}