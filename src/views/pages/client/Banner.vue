<template>
    <div class="banner-container">
      <Galleria
        :value="bannerImages"
        :showThumbnails="false"
        :showIndicators="true"
        :showIndicatorsOnItem="true"
        :circular="true"
        :autoPlay="true"
        :transitionInterval="3000"
        containerStyle="max-width: 100%;"
      >
        <template #item="slotProps">
          <img
            :src="slotProps.item.itemImageSrc"
            :alt="slotProps.item.alt"
            class="w-full h-[400px] object-cover"
          />
        </template>
      </Galleria>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';

  const bannerImages = ref([
    {
      itemImageSrc: new URL('@/assets/img/banner4.png', import.meta.url).href,
      alt: 'Banner 1',
    },
    {
      itemImageSrc: new URL('@/assets/img/banner2.png', import.meta.url).href,
      alt: 'Banner 2',
    },
    {
      itemImageSrc: new URL('@/assets/img/banner3.png', import.meta.url).href,
      alt: 'Banner 3',
    },
  ]);
  </script>
  
  <style scoped>
  .banner-container {
    margin-top: 95px;
  }
  </style>
  