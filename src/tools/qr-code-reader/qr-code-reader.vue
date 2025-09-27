<script setup lang="ts">
import jsQR, { type QRCode } from 'jsqr';
import _ from 'lodash';
import { useCopy } from '@/composable/copy';

const {
  videoInputs: cameras,
  permissionGranted,
  isSupported,
  ensurePermissions,
} = useDevicesList({
  requestPermissions: true,
  constraints: { video: true, audio: false },
  onUpdated() {
    refreshCurrentDevices();
  },
});

const video = ref<HTMLVideoElement>();
const canvas = ref<HTMLCanvasElement>();
const currentCamera = ref(cameras.value[0]?.deviceId);
const permissionCannotBePrompted = ref(false);
const isScanning = ref(false);
const decodedResult = ref<QRCode | null>(null);
const errorMessage = ref('');
const fileInput = ref() as Ref<File>;
const uploadedImage = ref<HTMLImageElement>();

const {
  stream,
  start,
  stop,
  enabled: isWebcamActive,
} = useUserMedia({
  constraints: computed(() => ({
    video: { deviceId: currentCamera.value },
  })),
  autoSwitch: true,
});

const decodedText = computed(() => decodedResult.value?.data || '');
const { copy: copyResult } = useCopy({ 
  source: decodedText, 
  text: 'QR code content copied to clipboard' 
});

let scanningInterval: ReturnType<typeof setInterval> | null = null;

function refreshCurrentDevices() {
  if (_.isNil(currentCamera) || !cameras.value.find(i => i.deviceId === currentCamera.value)) {
    currentCamera.value = cameras.value[0]?.deviceId;
  }
}

watchEffect(() => {
  if (video.value && stream.value) {
    video.value.srcObject = stream.value;
  }
});

function startScanning() {
  if (!video.value || !canvas.value) return;
  
  isScanning.value = true;
  decodedResult.value = null;
  errorMessage.value = '';
  
  scanningInterval = setInterval(() => {
    if (!video.value || !canvas.value || !isScanning.value) return;
    
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
    
    // Get image data from canvas
    const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    
    // Try to decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      decodedResult.value = code;
      drawBoundingBox(ctx, code.location);
      stopScanning();
    }
  }, 200); // Scan every 200ms as requested
}

function stopScanning() {
  isScanning.value = false;
  if (scanningInterval) {
    clearInterval(scanningInterval);
    scanningInterval = null;
  }
}

function drawBoundingBox(ctx: CanvasRenderingContext2D, location: QRCode['location']) {
  ctx.beginPath();
  ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
  ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
  ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
  ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
  ctx.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#00ff00';
  ctx.stroke();
}

async function requestPermissions() {
  try {
    await ensurePermissions();
    errorMessage.value = '';
  }
  catch (e) {
    permissionCannotBePrompted.value = true;
    errorMessage.value = 'Camera permission denied. Please enable camera access in your browser settings.';
  }
}

async function onFileUpload(file: File) {
  if (!file) return;
  
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload a PNG or JPG image file.';
    return;
  }
  
  fileInput.value = file;
  
  try {
    const imageElement = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      errorMessage.value = 'Cannot process image. Please try again.';
      return;
    }
    
    // Load the image
    await new Promise((resolve, reject) => {
      imageElement.onload = resolve;
      imageElement.onerror = reject;
      imageElement.src = URL.createObjectURL(file);
    });
    
    // Set canvas dimensions to match image
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    // Draw image to canvas
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try to decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      decodedResult.value = code;
      errorMessage.value = '';
    } else {
      decodedResult.value = null;
      errorMessage.value = 'No QR code found in the image. Please ensure the image contains a clear QR code with good contrast.';
    }
    
    // Store uploaded image for display
    uploadedImage.value = imageElement;
    
  } catch (error) {
    errorMessage.value = 'Error processing image. Please try again with a different image.';
    console.error('QR code processing error:', error);
  }
}

function clearResults() {
  decodedResult.value = null;
  errorMessage.value = '';
  uploadedImage.value = undefined;
  stopScanning();
}

onBeforeUnmount(() => {
  stop();
  stopScanning();
});
</script>

