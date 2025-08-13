<template>
  <div>
    <div id="reader" style="width: 300px"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

let html5QrCode
const qrRegionId = "reader"

const scanSuccess = (decodedText, decodedResult) => {
  console.log("Mã QR:", decodedText)
  // ✅ Tìm sản phẩm theo mã QR và thêm vào giỏ hàng
   emit('productScanned', decodedText);
}

onMounted(() => {
  html5QrCode = new Html5Qrcode(qrRegionId)
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    scanSuccess,
    (errorMessage) => {
      // console.warn("Không quét được:", errorMessage)
    }
  )
})

onBeforeUnmount(() => {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear()
    })
  }
})
</script>
