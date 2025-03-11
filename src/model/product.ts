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
    parentImages: File[]; // Thay productImageIds
    inventoryIds: number[];
}

export interface ProductAttributeValue {
    attributeId: number;
    value: string;
    variantImages: File[]; // Thêm variantImages
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number | null;
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
    attributeName: string;
    productId: number;
    value: string;
}

export interface InventoryResponse {
    id: number;
    productName: string;
    stockQuantity: string;
}

export interface ProductApiResponse extends ApiResponse<ProductResponse> {}

