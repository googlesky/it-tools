<script setup lang="ts">
import { SignJWT, jwtVerify, importJWK, importPKCS8, importSPKI } from 'jose';
import type { JWK } from 'jose';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

type Alg = 'HS256' | 'RS256' | 'ES256' | 'EdDSA'
const alg = ref<Alg>('HS256');
const payloadText = ref('{"sub":"123","name":"John"}');
const headerText = ref('{"typ":"JWT"}');
const secret = ref('your-256-bit-secret');
const privateKeyPem = ref('');
const publicKeyPem = ref('');
const jwkText = ref('');
const token = ref('');
const verifyResult = ref('');

async function getKeyForSign() {
  if (alg.value === 'HS256') {
    return new TextEncoder().encode(secret.value);
  }
  if (jwkText.value.trim()) {
    const jwk = JSON.parse(jwkText.value) as JWK;
    return await importJWK(jwk, alg.value);
  }
  if (privateKeyPem.value.trim()) {
    if (alg.value === 'RS256') return await importPKCS8(privateKeyPem.value, 'RS256');
    if (alg.value === 'ES256') return await importPKCS8(privateKeyPem.value, 'ES256');
    if (alg.value === 'EdDSA') return await importPKCS8(privateKeyPem.value, 'EdDSA');
  }
  throw new Error('Missing key for signing');
}

async function getKeyForVerify() {
  if (alg.value === 'HS256') {
    return new TextEncoder().encode(secret.value);
  }
  if (jwkText.value.trim()) {
    const jwk = JSON.parse(jwkText.value) as JWK;
    return await importJWK(jwk, alg.value);
  }
  if (publicKeyPem.value.trim()) {
    if (alg.value === 'RS256') return await importSPKI(publicKeyPem.value, 'RS256');
    if (alg.value === 'ES256') return await importSPKI(publicKeyPem.value, 'ES256');
    if (alg.value === 'EdDSA') return await importSPKI(publicKeyPem.value, 'EdDSA');
  }
  throw new Error('Missing key for verification');
}

async function doSign() {
  try {
    const h = JSON.parse(headerText.value || '{}');
    const p = JSON.parse(payloadText.value || '{}');
    const key = await getKeyForSign();
    const jwt = await new SignJWT(p).setProtectedHeader({ alg: alg.value, ...h }).sign(key as any);
    token.value = jwt;
  }
  catch (e: any) {
    token.value = String(e?.message ?? e);
  }
}

async function doVerify() {
  try {
    const key = await getKeyForVerify();
    const { payload, protectedHeader } = await jwtVerify(token.value, key as any, { algorithms: [alg.value] });
    verifyResult.value = JSON.stringify({ protectedHeader, payload }, null, 2);
  }
  catch (e: any) {
    verifyResult.value = String(e?.message ?? e);
  }
}
</script>

<template>
  <div>
    <div flex gap-3>
      <n-form-item :label="$t('tools.jwt-builder.alg')">
        <n-select v-model:value="alg" :options="[
          { label: 'HS256', value: 'HS256' },
          { label: 'RS256', value: 'RS256' },
          { label: 'ES256', value: 'ES256' },
          { label: 'EdDSA', value: 'EdDSA' },
        ]" style="min-width: 160px" />
      </n-form-item>
      <n-form-item v-if="alg==='HS256'" :label="$t('tools.jwt-builder.secret')"><c-input-text v-model:value="secret" type="password" /></n-form-item>
    </div>

    <div v-if="alg!=='HS256'" grid grid-cols-1 md:grid-cols-2 gap-3>
      <n-form-item :label="$t('tools.jwt-builder.privateKeyPem')"><c-input-text v-model:value="privateKeyPem" multiline rows="6" monospace raw-text /></n-form-item>
      <n-form-item :label="$t('tools.jwt-builder.publicKeyPem')"><c-input-text v-model:value="publicKeyPem" multiline rows="6" monospace raw-text /></n-form-item>
      <n-form-item :label="$t('tools.jwt-builder.jwk')" class="col-span-2"><c-input-text v-model:value="jwkText" multiline rows="6" monospace raw-text /></n-form-item>
    </div>

    <div grid grid-cols-1 md:grid-cols-2 gap-3>
      <n-form-item :label="$t('tools.jwt-builder.header')"><c-input-text v-model:value="headerText" multiline rows="6" monospace raw-text /></n-form-item>
      <n-form-item :label="$t('tools.jwt-builder.payload')"><c-input-text v-model:value="payloadText" multiline rows="6" monospace raw-text /></n-form-item>
    </div>

    <div flex gap-2>
      <n-button type="primary" @click="doSign">{{ $t('tools.jwt-builder.sign') }}</n-button>
      <n-button @click="doVerify">{{ $t('tools.jwt-builder.verify') }}</n-button>
    </div>

    <n-form-item :label="$t('tools.jwt-builder.token')"><TextareaCopyable :value="token" /></n-form-item>
    <n-form-item :label="$t('tools.jwt-builder.verifyResult')"><TextareaCopyable :value="verifyResult" language="json" /></n-form-item>
  </div>
</template>


