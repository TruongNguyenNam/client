import type { ApiResponse } from "./apiResponse";

export interface ProductTagRequest{
    name: string;
    description: string;
}

export interface ProductTagResponse{
    id: number;
    name:string;
    description: string;
}

// export interface ProductTagApiResponse extends ApiResponse<ProductTagResponse>{}















