<template>
 <br>
 <br> <br> <br>
  <div class="return-order-detail-container ">
    <!-- Header section -->
    <div class="header-section">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text back-button" 
        @click="router.go(-1)"
        v-tooltip.top="'Quay lại'"
      />
      <div class="header-content">
        <h1 class="title">Chi tiết yêu cầu hoàn hàng</h1>
        <span class="order-code">{{ code }}</span>
      </div>
    </div>

    <hr class="divider">

    <!-- Main content -->
    <div class="content-section">
      <!-- Product list -->
      <div v-if="items.length > 0" class="product-list-container">
        <div 
          v-for="(item, index) in items" 
          :key="index" 
          class="product-item-wrapper"
        >
          <div class="product-card">
            <div class="product-image-container">
              <img 
                :src="item.imageProduct || 'https://via.placeholder.com/150?text=No+Image'" 
                :alt="item.productName"
                class="product-image"
                @error="handleImageError"
              />
            </div>
            
            <div class="product-details">
              <div class="product-header">
                <h3 class="product-name">{{ item.productName }}</h3>
                <Tag 
                  :value="item.status" 
                  :severity="getStatusSeverity(item.status)" 
                  class="status-tag"
                />
              </div>

              <div class="product-meta-grid">
                <div class="meta-group">
                  <div class="meta-item">
                    <span class="meta-label">Số lượng:</span>
                    <span class="meta-value">{{ item.quantity }}</span>
                  </div>
                  
                  <div class="meta-item">
                    <span class="meta-label">Lý do:</span>
                    <span class="meta-value">{{ item.reason }}</span>
                  </div>

                  <div v-if="item.note" class="meta-item">
                    <span class="meta-label">Ghi chú:</span>
                    <span class="meta-value note-text">{{ item.note }}</span>
                  </div>
                </div>

                <div class="meta-group price-group">
                  <div class="meta-item">
                    <span class="meta-label">Đơn giá:</span>
                    <span class="meta-value price-text">{{ formatCurrency(item.unitPrice) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Thành tiền:</span>
                    <span class="meta-value total-amount">{{ formatCurrency(item.totalRefundAmount) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="item.attributes" class="product-attributes">
                <div 
                  v-for="(value, key) in item.attributes" 
                  :key="key"
                  class="attribute-item"
                >
                  <span class="attribute-key">{{ key }}:</span>
                  <span class="attribute-value">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <hr v-if="index < items.length - 1" class="product-divider">
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-box"></i>
        </div>
        <h3 class="empty-title">Không có sản phẩm nào</h3>
        <p class="empty-message">Không tìm thấy thông tin sản phẩm cho yêu cầu này</p>
        <Button 
          label="Tải lại" 
          icon="pi pi-refresh" 
          class="p-button-outlined refresh-button"
          @click="fetchData" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { ReturnOrderClientService } from '../../../../service/client/ReturnOrderService'
import type { returnHistoryItemResponse } from '../../../../model/client/ReturnOrder'

const route = useRoute()
const router = useRouter()
const code = route.params.code as string
const items = ref<returnHistoryItemResponse[]>([])

const fetchData = async () => {
  try {
    items.value = await ReturnOrderClientService.fetchReturnHistoryItem(code)
  } catch (error) {
    console.error('Error fetching return order details:', error)
  }
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'Chờ phản hồi': return 'warning'
    case 'Đã duyệt': return 'success'
    case 'Bị từ chối': return 'danger'
    default: return 'info'
  }
}

const formatCurrency = (value?: number | string) => {
  if (!value) return '0₫';
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/150?text=No+Image'
}

onMounted(fetchData)
</script>

<style scoped>
.return-order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.back-button {
  color: var(--primary-color) !important;
  padding: 0.5rem;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.order-code {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  background-color: rgba(13, 110, 253, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.divider {
  border: none;
  height: 1px;
  background-color: #e9ecef;
  margin: 1.5rem 0;
}

.content-section {
  margin-top: 1.5rem;
}

.product-list-container {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.product-item-wrapper {
  margin-bottom: 1.5rem;
}

.product-divider {
  border: none;
  height: 1px;
  background-color: #e9ecef;
  margin: 1.5rem 0;
}

.product-card {
  display: flex;
  background: white;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.product-image-container {
  width: 120px;
  min-width: 120px;
  height: 120px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.status-tag {
  margin-left: 0.5rem;
  align-self: flex-start;
}

.product-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  font-size: 0.95rem;
}

.meta-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 80px;
}

.meta-value {
  color: #495057;
  margin-left: 0.5rem;
}

.note-text {
  color: #6c757d;
  font-style: italic;
}

.price-group {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.price-text {
  color: #0d6efd;
  font-weight: 500;
}

.total-amount {
  color: #dc3545;
  font-weight: 600;
}

.product-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e9ecef;
}

.attribute-item {
  font-size: 0.85rem;
  display: flex;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.attribute-key {
  font-weight: 500;
  color: #6c757d;
}

.attribute-value {
  margin-left: 0.5rem;
  color: #495057;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.empty-icon {
  color: #adb5bd;
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.empty-message {
  color: #6c757d;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.refresh-button {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .return-order-detail-container {
    padding: 1rem;
  }
  
  .product-card {
    flex-direction: column;
    padding: 1rem;
  }
  
  .product-image-container {
    width: 100%;
    height: 160px;
  }
  
  .product-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-tag {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .product-meta-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .price-group {
    margin-top: 1rem;
  }
}
</style>