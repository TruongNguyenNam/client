<template>
  <div>
    <ClientHeader />
    <Banner />
    <main>
      <RouterView />
    </main>
    <ClientFooter />
  </div>
</template>

<script setup lang="ts">
import ClientHeader from './ClientHeader.vue';
import ClientFooter from './ClientFooter.vue';
import Banner from '../../views/pages/client/Banner.vue';
</script>
