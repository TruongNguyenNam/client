// // addVariantsToProduct: async (
// //     parentProductId: number,
// //     request: AddProductChild,
// //     variantImages: File[]
// //   ): Promise<ApiResponse<void>> => {
// //     try {
// //       // Kiểm tra parentProductId
// //       if (!parentProductId || isNaN(parentProductId)) {
// //         console.error("Invalid parentProductId:", parentProductId);
// //         throw new Error("ID sản phẩm cha không hợp lệ");
// //       }

// //       // Tạo bản sao của request và loại bỏ images
// //       const sanitizedRequest: AddProductChild = {
// //         ...request,
// //         variants: request.variants.map(variant => ({
// //           price: variant.price,
// //           stockQuantity: variant.stockQuantity,
// //         })),
// //       };

// //       const formData = new FormData();
// //       formData.append('request', JSON.stringify(sanitizedRequest));

// //       if (variantImages && variantImages.length > 0) {
// //         variantImages.forEach((file) => {
// //           formData.append('variantImages', file);
// //         });
// //       }

// //       // Log kiểm tra dữ liệu
// //       console.log("Sending FormData for addVariantsToProduct:");
// //       for (const [key, value] of formData.entries()) {
// //         console.log(`${key}: ${value instanceof File ? value.name : value}`);
// //       }

// //       const response = await fetch(`${API_URL}/${parentProductId}/variants`, {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         console.error("Backend Error Response:", data);
// //         throw new Error(data.message || `Request failed with status code ${response.status}`);
// //       }

// //       console.log("Backend Success Response:", data);
// //       return {
// //         status: response.status,
// //         message: data.message || 'Thêm biến thể sản phẩm thành công',
// //         data: undefined,
// //       };
// //     } catch (error: any) {
// //       console.error("Add Variants Error:", error);
// //       throw error; // Ném lỗi gốc để giữ thông điệp từ backend
// //     }
// //   },




// addProduct: async (productRequest: ProductRequest, parentUploadedFiles: File[], variantUploadedFiles: File[][]): Promise<string> => {
//     try {
//       console.log("Create Product Request:", productRequest);
  
//       const formData = new FormData();
//       const requests = [productRequest];
  
//       // Gửi products dưới dạng chuỗi JSON (không chứa parentImages và images)
//       formData.append("products", JSON.stringify(requests));
  
//       // Thêm parentImages
//       if (parentUploadedFiles && parentUploadedFiles.length > 0) {
//         parentUploadedFiles.forEach((file) => {
//           formData.append("parentImages", file, file.name);
//         });
//       }
  
//       // Thêm images (ảnh của các biến thể)
//       if (variantUploadedFiles && variantUploadedFiles.length > 0) {
//         variantUploadedFiles.forEach((files) => {
//           files.forEach((file) => {
//             formData.append("images", file, file.name);
//           });
//         });
//       }
  
//       // Log kiểm tra dữ liệu gửi đi
//       console.log("FormData entries:");
//       for (const [key, value] of formData.entries()) {
//         console.log(`${key}: ${value instanceof File ? value.name : value}`);
//       }
  
//       // Gửi API với fetch
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         body: formData
//       });
  
//       if (!response.ok) {
//         // Kiểm tra Content-Type của phản hồi
//         const contentType = response.headers.get('content-type');
//         let errorMessage = 'Unknown error';
  
//         if (contentType && contentType.includes('application/json')) {
//           // Nếu phản hồi là JSON
//           const errorResponse = await response.json();
//           errorMessage = errorResponse.message || 'Unknown error';
//         } else {
//           // Nếu phản hồi là text (như trường hợp ErrorException)
//           errorMessage = await response.text();
//         }
  
//         throw new Error(errorMessage);
//       }
  
//       const data = await response.json();
//       console.log("Create Product Response:", data);
//       return data.message;
//     } catch (error) {
//       console.error("Unexpected Error:", error);
//       throw error; // Ném lại lỗi để submitProduct xử lý
//     }
//   },