import type { ProductRequest, ProductApiResponse, ProductResponse } from "../model/product";
import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/admin/product";
const axiosInstance = axios.create();
interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
export const ProductService = {


  addProduct: async (productRequest: ProductRequest, parentUploadedFiles: File[], variantUploadedFiles: File[][]): Promise<string> => {
    try {
      console.log("Create Product Request:", productRequest);

      const formData = new FormData();
      const requests = [productRequest];

      // Gửi products dưới dạng chuỗi JSON (không chứa parentImages và images)
      formData.append("products", JSON.stringify(requests));

      // Thêm parentImages
      if (parentUploadedFiles && parentUploadedFiles.length > 0) {
        parentUploadedFiles.forEach((file) => {
          formData.append("parentImages", file, file.name);
        });
      }

      // Thêm images (ảnh của các biến thể)
      if (variantUploadedFiles && variantUploadedFiles.length > 0) {
        variantUploadedFiles.forEach((files) => {
          files.forEach((file) => {
            formData.append("images", file, file.name);
          });
        });
      }

      // Log kiểm tra dữ liệu gửi đi
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      // Gửi API với fetch để đảm bảo xử lý FormData đúng
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to add product: ${errorResponse.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Create Product Response:", data);
      return data.message;
    } catch (error) {
      console.error("Unexpected Error:", error);
      throw new Error("Không thể tạo sản phẩm. Vui lòng thử lại sau.");
    }
  },

  getAllParentProducts: async():  Promise<ProductResponse[]> => {
        try {
          const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(`${API_URL}/parent`);
          if(!response.data.status){
            throw new Error(response.data.message || "không thể lấy được danh sách sản phẩm cha")
          }
          console.log("Get All Parent Products Response:", response.data);
            return response.data.data || [];
          
        } catch (error) {
              console.error("Get All Parent Products Error:", error);
              throw new Error("Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.");
        }

  },

  
    getAllProducts: async (page: number = 0, size: number = 2): Promise<ProductApiResponse> => {
        try {
            const response = await axiosInstance.get<ProductApiResponse>(`${API_URL}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products. Please try again later.');
        }
    },


    getProductById: async (id: number): Promise<ProductResponse> => {
        try {
            const response = await axiosInstance.get<ProductResponse>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw new Error('Failed to fetch product details.');
        }
    },

    searchProducts: async (
        page: number = 0,
        size: number = 5,
        filters: {
            name?: string;
            sportType?: string;
            supplierName?: string;
            categoryName?: string;
            minPrice?: number;
            maxPrice?: number;
        }
    ): Promise<ProductApiResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
            });

            // Thêm các tham số filter nếu có
            if (filters.name) params.append('name', filters.name);
            if (filters.sportType) params.append('sportType', filters.sportType);
            if (filters.supplierName) params.append('supplierName', filters.supplierName);
            if (filters.categoryName) params.append('categoryName', filters.categoryName);
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

            const response = await axiosInstance.get<ProductApiResponse>(`${API_URL}/search?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products. Please try again later.');
        }
    },

    // addProduct: async (productRequest: ProductRequest): Promise<ProductResponse> => {
    //     try {
    //         // Log request for debugging
    //         console.log('Create Product Request:', productRequest);

    //         // Ensure arrays are initialized
    //         const cleanedRequest = {
    //             ...productRequest,
    //             productImageIds: productRequest.productImageIds || [],
    //             productAttributeValues: (productRequest.productAttributeValues || [])
    //                 .filter(attr => attr.attributeId !== 0 && attr.value?.trim())
    //         };

    //         const response = await axiosInstance.post<ProductResponse>(API_URL, cleanedRequest);
            
    //         // Log response for debugging
    //         console.log('Create Product Response:', response.data);
            
    //         return response.data;
    //     } catch (error) {
    //         if (axios.isAxiosError(error) && error.response) {
    //             console.error('Create Product Error Details:', {
    //                 status: error.response?.status,
    //                 data: error.response?.data,
    //                 message: error.message
    //             });

    //             // Handle specific error cases
    //             if (error.response?.status === 400) {
    //                 throw new Error(`Invalid data: ${error.response.data?.message || 'Please check your input'}`);
    //             }
    //             throw new Error(`Failed to create product: ${error.response.data?.message || error.message}`);
    //         }
    //         throw new Error('Failed to create product. Please try again later.');
    //     }
    // },

    // Update product
    // updateProduct: async (id: number, productRequest: ProductRequest): Promise<ProductResponse> => {
    //     try {
    //         // Log request để debug
    //         console.log('Update Product Request:', {
    //             id,
    //             productRequest: {
    //                 ...productRequest,
    //                 productImageIds: productRequest.productImageIds || []
    //             }
    //         });

    //         // Đảm bảo productImageIds là một mảng và không chứa ID = 0
    //         const cleanedRequest = {
    //             ...productRequest,
    //             productImageIds: (productRequest.productImageIds || []).filter(id => id !== 0),
    //             productAttributeValues: (productRequest.productAttributeValues || [])
    //                 .filter(attr => attr.attributeId !== 0 && attr.value?.trim())
    //         };

    //         const response = await axiosInstance.put<ProductResponse>(
    //             `${API_URL}/${id}`, 
    //             cleanedRequest
    //         );

    //         // Log response để debug
    //         console.log('Update Product Response:', response.data);

    //         return response.data;
    //     } catch (error) {
    //         if (axios.isAxiosError(error)) {
    //             console.error('Update Product Error Details:', {
    //                 status: error.response?.status,
    //                 data: error.response?.data,
    //                 message: error.message
    //             });

    //             // Xử lý các trường hợp lỗi cụ thể
    //             if (error.response?.status === 400) {
    //                 throw new Error(`Lỗi dữ liệu không hợp lệ: ${error.response.data?.message || 'Vui lòng kiểm tra lại thông tin'}`);
    //             }
    //             if (error.response?.status === 404) {
    //                 throw new Error('Không tìm thấy sản phẩm để cập nhật');
    //             }
    //             if (error.response?.data?.message) {
    //                 throw new Error(`Lỗi cập nhật: ${error.response.data.message}`);
    //             }
    //         }
    //         throw new Error('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
    //     }
    // },

    // Delete multiple products
    deleteProducts: async (ids: number[]): Promise<void> => {
        try {
            await axiosInstance.delete(API_URL, { data: ids });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to delete products: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to delete products. Please try again later.');
        }
    }
    ,

    getProductsByParentId: async (parentId: number): Promise<ProductResponse[]> => {
        try {
            const response = await axiosInstance.get<ProductResponse[]>(`${API_URL}/parent/${parentId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(`Failed to fetch products: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to fetch products. Please try again later.');
        }
    }



};


