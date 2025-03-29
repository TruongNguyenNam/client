import type { ApiResponse } from "./apiResponse";

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
    images?: File[]; // Hỗ trợ nhiều ảnh
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number | null;
    stockQuantity: number | null;
    sportType: string;
    sku: string;
    supplierName: string; // Changed from supplierId to supplierName
    categoryName: string; // Changed from categoryId to categoryName
    productAttributeValueResponses: ProductAttributeValueResponse[];
    tagName: string[]; // Changed from tagId to tagName
    imageUrl: string[]; // Changed ImageUrl to imageUrl
    inventories: InventoryResponse[]; // Added inventories
}

export interface ProductAttributeValueResponse {
    id: number;
    attributeName: string; // Changed from attributeId to attributeName
    productId: number;
    value: string;
}

export interface InventoryResponse {
    id: number;
    productName: string;
    stockQuantity: string; // Changed from stockQuantity: number to stockQuantity: string
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



// export interface ProductApiResponse extends ApiResponse<ProductResponse> {}