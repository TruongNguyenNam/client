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
  username: string;
  email: string;
  token: string;
  refreshToken: string;
  role: string;
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
}