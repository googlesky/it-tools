<script setup lang="ts">
import { useQRCode } from '../qr-code-generator/useQRCode';

const fullName = ref('John Doe');
const org = ref('Acme Inc');
const title = ref('Engineer');
const email = ref('john@example.com');
const phone = ref('+123456789');
const url = ref('https://example.com');
const address = ref('1 Hacker Way;City;State;12345;Country');

const format = ref<'vcard' | 'mecard'>('vcard');

const text = computed(() => {
  if (format.value === 'mecard') {
    const parts = [
      `N:${fullName.value}`,
      org.value && `ORG:${org.value}`,
      title.value && `TITLE:${title.value}`,
      email.value && `EMAIL:${email.value}`,
      phone.value && `TEL:${phone.value}`,
      url.value && `URL:${url.value}`,
      address.value && `ADR:${address.value}`,
    ].filter(Boolean);
    return `MECARD:${parts.join(';')};`;
  }
  // vCard 3.0
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName.value}`,
    org.value && `ORG:${org.value}`,
    title.value && `TITLE:${title.value}`,
    email.value && `EMAIL:${email.value}`,
    phone.value && `TEL:${phone.value}`,
    url.value && `URL:${url.value}`,
    address.value && `ADR:${address.value}`,
    'END:VCARD',
  ].filter(Boolean).join('\n');
});

const foreground = ref('#000000ff');
const background = ref('#ffffffff');
const errorCorrectionLevel = ref<'low' | 'medium' | 'quartile' | 'high'>('medium');
const { qrcode } = useQRCode({ text, color: { background, foreground }, errorCorrectionLevel, options: { width: 1024 } });
</script>

<template>
  <div>
    <n-form label-placement="left" label-width="120">
      <n-form-item label="Format"><n-select v-model:value="format" :options="[{label:'vCard', value:'vcard'}, {label:'MeCard', value:'mecard'}]" style="max-width: 180px" /></n-form-item>
      <n-form-item label="Full name"><c-input-text v-model:value="fullName" /></n-form-item>
      <n-form-item label="Organization"><c-input-text v-model:value="org" /></n-form-item>
      <n-form-item label="Title"><c-input-text v-model:value="title" /></n-form-item>
      <n-form-item label="Email"><c-input-text v-model:value="email" /></n-form-item>
      <n-form-item label="Phone"><c-input-text v-model:value="phone" /></n-form-item>
      <n-form-item label="URL"><c-input-text v-model:value="url" /></n-form-item>
      <n-form-item label="Address"><c-input-text v-model:value="address" /></n-form-item>
    </n-form>

    <n-grid x-gap="12" y-gap="12" cols="1 600:3" mt-4>
      <n-gi span="2">
        <n-form label-placement="left" label-width="160">
          <n-form-item label="Foreground color"><n-color-picker v-model:value="foreground" :modes="['hex']" /></n-form-item>
          <n-form-item label="Background color"><n-color-picker v-model:value="background" :modes="['hex']" /></n-form-item>
          <n-form-item label="Error resistance"><n-select v-model:value="errorCorrectionLevel" :options="['low','medium','quartile','high'].map(v=>({label:v,value:v}))" /></n-form-item>
        </n-form>
      </n-gi>
      <n-gi>
        <n-image :src="qrcode" width="200" />
      </n-gi>
    </n-grid>
  </div>
</template>


