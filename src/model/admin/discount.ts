export interface DiscountRequest {
  name: string;
  percentValue: number;
  startDate: string; // ISO string, ví dụ: "2025-05-18T18:00:00"
  endDate: string;
  priceThreshold: number;
  applyToAll: boolean;
  productIds: number[];
}


export interface DiscountResponse {
  id: number;
  name: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  categoryIds?: number[]; // nếu có
  priceThreshold?: number; // ✅ thêm dòng này
  applyToAll?: boolean;
  productResponses?: { id: number; name: string; price: number }[];
}


