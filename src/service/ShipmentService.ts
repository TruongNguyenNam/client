import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { ShipmentResponse } from './../model/shipment';

const API_URL = "http://localhost:8080/api/v1/admin/shipment";
const axiosInstance = axios.create();

export const ShipmentService = {
    getAllshipment: async (): Promise<ApiResponse<ShipmentResponse[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ShipmentResponse[]>>(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all shipment:', error);
            throw new Error('Failed to fetch shipment. Please try again later.');
        }
    },

};