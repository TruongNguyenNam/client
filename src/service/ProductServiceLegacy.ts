import type { ProductRequest, ProductResponse,ProductUpdateChild,ProductUpdateParent } from "../model/product";
import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
const API_URL = "http://localhost:8080/api/v1/admin/product";
const axiosInstance = axios.create();
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

  getAllChildProducts: async (): Promise<ProductResponse[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductResponse[]>>(`${API_URL}/child`);
      if (!response.data.status) {
        throw new Error(response.data.message || "Không thể lấy được danh sách sản phẩm con");
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Get All Child Products Error:", error);
      throw new Error("Không thể lấy danh sách sản phẩm con. Vui lòng thử lại sau.");
    }
  },

  updateParentProduct: async (id: number, productRequest: ProductUpdateParent, parentImages: File[]): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("product", JSON.stringify(productRequest));

      if (parentImages && parentImages.length > 0) {
        parentImages.forEach((file) => {
          formData.append("parentImages", file, file.name);
        });
      }

      const response = await fetch(`${API_URL}/parent/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Cập nhật sản phẩm cha thất bại');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Update Parent Product Error:", error);
      throw new Error("Không thể cập nhật sản phẩm cha. Vui lòng thử lại sau.");
    }
  },

  updateChildProduct: async (id: number, productRequest: ProductUpdateChild, variantImages: File[]): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("product", JSON.stringify(productRequest));

      if (variantImages && variantImages.length > 0) {
        variantImages.forEach((file) => {
          formData.append("images", file, file.name);
        });
      }

      const response = await fetch(`${API_URL}/child/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Cập nhật biến thể thất bại');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Update Child Product Error:", error);
      throw new Error("Không thể cập nhật biến thể. Vui lòng thử lại sau.");
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


