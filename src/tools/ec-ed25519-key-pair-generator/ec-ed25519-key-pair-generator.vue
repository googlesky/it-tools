<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { generateKeyPair, getCurveName, type Algorithm } from './ec-ed25519-key-pair-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';

const message = useMessage();

const algorithm = ref<Algorithm>('EdDSA');
const isLoading = ref(false);
const keyPair = ref<{
  privateKeyPem: string;
  publicKeyPem: string;
  privateKeyJwk: string;
  publicKeyJwk: string;
} | null>(null);

const algorithmOptions = [
  { label: 'Ed25519 (EdDSA)', value: 'EdDSA' },
  { label: 'P-256 (ES256)', value: 'ES256' },
  { label: 'P-384 (ES384)', value: 'ES384' },
  { label: 'P-521 (ES512)', value: 'ES512' },
];

const curveName = computed(() => getCurveName(algorithm.value));

async function handleGenerateKeyPair() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  keyPair.value = null;
  
  try {
    keyPair.value = await generateKeyPair(algorithm.value);
    message.success(`${curveName.value} key pair generated successfully!`);
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Failed to generate key pair');
    console.error('Key generation error:', error);
  } finally {
    isLoading.value = false;
  }
}

// Download functionality
const { download: downloadPrivateKeyPem } = useDownloadFileFromBase64({
  source: computed(() => btoa(keyPair.value?.privateKeyPem || '')),
  filename: `private-key-${algorithm.value.toLowerCase()}.pem`,
});

const { download: downloadPublicKeyPem } = useDownloadFileFromBase64({
  source: computed(() => btoa(keyPair.value?.publicKeyPem || '')),
  filename: `public-key-${algorithm.value.toLowerCase()}.pem`,
});

const { download: downloadPrivateKeyJwk } = useDownloadFileFromBase64({
  source: computed(() => btoa(keyPair.value?.privateKeyJwk || '')),
  filename: `private-key-${algorithm.value.toLowerCase()}.jwk`,
  fileMimeType: 'application/json',
});

const { download: downloadPublicKeyJwk } = useDownloadFileFromBase64({
  source: computed(() => btoa(keyPair.value?.publicKeyJwk || '')),
  filename: `public-key-${algorithm.value.toLowerCase()}.jwk`,
  fileMimeType: 'application/json',
});
</script>

<template>
  <div>
    <c-card>
      <div class="controls" style="max-width: 600px; margin: 0 auto;">
        <div flex gap-3 items-center>
          <n-form-item :label="$t('tools.ec-ed25519-key-pair-generator.algorithm')" label-placement="left" label-width="100">
            <n-select 
              v-model:value="algorithm" 
              :options="algorithmOptions"
              style="min-width: 200px"
            />
          </n-form-item>
          
          <c-button 
            type="primary" 
            :loading="isLoading"
            @click="handleGenerateKeyPair"
          >
            {{ $t('tools.ec-ed25519-key-pair-generator.generate') }}
          </c-button>
        </div>
        
        <n-divider v-if="keyPair" />
        
        <div v-if="keyPair" class="curve-info">
          <n-tag type="info" size="large">
            {{ $t('tools.ec-ed25519-key-pair-generator.curve') }}: {{ curveName }}
          </n-tag>
        </div>
      </div>
    </c-card>

    <div v-if="keyPair" class="key-outputs">
      <!-- Private Key PEM -->
      <div>
        <div flex items-center justify-between mb-2>
          <h3>{{ $t('tools.ec-ed25519-key-pair-generator.privateKeyPem') }}</h3>
          <c-button size="small" @click="downloadPrivateKeyPem">
            {{ $t('tools.ec-ed25519-key-pair-generator.download') }}
          </c-button>
        </div>
        <TextareaCopyable 
          :value="keyPair.privateKeyPem" 
          language="text"
          :copy-message="$t('tools.ec-ed25519-key-pair-generator.copyPrivateKey')"
        />
      </div>

      <!-- Public Key PEM -->
      <div>
        <div flex items-center justify-between mb-2>
          <h3>{{ $t('tools.ec-ed25519-key-pair-generator.publicKeyPem') }}</h3>
          <c-button size="small" @click="downloadPublicKeyPem">
            {{ $t('tools.ec-ed25519-key-pair-generator.download') }}
          </c-button>
        </div>
        <TextareaCopyable 
          :value="keyPair.publicKeyPem" 
          language="text"
          :copy-message="$t('tools.ec-ed25519-key-pair-generator.copyPublicKey')"
        />
      </div>

      <!-- Private Key JWK -->
      <div>
        <div flex items-center justify-between mb-2>
          <h3>{{ $t('tools.ec-ed25519-key-pair-generator.privateKeyJwk') }}</h3>
          <c-button size="small" @click="downloadPrivateKeyJwk">
            {{ $t('tools.ec-ed25519-key-pair-generator.download') }}
          </c-button>
        </div>
        <TextareaCopyable 
          :value="keyPair.privateKeyJwk" 
          language="json"
          :copy-message="$t('tools.ec-ed25519-key-pair-generator.copyPrivateKeyJwk')"
        />
      </div>

      <!-- Public Key JWK -->
      <div>
        <div flex items-center justify-between mb-2>
          <h3>{{ $t('tools.ec-ed25519-key-pair-generator.publicKeyJwk') }}</h3>
          <c-button size="small" @click="downloadPublicKeyJwk">
            {{ $t('tools.ec-ed25519-key-pair-generator.download') }}
          </c-button>
        </div>
        <TextareaCopyable 
          :value="keyPair.publicKeyJwk" 
          language="json"
          :copy-message="$t('tools.ec-ed25519-key-pair-generator.copyPublicKeyJwk')"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.controls {
  .curve-info {
    text-align: center;
    margin-top: 16px;
  }
}

.key-outputs {
  > div {
    margin-top: 24px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>