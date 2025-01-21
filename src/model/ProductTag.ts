import type { ApiResponse } from "./apiResponse";

export interface ProductTagRequest{
    name: string;
}

export interface ProductTagResponse{
    id: number;
    name:string;
}

export interface ProductTagApiResponse extends ApiResponse<ProductTagResponse>{}















