export interface ProductReviewRequestClient {
    productId: number;
    userId: number;
    rating: number;
    imageUrl?: string;       // optional nếu có thể null
    reviewText?: string;     // optional nếu có thể null
  }
  export interface ProductReviewResponseClient {
    id: number;
    productName: string;
    userName: string;
    rating: number;
    imageUrl?: string;       // optional nếu có thể null
    reviewText?: string;     // optional nếu có thể null
    deleted: boolean;
  }
  