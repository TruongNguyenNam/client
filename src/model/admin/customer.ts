import type { AddressRequest,AddressResponse } from "./address";

export interface CustomerResponse {
  id: number;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  addresses: AddressResponse[];
  active: boolean;          // Trạng thái hoạt động
  gender: string;             // Giới tính (MALE/FEMALE/OTHER)
}

export interface CustomerRequest {
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  active?: boolean;
  gender: string;
  address?: AddressRequest;
}

export type Gender = "MALE" | "FEMALE";