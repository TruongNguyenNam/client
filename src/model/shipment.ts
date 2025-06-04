export interface ShipmentResponse {
    id: number;
    trackingNumber: string;
    shipmentDate: string;          // ISO 8601 string (e.g. "2025-05-15T10:00:00Z")
    shipmentStatus: string;
    carrier: string;
    estimatedDeliveryDate: string; // ISO 8601 string
  }
  