import type { ProductRequest, ProductResponse,ProductUpdateChild,ProductUpdateParent,AddProductChild} from "../../model/admin/product";
import axios from 'axios';
import type { ApiResponse } from "../../utils/ApiResponse";         
const API_URL = "http://localhost:8080/api/v1/admin/product";
const axiosInstance = axios.create();

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
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
export const ProductService = {

  
  getAllParentProducts: async (): Promise<ProductResponse[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(`${API_URL}/parent`);
      if (!response.data.status) {
        throw new Error(response.data.message || "Không thể lấy được danh sách sản phẩm cha");
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Get All Parent Products Error:", error);
      throw new Error("Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.");
    }
  },

  addVariantsToProduct: async (
    parentProductId: number,
    request: AddProductChild,
    variantImages: File[]
  ): Promise<ApiResponse<void>> => {
    try {
      // Kiểm tra parentProductId
      if (!parentProductId || isNaN(parentProductId)) {
        console.error("Invalid parentProductId:", parentProductId);
        throw new Error("ID sản phẩm cha không hợp lệ");
      }

      // Tạo bản sao của request và loại bỏ images
      const sanitizedRequest: AddProductChild = {
        ...request,
        variants: request.variants.map(variant => ({
          price: variant.price,
          stockQuantity: variant.stockQuantity,
        })),
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(sanitizedRequest));

      if (variantImages && variantImages.length > 0) {
        variantImages.forEach((file) => {
          formData.append('variantImages', file);
        });
      }

      // Log kiểm tra dữ liệu
      console.log("Sending FormData for addVariantsToProduct:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await fetch(`${API_URL}/${parentProductId}/variants`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend Error Response:", data);
        throw new Error(data.message || `Request failed with status code ${response.status}`);
      }

      console.log("Backend Success Response:", data);
      return {
        status: response.status,
        message: data.message || 'Thêm biến thể sản phẩm thành công',
        data: undefined,
      };
    } catch (error: any) {
      console.error("Add Variants Error:", error);
      throw error; // Ném lỗi gốc để giữ thông điệp từ backend
    }
  },


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
  
      // Gửi API với fetch
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        // Kiểm tra Content-Type của phản hồi
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Unknown error';
  
        if (contentType && contentType.includes('application/json')) {
          // Nếu phản hồi là JSON
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || 'Unknown error';
        } else {
          // Nếu phản hồi là text (như trường hợp ErrorException)
          errorMessage = await response.text();
        }
  
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log("Create Product Response:", data);
      return data.message;
    } catch (error) {
      console.error("Unexpected Error:", error);
      throw error; // Ném lại lỗi để submitProduct xử lý
    }
  },


  getAllChildProducts: async (): Promise<ApiResponse<ProductResponse[]>> => {
    try {
        const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(`${API_URL}/child`);
        return response.data; 
    } catch (error) {
        console.error("Get All Child Products Error:", error);
        throw new Error("Không thể lấy danh sách sản phẩm con. Vui lòng thử lại sau.");
    }
  },


  updateParentProduct: async (id: number, formData: FormData): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/parent/${id}`, {
        method: 'PUT',
        body: formData
        // Note: Don't set Content-Type header, let browser set it automatically
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật sản phẩm cha thất bại');
      }
  
      return data.message;
    } catch (error) {
      console.error("Update Parent Product Error:", error);
      throw error; // Re-throw to handle in component
    }
  },

  updateChildProduct: async (
  childId: number,
  childProduct: ProductUpdateChild,
  images: File[]
): Promise<ProductResponse> => {
  const formData = new FormData();

  const payload = {
    description: childProduct.description,
    price: childProduct.price,
    stockQuantity: childProduct.stockQuantity,
    productAttributeValues: childProduct.productAttributeValues,
  };

  formData.append('product', JSON.stringify(payload));
  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await fetch(`${API_URL}/child/${childId}`, {
    method: 'PUT',
    body: formData,
  });

  const responseData = await response.json(); // 👈 luôn parse JSON dù response.ok hay không

  if (!response.ok) {
    // Ném lỗi chi tiết để frontend xử lý được
    const error = new Error(responseData.message || 'Lỗi hệ thống') as Error & {
      status?: number;
      data?: any;
    };
    error.status = response.status;
    error.data = responseData.data;
    throw error;
  }

  return responseData.data || {};
  },


  searchProducts: async (
    name?: string,
    minPrice?: number,
    maxPrice?: number,
    sportType?: string,
    supplierName?: string,
    categoryName?: string
  ): Promise<ProductResponse[]> => {
    try {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (minPrice) params.append('minPrice', minPrice.toString());
      if (maxPrice) params.append('maxPrice', maxPrice.toString());
      if (sportType) params.append('sportType', sportType);
      if (supplierName) params.append('supplierName', supplierName);
      if (categoryName) params.append('categoryName', categoryName);

      const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(
        `${API_URL}/searchg?${params.toString()}`
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Tìm kiếm sản phẩm thất bại");
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Search Products Error:", error);
      throw new Error("Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.");
    }
  },

  getProductById: async (id: number): Promise<ProductResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductResponse>>(`${API_URL}/${id}`);
      if (!response.data.status || !response.data.data) {
        throw new Error(response.data.message || "Không tìm thấy sản phẩm");
      }
      return response.data.data;
    } catch (error) {
      console.error("Get Product By ID Error:", error);
      throw new Error("Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.");
    }
  },

  getProductsByParentId: async (parentId: number): Promise<ProductResponse[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(
        `${API_URL}/parent/${parentId}`
      );
      if (!response.data.status) {
        throw new Error(response.data.message || "Không tìm thấy sản phẩm con");
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Get Products By Parent ID Error:", error);
      throw new Error("Không thể lấy danh sách sản phẩm con. Vui lòng thử lại sau.");
    }
  },

  deleteProduct: async (id: number): Promise<string> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`${API_URL}/${id}`);
      if (!response.data.status) {
        throw new Error(response.data.message || "Xóa sản phẩm thất bại");
      }
      return response.data.message || "Xóa sản phẩm thành công";
    } catch (error) {
      console.error("Delete Product Error:", error);
      throw new Error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    }
  }
  



};


