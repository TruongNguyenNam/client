<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>Bình luận sản phẩm</h3>
    </div>

    <div class="chat-body">
      <div v-for="comment in productReview" :key="comment.id" class="chat-message">
        <strong>{{ comment.userName }}</strong>: {{ comment.reviewText }}
        <div class="rating">⭐ {{ comment.rating }}/5</div>
        <img v-if="comment.imageUrl" :src="comment.imageUrl" alt="Review image" style="max-width: 100px;" />
      </div>
      <div v-if="!productReview.length && !errorMessage" class="no-reviews">Chưa có bình luận nào.</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>

    <div class="chat-input">
      <InputText
        v-model="newComment"
        placeholder="Nhập bình luận..."
        class="p-inputtext-lg"
        style="flex: 1"
      />
      <Dropdown
        v-model="newRating"
        :options="starOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Chọn sao"
        class="p-dropdown"
        style="width: 120px"
      />
      <FileUpload
        mode="basic"
        accept="image/*"
        :maxFileSize="10000000"
        chooseLabel="Chọn ảnh"
        @select="handleFileChange"
        :auto="false"
        class="p-fileupload"
      />
      <Button
        label="Gửi"
        icon="pi pi-send"
        :loading="isSending"
        @click="sendComment"
        class="p-button-raised p-button-success"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductReviewClientService } from '../../../../service/client/ProductReviewClientService';
import type { ProductReviewRequestClient, ProductReviewResponseClient } from '../../../../model/client/productReview';
import type { ProductResponseClient } from '../../../../model/client/product';
import { useAuthStore } from '../../../../stores/auth';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

const toast = useToast();
const props = defineProps<{
  product: ProductResponseClient;
}>();

const authStore = useAuthStore();
const productReview = ref<ProductReviewResponseClient[]>([]);
const newComment = ref<string>('');
const newRating = ref<number | ''>('');
const selectedFile = ref<File | null>(null);
const errorMessage = ref<string>('');
const isSending = ref<boolean>(false);

// Tùy chọn cho Dropdown số sao
const starOptions = ref([
  { label: '1 sao', value: 1 },
  { label: '2 sao', value: 2 },
  { label: '3 sao', value: 3 },
  { label: '4 sao', value: 4 },
  { label: '5 sao', value: 5 },
]);

const fetchReviews = async () => {
  try {
    const parentProductId = Number(props.product.parentProductId);
    console.log('Fetching reviews for parentProductId:', parentProductId);
    if (!parentProductId || isNaN(parentProductId)) {
      console.error('Invalid parentProductId:', parentProductId);
      errorMessage.value = 'Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.';
      productReview.value = [];
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: errorMessage.value,
        life: 3000,
      });
      return;
    }

    const response = await ProductReviewClientService.getReviewsByParentProductId(parentProductId);
    console.log('API response:', response);
    productReview.value = response.data ?? [];
    errorMessage.value = '';
    if (!productReview.value.length) {
      console.log('No reviews found for parentProductId:', parentProductId);
    } else {
      console.log('Reviews found:', productReview.value);
    }
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    errorMessage.value = error.response?.data?.message || 'Không thể tải bình luận. Vui lòng thử lại sau.';
    productReview.value = [];
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMessage.value,
      life: 3000,
    });
  }
};

const handleFileChange = (event: any) => {
  selectedFile.value = event.files && event.files.length > 0 ? event.files[0] : null;
};

const sendComment = async () => {
  if (!newComment.value || !newRating.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập bình luận và chọn số sao.',
      life: 3000,
    });
    return;
  }

  if (!authStore.userId) {
    toast.add({
      severity: 'warn',
      summary: 'Chưa đăng nhập',
      detail: 'Vui lòng đăng nhập để gửi bình luận.',
      life: 3000,
    });
    return;
  }

  const parentProductId = Number(props.product.parentProductId);
  if (!parentProductId || isNaN(parentProductId)) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.',
      life: 3000,
    });
    return;
  }

  try {
    isSending.value = true;
    const review: ProductReviewRequestClient = {
      productId: parentProductId,
      userId: authStore.userId,
      rating: Number(newRating.value),
      reviewText: newComment.value,
    };

    await ProductReviewClientService.addReview(review, selectedFile.value ?? undefined);
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Bình luận đã được gửi thành công!',
      life: 3000,
    });
    newComment.value = '';
    newRating.value = '';
    selectedFile.value = null;
    await fetchReviews();
  } catch (error: any) {
    console.error('Error posting review:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại sau.',
      life: 3000,
    });
  } finally {
    isSending.value = false;
  }
};

onMounted(async () => {
  console.log('props.product:', props.product);
  console.log('parentProductId:', props.product.parentProductId);
  if (authStore.userId && !authStore.userInfo) {
    await authStore.fetchUserInfo();
  }
  fetchReviews();
});
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}
.chat-header {
  text-align: center;
  margin-bottom: 12px;
}
.chat-body {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}
.chat-message {
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.no-reviews,
.error-message {
  padding: 8px;
  text-align: center;
  color: #666;
}
.error-message {
  color: #d32f2f;
}
.chat-input {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.rating {
  font-size: 14px;
  color: #ffa500;
}
</style>