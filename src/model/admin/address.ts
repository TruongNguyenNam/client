export interface AddressResponse {
  id: number;
  street: string;
  ward: string;       
  city: string;
  state: string;
  country: string;
  zipcode: string;
  district: string;   
  province: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
  }
  export interface AddressRequest {
  street: string;
  ward: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  district: string;
  province: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}