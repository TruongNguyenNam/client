<template>
  <div class="container">
    <!-- Form thêm giảm giá -->
    <form @submit.prevent="submitForm" class="discount-form">
      <h2>Thêm Giảm Giá</h2>

      <label for="name">Tên:</label>
      <input id="name" type="text" v-model="form.name" required />

      <label for="percentValue">Phần trăm giảm (%):</label>
      <input
        id="percentValue"
        type="number"
        v-model.number="form.percentValue"
        min="1"
        max="100"
        required
      />

      <label for="priceThreshold">Ngưỡng giá:</label>
      <input id="priceThreshold" type="number" v-model.number="form.priceThreshold" />

      <label for="startDate">Ngày bắt đầu:</label>
      <input id="startDate" type="datetime-local" v-model="form.startDate" required />

      <label for="endDate">Ngày kết thúc:</label>
      <input id="endDate" type="datetime-local" v-model="form.endDate" required />

      <button type="submit">Tạo giảm giá</button>
    </form>

    <!-- Bảng sản phẩm và bộ lọc -->
    <div class="product-table-wrapper">
      <h3>Chọn sản phẩm áp dụng</h3>

      <!-- Chọn danh mục -->
      <label for="categoryFilter">Lọc theo danh mục:</label>
      <select id="categoryFilter" v-model="selectedCategoryId">
        <option :value="null">Tất cả</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>

      <!-- Tìm kiếm theo tên -->
      <label for="searchName" style="margin-left: 15px;">Tìm theo tên:</label>
      <input
        id="searchName"
        type="text"
        v-model="searchName"
        placeholder="Nhập tên sản phẩm..."
        style="padding: 5px; margin-bottom: 15px; margin-left: 5px;"
      />

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Danh mục</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredProducts" :key="p.id">
            <td>
              <input type="checkbox" v-model="selectedProductIds" :value="p.id" />
            </td>
            <td>{{ p.name }}</td>
            <td>{{ p.price.toLocaleString('vi-VN') }} VNĐ</td>
            <td>{{ getCategoryName(p.categoryId) }}</td>
          </tr>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="4" style="text-align:center; color:#999;">
              Không tìm thấy sản phẩm phù hợp
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "DiscountForm",
  data() {
    return {
      form: {
        name: "",
        percentValue: null,
        priceThreshold: 0,
        startDate: "",
        endDate: "",
      },
      categories: [
        { id: 1, name: "Giày dép" },
        { id: 2, name: "Áo quần" },
        { id: 3, name: "Phụ kiện" },
      ],
      selectedCategoryId: null, // null nghĩa là chọn tất cả
      searchName: "",
      products: [
        { id: 101, name: "Giày Nike", price: 1500000, categoryId: 1 },
        { id: 102, name: "Áo thể thao", price: 500000, categoryId: 2 },
        { id: 103, name: "Túi gym", price: 700000, categoryId: 3 },
        { id: 104, name: "Giày Adidas", price: 1300000, categoryId: 1 },
        { id: 105, name: "Quần shorts", price: 450000, categoryId: 2 },
      ],
      selectedProductIds: [],
      selectAll: false,
    };
  },
  computed: {
    filteredProducts() {
      // Lọc sản phẩm theo danh mục và tên
      return this.products.filter((p) => {
        const matchesCategory =
          this.selectedCategoryId === null || p.categoryId === this.selectedCategoryId;
        const matchesName = p.name.toLowerCase().includes(this.searchName.toLowerCase());
        return matchesCategory && matchesName;
      });
    },
  },
  methods: {
    getCategoryName(categoryId) {
      const cat = this.categories.find((c) => c.id === categoryId);
      return cat ? cat.name : "";
    },
    submitForm() {
      // Kiểm tra ngày bắt đầu nhỏ hơn ngày kết thúc
      if (new Date(this.form.startDate) >= new Date(this.form.endDate)) {
        alert("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
        return;
      }
      // Kiểm tra đã chọn sản phẩm chưa
      if (this.selectedProductIds.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm áp dụng");
        return;
      }
      // Tạo payload gửi đi
      const payload = {
        ...this.form,
        productIds: this.selectedProductIds,
      };
      console.log("🎯 Payload gửi đi:", payload);
      alert("Đã gửi dữ liệu, xem console để kiểm tra payload");
      // TODO: Gửi payload lên server ở đây
    },
    toggleSelectAll() {
      if (this.selectAll) {
        // Chọn hết sản phẩm đang được lọc hiển thị
        this.selectedProductIds = this.filteredProducts.map((p) => p.id);
      } else {
        this.selectedProductIds = [];
      }
    },
  },
  watch: {
    // Cập nhật checkbox chọn tất cả khi danh sách chọn thay đổi
    selectedProductIds(newVal) {
      this.selectAll =
        newVal.length === this.filteredProducts.length && this.filteredProducts.length > 0;
    },
    // Khi thay đổi danh mục hoặc tìm kiếm, reset chọn sản phẩm và checkbox chọn tất cả
    selectedCategoryId() {
      this.selectedProductIds = [];
      this.selectAll = false;
    },
    searchName() {
      this.selectedProductIds = [];
      this.selectAll = false;
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.discount-form {
  flex: 1;
  max-width: 400px;
  background: #f7f7f7;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}

.discount-form h2 {
  margin-bottom: 20px;
}

.discount-form label {
  display: block;
  margin-top: 15px;
  font-weight: 600;
  color: #333;
}

.discount-form input {
  width: 100%;
  padding: 8px 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.discount-form button[type="submit"] {
  margin-top: 25px;
  background-color: #4caf50;
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.discount-form button[type="submit"]:hover {
  background-color: #45a049;
}

.product-table-wrapper {
  flex: 2;
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  overflow-x: auto;
}

.product-table-wrapper h3 {
  margin-bottom: 15px;
  color: #333;
}

.product-table-wrapper label {
  font-weight: 600;
  margin-right: 10px;
  display: inline-block;
}

.product-table-wrapper select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 15px;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background-color: #007ad9;
  color: white;
}

th,
td {
  padding: 10px 12px;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
}

th:first-child,
td:first-child {
  text-align: center;
  width: 50px;
}

tbody tr:hover {
  background-color: #f1f7ff;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .discount-form,
  .product-table-wrapper {
    max-width: 100%;
    width: 100%;
  }
}
</style>
