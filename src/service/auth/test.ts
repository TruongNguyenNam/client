// src/service/auth/AuthService.ts
import axios from 'axios';
import type { ApiResponse } from '../../utils/ApiResponse';

const API_URL = 'http://localhost:8080/api/v1/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken'); 
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthService = {
  Login: async (loginForm: LoginForm): Promise<ApiResponse<LoginInfoDto>> => {
    const response = await axiosInstance.post<ApiResponse<LoginInfoDto>>('/login', loginForm);
    return response.data;
  },

  RefreshToken: async (refreshToken: string): Promise<ApiResponse<TokenDTO>> => {
    const response = await axiosInstance.get<ApiResponse<TokenDTO>>('/refreshToken', {
      params: { refreshToken },
    });
    return response.data;
  },

  Register: async (registerForm: RegisterForm): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>('/register', registerForm);
    return response.data;
  },

  findByUserId: async(id:number): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>(`${API_URL}/${id}`);
      return response.data;
  },
  updateUserAddress: async (userId: number, data: UpdateUserForm): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.put<ApiResponse<UserResponse>>(`${API_URL}/${userId}/address`, data);
    return response.data;
  }

};

// DTOs
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  email: string;
}

export interface LoginInfoDto {
  id: number;
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  token: string;
  refreshToken: string;
  role: string;
  gender: string;
  isActive: boolean;
  address: UserAddress | null;
}

export interface UserAddress {
  id: number;
  addressStreet: string;
  addressWard: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressZipcode: string;
  addressDistrict: string;
  addressProvince: string;
}


export interface TokenDTO {
  token: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  message: string;
  role: string;
  password: string;
  phoneNumber: string | null; // Cho phép null
  gender: string | null; // Cho phép null
  isActive: boolean;
  address: UserAddress | null;
}


export interface UpdateUserForm {
  email: string;
  phoneNumber: string;
  gender: string;
  address: UserAddress;
}


