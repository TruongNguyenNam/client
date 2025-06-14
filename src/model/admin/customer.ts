export interface CustomerResponse {
    id: number;
    email: string;
    username: string;
    phoneNumber: string;
    role: string;
    addressStreet: string;
    addressWard: string;     // Phường (Phường Phúc Đồng)
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressZipcode: string;
    addressDistrict: string; // Quận/Huyện (Huyện Vĩnh Tuy)
    addressProvince: string; // Tỉnh (Quận Long Biên)
    isActive: boolean;
    gender: string;
  }


  
