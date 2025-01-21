import type { ApiResponse } from "./apiResponse";

export interface CategoryRequest {
    name: string;
    description: string;
}

export interface CategoryResponse{
    id: number;
    name: string;
    description: string;
}

export interface CategoryApiResponse extends ApiResponse<CategoryResponse> {}