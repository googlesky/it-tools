<script setup lang="ts">
import type { JWK } from 'jose';
import { generateKeyPair, exportJWK, exportPKCS8, exportSPKI } from 'jose';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

type Alg = 'Ed25519' | 'ES256' | 'ES384' | 'ES512';
const alg = ref<Alg>('Ed25519');
const kid = ref('');
const extractable = ref(true);

const publicJwk = ref('');
const privateJwk = ref('');
const publicPem = ref('');
const privatePem = ref('');

const generating = ref(false);
const errorMsg = ref('');

async function runGenerate() {
  generating.value = true;
  errorMsg.value = '';
  try {
    const algo = alg.value === 'Ed25519' ? 'Ed25519' : alg.value;
    const namedCurve = alg.value === 'Ed25519' ? 'Ed25519' : (
      alg.value === 'ES256' ? 'P-256' : alg.value === 'ES384' ? 'P-384' : 'P-521'
    );

    const { publicKey, privateKey } = await generateKeyPair(algo as any, { extractable: extractable.value, crv: namedCurve as any });

    const pubJwk = await exportJWK(publicKey);
    const prvJwk = await exportJWK(privateKey);
    if (kid.value) {
      (pubJwk as any).kid = kid.value;
      (prvJwk as any).kid = kid.value;
    }
    (pubJwk as any).alg = alg.value;
    (prvJwk as any).alg = alg.value;
    publicJwk.value = JSON.stringify(pubJwk, null, 2);
    privateJwk.value = JSON.stringify(prvJwk, null, 2);

    publicPem.value = await exportSPKI(publicKey);
    privatePem.value = await exportPKCS8(privateKey);
  }
  catch (e: any) {
    errorMsg.value = String(e?.message || e);
  }
  generating.value = false;
}
</script>

<template>
  <c-card>
    <n-form label-width="140" label-placement="left">
      <n-form-item label="Algorithm">
        <n-select v-model:value="alg" :options="['Ed25519', 'ES256', 'ES384', 'ES512']" />
      </n-form-item>
      <n-form-item label="KID (optional)">
        <c-input-text v-model:value="kid" placeholder="kid" class="w-full" />
      </n-form-item>
      <n-form-item label="Extractable">
        <n-switch v-model:value="extractable" />
      </n-form-item>
      <n-button type="primary" :loading="generating" @click="runGenerate">Generate</n-button>
    </n-form>

    <c-alert v-if="errorMsg" type="error" class="mt-3">{{ errorMsg }}</c-alert>

    <n-grid cols="1 1000:2" x-gap="12" y-gap="12" class="mt-3">
      <n-gi>
        <n-form-item label="Public JWK">
          <TextareaCopyable :value="publicJwk" language="json" class="w-full" />
        </n-form-item>
        <n-form-item label="Private JWK">
          <TextareaCopyable :value="privateJwk" language="json" class="w-full" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Public Key (PEM, SPKI)">
          <TextareaCopyable :value="publicPem" language="pem" class="w-full" />
        </n-form-item>
        <n-form-item label="Private Key (PEM, PKCS#8)">
          <TextareaCopyable :value="privatePem" language="pem" class="w-full" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>
</template>


