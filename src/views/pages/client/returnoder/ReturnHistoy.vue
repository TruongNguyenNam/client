<template>
  <br> <br> <br> <br>
  <div class="p-5 max-w-3xl mx-auto space-y-4">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">📦 Lịch sử hoàn hàng</h2>

    <div v-if="returnHistories.length > 0" class="space-y-4">
      <div
        v-for="item in returnHistories"
        :key="item.code"
        class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 flex items-start gap-4"
      >
        <!-- Ảnh đại diện -->
        <img
          :src="item.thumbnailUrl"
          alt="Ảnh sản phẩm"
          class="w-24 h-24 object-cover rounded-lg border border-gray-200"
        />

        <!-- Thông tin -->
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <div>
              <p class="text-sm text-gray-500">Mã yêu cầu</p>
              <p class="font-medium text-primary">{{ item.code }}</p>
            </div>
            <div class="text-sm text-gray-500">{{ formatDate(item.requestDate) }}</div>
          </div>

          <div class="text-sm text-gray-700 mt-2 space-y-1">
            <p><strong>Ngân hàng:</strong> {{ item.bankName }} - {{ item.bankAccountNumber }}</p>
            <p><strong>Chủ TK:</strong> {{ item.bankAccountName }}</p>
            <p><strong>Số sản phẩm:</strong> {{ item.totalProduct }}</p>
            <p v-if="item.note"><strong>Ghi chú:</strong> {{ item.note }}</p>
            <p>
  <router-link
    :to="`/return/history/${item.code}`"
    class="text-blue-600 hover:underline text-sm font-medium"
  >
    🔍 Xem chi tiết
  </router-link>
</p>

          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 mt-12">
     
      <p class="text-sm">Bạn chưa có yêu cầu hoàn hàng nào</p>
      <!-- <button @click="fetchData" class="mt-3 text-primary font-medium hover:underline">
        Tải lại
      </button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReturnOrderClientService } from '../../../../service/client/ReturnOrderService'
import type { returnHistoryResponse } from '../../../../model/client/ReturnOrder'

const returnHistories = ref<returnHistoryResponse[]>([])

const fetchData = async () => {
  returnHistories.value = await ReturnOrderClientService.fetchReturnHistory()
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchData)
</script>

<style scoped>
.text-primary {
  color: #3b82f6;
}
</style>
