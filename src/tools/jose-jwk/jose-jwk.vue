<script setup lang="ts">
import { exportJWK, importJWK, importPKCS8, importSPKI, JWE, compactDecrypt, CompactEncrypt } from 'jose';
import type { JWK } from 'jose';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const pemPrivate = ref('');
const pemPublic = ref('');
const jwkText = ref('');
const jwksText = ref('');

async function pemToJwk(kind: 'private' | 'public') {
  try {
    if (kind === 'private') {
      const key = await importPKCS8(pemPrivate.value, 'RS256').catch(async () => await importPKCS8(pemPrivate.value, 'ES256').catch(async () => await importPKCS8(pemPrivate.value, 'EdDSA')));
      jwkText.value = JSON.stringify(await exportJWK(key as any), null, 2);
    }
    else {
      const key = await importSPKI(pemPublic.value, 'RS256').catch(async () => await importSPKI(pemPublic.value, 'ES256').catch(async () => await importSPKI(pemPublic.value, 'EdDSA')));
      jwkText.value = JSON.stringify(await exportJWK(key as any), null, 2);
    }
  }
  catch (e: any) {
    jwkText.value = String(e?.message ?? e);
  }
}

const plainText = ref('hello');
const jwe = ref('');

async function doEncrypt() {
  try {
    const jwk = JSON.parse(jwkText.value || '{}') as JWK;
    const pub = await importJWK(jwk, jwk.kty === 'oct' ? 'dir' : 'RSA-OAEP-256').catch(async () => await importJWK(jwk, 'ECDH-ES'));
    const enc = new CompactEncrypt(new TextEncoder().encode(plainText.value))
      .setProtectedHeader({ alg: (jwk.kty === 'oct' ? 'dir' : (jwk.kty === 'RSA' ? 'RSA-OAEP-256' : 'ECDH-ES')), enc: 'A256GCM' });
    jwe.value = await enc.encrypt(pub as any);
  }
  catch (e: any) {
    jwe.value = String(e?.message ?? e);
  }
}

async function doDecrypt() {
  try {
    const jwk = JSON.parse(jwkText.value || '{}') as JWK;
    const priv = await importJWK(jwk, jwk.kty === 'oct' ? 'dir' : 'RSA-OAEP-256').catch(async () => await importJWK(jwk, 'ECDH-ES'));;
    const { plaintext } = await compactDecrypt(jwe.value, priv as any);
    plainText.value = new TextDecoder().decode(plaintext);
  }
  catch (e: any) {
    plainText.value = String(e?.message ?? e);
  }
}
</script>

<template>
  <div grid gap-4>
    <c-card>
      <h3 mb-2>{{ $t('tools.jose-jwk.convert') }}</h3>
      <div grid grid-cols-1 md:grid-cols-2 gap-3>
        <n-form-item label="Private key (PKCS#8)"><c-input-text v-model:value="pemPrivate" multiline rows="6" monospace raw-text /></n-form-item>
        <n-form-item label="Public key (SPKI)"><c-input-text v-model:value="pemPublic" multiline rows="6" monospace raw-text /></n-form-item>
      </div>
      <div flex gap-2 mt-2>
        <n-button @click="pemToJwk('private')">PEM→JWK (private)</n-button>
        <n-button @click="pemToJwk('public')">PEM→JWK (public)</n-button>
      </div>
      <n-form-item label="JWK" mt-2><TextareaCopyable :value="jwkText" language="json" /></n-form-item>
      <n-form-item label="JWKS" mt-2><TextareaCopyable :value="jwksText" language="json" /></n-form-item>
    </c-card>

    <c-card>
      <h3 mb-2>{{ $t('tools.jose-jwk.jwe') }}</h3>
      <n-form-item label="Plaintext"><c-input-text v-model:value="plainText" multiline rows="3" /></n-form-item>
      <div flex gap-2>
        <n-button type="primary" @click="doEncrypt">Encrypt</n-button>
        <n-button @click="doDecrypt">Decrypt</n-button>
      </div>
      <n-form-item label="JWE"><TextareaCopyable :value="jwe" /></n-form-item>
    </c-card>
  </div>
</template>


