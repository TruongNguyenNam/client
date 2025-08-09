<template>
  <div class="banner-container">
    <div class="image-grid">
      <div v-for="(image, index) in bannerImages" :key="index" class="image-item">
        <img :src="image.itemImageSrc" :alt="image.alt" class="banner-image" />
        <p class="image-caption">{{ image.caption }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const bannerImages = ref([
  {
    itemImageSrc: new URL('@/assets/img/image1.png', import.meta.url).href,
    alt: 'Image 1',
    caption: 'Quần áo',
  },
  {
    itemImageSrc: new URL('@/assets/img/image2.png', import.meta.url).href,
    alt: 'Image 2',
    caption: 'Giày',
  },
  {
    itemImageSrc: new URL('@/assets/img/image3.png', import.meta.url).href,
    alt: 'Image 3',
    caption: 'Phụ kiện',
  },
  {
    itemImageSrc: new URL('@/assets/img/image4.png', import.meta.url).href,
    alt: 'Image 4',
    caption: 'Tất cả sản phẩm Motorsport',
  },
])
</script>

<style scoped>
.banner-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: 30px;
   
}

.image-grid {
  display: flex;
  /* flex-wrap: wrap; */
  gap: 20px;
  justify-content: center;
}

.image-item {
  text-align: center;
  /* border: 1px solid red; */
  width: 350px;
}

.banner-image {
  width: 100%;
  max-width: 550px;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  /* border: 1px solid red; */
}

.banner-image:hover {
  transform: scale(1.05);
}

.image-caption {
  margin-top: 10px;
  font-size: 16px;
  color: #333;
}
</style>