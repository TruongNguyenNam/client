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
    console.log(token)
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

  // addVariantsToProduct: async (
  //   parentProductId: number,
  //   request: AddProductChild,
  //   variantImages: File[]
  // ): Promise<ApiResponse<void>> => {
  //   try {
  //     // Kiểm tra parentProductId
  //     if (!parentProductId || isNaN(parentProductId)) {
  //       console.error("Invalid parentProductId:", parentProductId);
  //       throw new Error("ID sản phẩm cha không hợp lệ");
  //     }

  //     // Tạo bản sao của request và loại bỏ images
  //     const sanitizedRequest: AddProductChild = {
  //       ...request,
  //       variants: request.variants.map(variant => ({
  //         price: variant.price,
  //         stockQuantity: variant.stockQuantity,
  //       })),
  //     };

  //     const formData = new FormData();
  //     formData.append('request', JSON.stringify(sanitizedRequest));

  //     if (variantImages && variantImages.length > 0) {
  //       variantImages.forEach((file) => {
  //         formData.append('variantImages', file);
  //       });
  //     }

  //     // Log kiểm tra dữ liệu
  //     console.log("Sending FormData for addVariantsToProduct:");
  //     for (const [key, value] of formData.entries()) {
  //       console.log(`${key}: ${value instanceof File ? value.name : value}`);
  //     }

  //     const response = await fetch(`${API_URL}/${parentProductId}/variants`, {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       console.error("Backend Error Response:", data);
  //       throw new Error(data.message || `Request failed with status code ${response.status}`);
  //     }

  //     console.log("Backend Success Response:", data);
  //     return {
  //       status: response.status,
  //       message: data.message || 'Thêm biến thể sản phẩm thành công',
  //       data: undefined,
  //     };
  //   } catch (error: any) {
  //     console.error("Add Variants Error:", error);
  //     throw error; // Ném lỗi gốc để giữ thông điệp từ backend
  //   }
  // },

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

      const response = await axiosInstance.post<ApiResponse<void>>(`${API_URL}/${parentProductId}/variants`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Backend Success Response:", response.data);
      return {
        status: response.status,
        message: response.data.message || 'Thêm biến thể sản phẩm thành công',
        data: undefined,
      };
    } catch (error: any) {
      console.error("Add Variants Error:", error);
      // Kiểm tra nếu lỗi từ response của backend
      if (error.response?.data) {
        console.error("Backend Error Response:", error.response.data);
        throw new Error(error.response.data.message || `Request failed with status code ${error.response.status}`);
      }
      // Lỗi khác (mạng, timeout, v.v.)
      throw new Error(error.message || "Không thể thêm biến thể sản phẩm. Vui lòng thử lại sau.");
    }
  },

  addProduct: async (
    productRequest: ProductRequest,
    parentUploadedFiles: File[],
    variantUploadedFiles: File[][]
  ): Promise<string> => {
    try {
      console.log("Create Product Request:", productRequest);

      const formData = new FormData();
      const requests = [productRequest];
      formData.append("products", JSON.stringify(requests));

      if (parentUploadedFiles && parentUploadedFiles.length > 0) {
        parentUploadedFiles.forEach((file) => {
          formData.append("parentImages", file, file.name);
        });
      }

      if (variantUploadedFiles && variantUploadedFiles.length > 0) {
        variantUploadedFiles.forEach((files) => {
          files.forEach((file) => {
            formData.append("images", file, file.name);
          });
        });
      }

      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await axiosInstance.post<ApiResponse<string>>(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Create Product Response:", response.data);
      return response.data.message || "Thêm sản phẩm thành công";
    } catch (error: any) {
      console.error("Unexpected Error:", error);
      if (error.response) {
        const errorMessage = error.response.data.message || 'Lỗi không xác định';
        throw new Error(errorMessage);
      } else {
        throw new Error(error.message || 'Thêm sản phẩm thất bại');
      }
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

  //   try {
  //     const response = await fetch(`${API_URL}/parent/${id}`, {
  //       method: 'PUT',
  //       body: formData
  //       // Note: Don't set Content-Type header, let browser set it automatically
  //     });
  
  //     const data = await response.json();
      
  //     if (!response.ok) {
  //       throw new Error(data.message || 'Cập nhật sản phẩm cha thất bại');
  //     }
  
  //     return data.message;
  //   } catch (error) {
  //     console.error("Update Parent Product Error:", error);
  //     throw error; // Re-throw to handle in component
  //   }
  // },

  updateParentProduct: async (id: number, formData: FormData): Promise<string> => {
    try {
      console.log("FormData entries for updateParentProduct:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await axiosInstance.put<ApiResponse<string>>(
        `${API_URL}/parent/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Update Parent Product Response:", response.data);
      return response.data.message || "Cập nhật sản phẩm cha thành công";
    } catch (error: any) {
      console.error("Update Parent Product Error:", error);
      throw new Error(error.response?.data?.message || 'Cập nhật sản phẩm cha thất bại');
    }
  },

  updateChildProduct: async (
    childId: number,
    childProduct: ProductUpdateChild,
    images: File[]
  ): Promise<string> => {
    try {
      const formData = new FormData();
      const payload = {
        description: childProduct.description,
        price: childProduct.price,
        stockQuantity: childProduct.stockQuantity,
        productAttributeValues: childProduct.productAttributeValues,
      };
  
      formData.append('product', JSON.stringify(payload));
      if (images.length > 0 && !images.every((image) => image instanceof File)) {
        throw new Error('Một hoặc nhiều hình ảnh không hợp lệ');
      }
      images.forEach((image) => {
        formData.append('images', image);
      });
  
      console.log("FormData entries for updateChildProduct:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }
  
      const response = await axiosInstance.put<ApiResponse<string>>(
        `${API_URL}/child/${childId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log("Update Child Product Response:", JSON.stringify(response.data, null, 2));
  
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Cập nhật sản phẩm con thất bại');
      }
  
      return response.data.message || 'Cập nhật sản phẩm con thành công';
    } catch (error: any) {
      console.error("Update Child Product Error:", error);
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm con');
    }
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


