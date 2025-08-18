<template>
    <div class="article-list" style="margin-top: 90px; margin-left: 250px;">
      <div 
        v-for="(item, index) in articles" 
        :key="index" 
        class="article-card"
        width="250px"
        height="300px"
      >
        <!-- Ảnh + badge ngày tháng -->
        <div class="image-wrapper" style="width: 250px; margin-top: 20px;" >
          <img :src="item.image" :alt="item.alt" />
          <div class="date-badge">
            <span class="day">{{ item.day }}</span>
            <span class="month">Th{{ item.month }}</span>
          </div>
        </div>
  
        <!-- Nội dung -->
        <div class="content">
          <h3>{{ item.title }}</h3>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const articles = ref([
  {
    image: new URL('@/assets/img/airforce1.png', import.meta.url).href,
    alt: 'img 1',
    day: '10',
    month: '8',
    title: 'Nike Ja 3 – Đôi giày tốc độ bùng nổ cùng Ja Morant, mang đến sự linh hoạt tối đa cho những pha bứt phá trên sân.'
  },
  {
    image: new URL('@/assets/img/airforce2.png', import.meta.url).href,
    alt: 'img 2',
    day: '15',
    month: '8',
    title: 'Khám phá chi tiết Nike Air Force 1: Thiết kế kinh điển kết hợp phong cách hiện đại, phù hợp cả trên sân bóng và streetwear.'
  },
  {
    image: new URL('@/assets/img/airforce3.png', import.meta.url).href,
    alt: 'img 3',
    day: '20',
    month: '8',
    title: 'Top 5 lý do bạn nên sở hữu Air Jordan Retro – Biểu tượng không chỉ của bóng rổ mà còn của thời trang đường phố.'
  },
  {
    image: new URL('@/assets/img/airforce1.png', import.meta.url).href,
    alt: 'img 4',
    day: '25',
    month: '8',
    title: 'Adidas Harden Vol.7 – Đôi giày được thiết kế dành riêng cho những cú step-back huyền thoại và khả năng bùng nổ điểm số.'
  },
  {
    image: new URL('@/assets/img/airforce2.png', import.meta.url).href,
    alt: 'img 5',
    day: '31',
    month: '7',
    title: 'Bộ sưu tập Air Max 90 “Racing”: Lời tri ân tốc độ, kết hợp công nghệ đệm khí êm ái cùng phong cách thể thao đầy cá tính.'
  }
]);
  </script>
  
  <style scoped>
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .article-card {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .image-wrapper {
    position: relative;
    width: 250px;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .date-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: black;
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .date-badge .day {
    font-size: 1rem;
    line-height: 1rem;
  }
  
  .date-badge .month {
    font-size: 0.8rem;
  }
  
  .content h3 {
    font-size: 1.1rem;
    font-weight: bold;
    line-height: 1.4rem;
  }
  </style>
  