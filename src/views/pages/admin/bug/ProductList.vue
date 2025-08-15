<script setup lang="ts">
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import ProductCard from './ProductCard.vue';
import type { ProductResponse } from '../../../../model/admin/product';
import {onBeforeUnmount} from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import { nextTick } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
  products: {
    type: Array as () => ProductResponse[],
    required: true
  },
  selectedInvoice: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['add-product']);

const searchQuery = ref('');

// const filteredProducts = computed(() => {
//   if (!searchQuery.value) return props.products;
//   const query = searchQuery.value.toLowerCase();
//   return props.products.filter(product => 
//     product.name.toLowerCase().includes(query)
//   );
// });
const filteredProducts = computed(() => {
  if (!searchQuery.value) return props.products;
  const query = searchQuery.value.toLowerCase();
  return props.products.filter(product => {
    const name = product.name.toLowerCase();
    const sku = product.sku?.toLowerCase() || '';
    return name.includes(query) || sku.includes(query);
  });
});

const handleAddProduct = (product: ProductResponse) => {
  console.log('Emitting add-product for:', product.id, 'at', new Date().toISOString());
  emit('add-product', product);
};
const showQrScanner = ref(false);
let qrScanner: Html5Qrcode | null = null;

const startQrScan = async () => {
  showQrScanner.value = true;

  nextTick(() => {
    if (!qrScanner) {
      qrScanner = new Html5Qrcode('qr-reader');
    }

    qrScanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: 250
        },
        (decodedText) => {
          searchQuery.value = decodedText;
          stopQrScan();
          const lowerText = decodedText.toLowerCase();
          let matchedProduct = props.products.find(
            (p) => p.sku?.toLowerCase() === lowerText
          );
          if (!matchedProduct) {
            matchedProduct = props.products.find((p) =>
              p.name.toLowerCase().includes(lowerText)
            );
          }

          if (matchedProduct) {
            console.log('Tìm thấy và thêm vào giỏ:', matchedProduct.name);
            handleAddProduct(matchedProduct);
          } else {
            console.warn('Không tìm thấy sản phẩm với mã:', decodedText);
            toast.add({
              severity: 'warn',
              summary: 'Không tìm thấy sản phẩm',
              detail: `Mã: ${decodedText}`,
              life: 3000
            });
          }

        },
        (errorMessage) => {
          console.warn('Lỗi quét:', errorMessage);
        }
      )
      .catch((error) => {
        console.error('Lỗi khởi động QR Scanner:', error);
      });
  });
};

const stopQrScan = () => {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      showQrScanner.value = false;
    }).catch(err => {
      console.error("Lỗi dừng QR:", err);
      showQrScanner.value = false;
    });
  } else {
    showQrScanner.value = false;
  }
};


onBeforeUnmount(() => {
  if (qrScanner?.isScanning) {
    qrScanner.stop();
  }
});
</script>

<template>
  <div class="product-section">
    <div class="search-box mb-4" v-if="!selectedInvoice">
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="Tìm kiếm sản phẩm..." class="w-full" />
        <button @click="startQrScan" class="bg-blue-500 text-white px-3 rounded hover:bg-blue-600">
          Quét QR
        </button>
      </div>
    </div>

    <!-- Camera QR -->
    <div v-if="showQrScanner" class="mt-4">
      <div id="qr-reader" style="width: 100%"></div>
      <button @click="stopQrScan" class="mt-2 text-sm text-red-600 underline">Đóng camera</button>
    </div>

    <!-- Danh sách sản phẩm -->
    <div class="products-grid" :class="{ 'products-grid-hidden': selectedInvoice }">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
        @click="handleAddProduct(product)" />
    </div>

    <slot></slot>
  </div>
</template>

<style scoped>
.product-section {
  position: fixed;
  right: 0;
  top: 95px;
  width: 30%;
  height: calc(100vh - 95px);
  background-color: #f8f8f8;
  padding: 20px;
  overflow-y: auto;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.search-box {
  padding: 10px 0;
}

.products-grid-hidden {
  display: none;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
  padding-bottom: 60px;
}

@media (max-width: 992px) {
  .product-section {
    position: static;
    width: 100%;
    height: auto;
    box-shadow: none;
  }
}
</style>