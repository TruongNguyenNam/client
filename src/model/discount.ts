export interface DiscountRequest {
  name: string;
  percentValue: number;
  startDate: string; // ISO string, ví dụ: "2025-05-18T18:00:00"
  endDate: string;
  categoryId: number[]; 
  priceThreshold: number;
  applyToAll: boolean;
  productIds: number[];
}


export interface DiscountResponse {
  id: number;
  name: string;
  discountPercentage: string; 
  countProduct: number;
  status: string;
  startDate: string; 
  endDate: string;
}

