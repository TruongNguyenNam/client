<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';

const { layoutConfig } = useLayout();

// const logoUrl = computed(() => {
//     return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
// });

const logoUrl = new URL('@/assets/img/logo-shoe.png', import.meta.url).href;

</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
        
        <span class="font-medium ml-2">ShoeSports</span>
    </div>
</template>
<style lang="scss" scoped></style>
