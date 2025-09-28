<script setup lang="ts">
import { jwtVerify, importJWK, importSPKI } from 'jose';
import type { JWK } from 'jose';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const token = ref('');
const jwkText = ref('');
const spki = ref('');
const result = ref('');

async function run() {
  try {
    const key = jwkText.value.trim()
      ? await importJWK(JSON.parse(jwkText.value) as JWK)
      : (spki.value.trim() ? await importSPKI(spki.value) : null);
    if (!key) throw new Error('Provide JWK or SPKI public key');
    const { payload, protectedHeader } = await jwtVerify(token.value, key as any);
    result.value = JSON.stringify({ protectedHeader, payload }, null, 2);
  }
  catch (e: any) {
    result.value = String(e?.message ?? e);
  }
}
</script>

<template>
  <div>
    <n-form-item label="Token"><c-input-text v-model:value="token" multiline rows="4" monospace raw-text /></n-form-item>
    <n-grid cols="1 1000:2" x-gap="12" y-gap="12">
      <n-gi>
        <n-form-item label="JWK"><c-input-text v-model:value="jwkText" multiline rows="6" monospace raw-text /></n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Public key (SPKI)"><c-input-text v-model:value="spki" multiline rows="6" monospace raw-text /></n-form-item>
      </n-gi>
    </n-grid>
    <n-button type="primary" @click="run">Verify</n-button>
    <n-form-item label="Result" mt-3><TextareaCopyable :value="result" language="json" /></n-form-item>
  </div>
</template>