<template>
  <div>
    <!-- Image Upload Section -->
    <c-card title="Upload QR Code Image">
      <c-file-upload 
        title="Drag and drop a PNG or JPG image here, or click to select a file" 
        @file-upload="onFileUpload" 
      />
      
      <div v-if="uploadedImage" mt-4 flex justify-center>
        <img 
          :src="uploadedImage.src" 
          alt="Uploaded QR code" 
          style="max-width: 300px; max-height: 300px;"
        />
      </div>
    </c-card>

    <!-- Webcam Scanner Section -->
    <c-card title="Webcam QR Code Scanner" mt-4>
      <div v-if="!isSupported">
        <n-alert type="error">
          Your browser does not support webcam access for QR code scanning.
        </n-alert>
      </div>

      <div v-else-if="!permissionGranted" text-center>
        <n-alert type="info" mb-4>
          You need to grant camera permission to scan QR codes with your webcam.
        </n-alert>

        <n-alert v-if="permissionCannotBePrompted" type="warning" mt-4 text-left>
          Camera permission was blocked. Please enable camera access manually in your browser settings (usually the lock icon in the address bar).
        </n-alert>

        <div v-else mt-4 flex justify-center>
          <c-button type="primary" @click="requestPermissions">
            Grant Camera Permission
          </c-button>
        </div>
      </div>

      <div v-else>
        <div flex flex-col gap-2 mb-4>
          <c-select
            v-model:value="currentCamera"
            label-position="left"
            label-width="60px"
            label="Camera:"
            :options="cameras.map(({ deviceId, label }) => ({ value: deviceId, label }))"
            placeholder="Select camera"
          />
        </div>

        <div v-if="!isWebcamActive" flex justify-center mb-4>
          <c-button type="primary" @click="start">
            Start Webcam
          </c-button>
        </div>

        <div v-else>
          <div position-relative mb-4>
            <video ref="video" autoplay playsinline muted max-h-full w-full />
            <canvas 
              ref="canvas" 
              position-absolute 
              top-0 
              left-0 
              pointer-events-none 
              style="z-index: 10;"
            />
          </div>

          <div flex justify-center gap-3 mb-4>
            <c-button v-if="!isScanning" type="primary" @click="startScanning">
              Start Scanning
            </c-button>
            <c-button v-else type="error" @click="stopScanning">
              Stop Scanning
            </c-button>
            <c-button @click="clearResults">
              Clear Results
            </c-button>
          </div>

          <div v-if="isScanning" flex justify-center>
            <n-alert type="info">
              <div flex items-center gap-2>
                <n-spin size="small" />
                Scanning for QR codes... Point your camera at a QR code.
              </div>
            </n-alert>
          </div>
        </div>
      </div>
    </c-card>

    <!-- Results Section -->
    <c-card v-if="decodedResult || errorMessage" title="Results" mt-4>
      <div v-if="decodedResult">
        <n-alert type="success" mb-4>
          QR code successfully decoded!
        </n-alert>
        
        <div mb-4>
          <label font-bold mb-2 block>Decoded Content:</label>
          <c-input-text
            :value="decodedResult.data"
            multiline
            readonly
            rows="4"
            mb-2
          />
        </div>

        <div flex justify-center>
          <c-button type="primary" @click="copyResult">
            Copy to Clipboard
          </c-button>
        </div>
      </div>

      <div v-if="errorMessage">
        <n-alert type="error">
          {{ errorMessage }}
        </n-alert>
        
        <div mt-4>
          <div font-bold mb-2>Tips for better QR code detection:</div>
          <ul text-sm op-80 ml-4>
            <li>• Ensure good lighting and avoid shadows</li>
            <li>• Hold the camera steady and at an appropriate distance</li>
            <li>• Make sure the QR code has sufficient contrast</li>
            <li>• Clean your camera lens if the image appears blurry</li>
            <li>• Try uploading a high-quality image instead</li>
          </ul>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
video {
  border-radius: 8px;
}

canvas {
  border-radius: 8px;
}

ul li {
  margin-bottom: 4px;
}
</style>