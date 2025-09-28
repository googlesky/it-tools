<script setup lang="ts">
let JsBarcode: any;
const text = ref('123456789012');
const format = ref<'CODE128' | 'EAN13' | 'EAN8' | 'UPC'>('CODE128');
const el = ref<HTMLCanvasElement | null>(null);

async function render() {
  try {
    if (!JsBarcode) {
      const mod: any = await import('jsbarcode');
      JsBarcode = mod.default || mod;
    }
    if (el.value) {
      JsBarcode(el.value, text.value, { format: format.value, displayValue: true });
    }
  }
  catch (e) {
    // ignore
  }
}

watch([text, format], () => render());
onMounted(() => render());
</script>

<template>
  <div>
    <div grid grid-cols-1 md:grid-cols-3 gap-3>
      <n-form-item label="Text"><c-input-text v-model:value="text" /></n-form-item>
      <n-form-item label="Format"><n-select v-model:value="format" :options="['CODE128','EAN13','EAN8','UPC'].map(v=>({label:v,value:v}))" /></n-form-item>
    </div>
    <div mt-4>
      <canvas ref="el"></canvas>
    </div>
  </div>
</template>


