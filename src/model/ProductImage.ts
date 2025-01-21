import type { ApiResponse } from "./apiResponse";
export interface ProductImageRequest {
    productId: number;
    imageUrl: string;
}

export interface ProductImageResponse {
    id: number;
    productName: string;
    imageUrl: string;
}

export interface ProductImageApiResponse extends ApiResponse<ProductImageResponse> {}


