import type { AddressRequest } from "./address";

export interface CustomerResponse {
  id: number;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  addressStreet: string;
  addressWard: string;        // Phường (Phường Phúc Đồng)
  addressCity: string;        // Thành phố (Hà Nội)
  addressState: string;       // Bang/Tỉnh (nếu dùng cho nước ngoài)
  addressCountry: string;     // Quốc gia (Việt Nam)
  addressZipcode: string;     // Mã bưu điện
  addressDistrict: string;    // Quận/Huyện (Huyện Vĩnh Tuy)
  addressProvince: string;    // Tỉnh/Thành phố (Quận Long Biên)
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
  address: AddressRequest;
}
export type Gender = "MALE" | "FEMALE";