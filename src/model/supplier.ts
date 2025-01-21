
import type { ApiResponse } from "./apiResponse";
export interface SupplierRequest {
    name: string;
    description: string;
}

export interface SupplierResponse{
    id: number;
    name: string;
    description: string;
}


export interface SuppliersApiResponse extends ApiResponse<SupplierResponse> {}








