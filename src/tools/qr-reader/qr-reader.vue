<script setup lang="ts">
import jsQR from 'jsqr';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const result = ref('');
const errorMsg = ref('');
const running = ref(false);

async function startCamera() {
  try {
    result.value = '';
    errorMsg.value = '';
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    stream.value = s;
    if (video.value) {
      video.value.srcObject = s;
      await video.value.play();
      running.value = true;
      requestAnimationFrame(tick);
    }
  }
  catch (e: any) {
    errorMsg.value = String(e?.message || e);
  }
}

function stopCamera() {
  running.value = false;
  stream.value?.getTracks().forEach(t => t.stop());
  stream.value = null;
}

function tick() {
  if (!running.value) return;
  const v = video.value; const c = canvas.value;
  if (v && c) {
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    const qr = jsQR(imageData.data, imageData.width, imageData.height);
    if (qr?.data) {
      result.value = qr.data;
      stopCamera();
      return;
    }
  }
  requestAnimationFrame(tick);
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  result.value = '';
  errorMsg.value = '';
  const img = new Image();
  img.onload = () => {
    const c = canvas.value!;
    const ctx = c.getContext('2d')!;
    c.width = img.width; c.height = img.height;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const qr = jsQR(data.data, data.width, data.height);
    if (qr?.data) result.value = qr.data; else errorMsg.value = 'No QR code detected.';
  };
  img.onerror = () => errorMsg.value = 'Failed to load image.';
  img.src = URL.createObjectURL(file);
}
</script>

<template>
  <c-card>
    <n-grid cols="1 900:2" x-gap="12" y-gap="12">
      <n-gi>
        <div class="mb-2 opacity-80">Camera:</div>
        <video ref="video" autoplay playsinline muted style="width: 100%; max-height: 360px; background: #000;" />
        <div class="mt-2 flex gap-2">
          <n-button type="primary" @click="startCamera" :disabled="running">Start</n-button>
          <n-button @click="stopCamera" :disabled="!running">Stop</n-button>
          <input type="file" accept="image/*" @change="onFile" />
        </div>
        <c-alert v-if="errorMsg" type="error" class="mt-2">{{ errorMsg }}</c-alert>
      </n-gi>
      <n-gi>
        <n-form-item label="Result">
          <TextareaCopyable :value="result" language="text" class="w-full" />
        </n-form-item>
        <canvas ref="canvas" style="display: none"></canvas>
      </n-gi>
    </n-grid>
  </c-card>
</template>


