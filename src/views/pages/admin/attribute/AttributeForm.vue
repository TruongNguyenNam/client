<template>
    <div>
      <h2>Form Thêm Thuộc Tính Sản Phẩm</h2>
      <form @submit.prevent="saveProductAttribute">
        <div class="field">
          <label for="name">Tên thuộc tính</label>
          <input v-model="name" id="name" type="text" placeholder="Nhập tên thuộc tính" required />
        </div>
  
        <div class="field">
          <label for="description">Mô tả</label>
          <textarea v-model="description" id="description" placeholder="Nhập mô tả" required></textarea>
        </div>
  
        <button type="submit" class="btn-submit">Lưu thuộc tính</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { ProductAttributeService } from '../../../../service/ProductAttribueService' // Đảm bảo đường dẫn đúng
  
  // Khai báo các biến cần thiết cho form
  const name = ref('');
  const description = ref('');
  
  // Hàm lưu thuộc tính
  const saveProductAttribute = async () => {
    const productAttribute = {
      name: name.value,
      description: description.value
    };
  
    try {
      const response = await ProductAttributeService.saveProductAttribute(productAttribute);
      console.log('Thuộc tính sản phẩm đã lưu thành công:', response);
      // Sau khi lưu thành công, bạn có thể reset form hoặc chuyển hướng sang trang khác nếu muốn
      name.value = '';
      description.value = '';
    } catch (error) {
      console.error('Lỗi khi lưu thuộc tính:', error);
    }
  };
  </script>
  
  <style scoped>
  .field {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  textarea {
    height: 100px;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  