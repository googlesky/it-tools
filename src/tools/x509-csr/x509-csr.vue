<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { withDefaultOnError } from '@/utils/defaults';
import { parseCertificatePem, parseCsrPem, generateCsr } from './x509-csr.service';

const certPem = ref('');
const certInfo = computed(() => withDefaultOnError(() => certPem.value.trim() ? parseCertificatePem(certPem.value) : undefined, undefined));

const csrPem = ref('');
const csrInfo = computed(() => withDefaultOnError(() => csrPem.value.trim() ? parseCsrPem(csrPem.value) : undefined, undefined));

const privateKeyPem = ref('');
const cn = ref('');
const o = ref('');
const ou = ref('');
const c = ref('');
const st = ref('');
const l = ref('');
const email = ref('');
const sanText = ref('');
const hash = ref<'sha256' | 'sha384' | 'sha512'>('sha256');
const generatedCsr = ref('');

function doGenerateCsr() {
  try {
    const san = sanText.value.split(/\s|,|;|\n/).map(v => v.trim()).filter(Boolean);
    generatedCsr.value = generateCsr({
      privateKeyPem: privateKeyPem.value,
      subject: { CN: cn.value, O: o.value, OU: ou.value, C: c.value, ST: st.value, L: l.value, emailAddress: email.value },
      san,
      hash: hash.value,
    });
  }
  catch (e: any) {
    generatedCsr.value = String(e?.message ?? e);
  }
}
</script>

<template>
  <div grid gap-4>
    <c-card>
      <h3 mb-3>{{ $t('tools.x509-csr.decodeCert') }}</h3>
      <c-input-text v-model:value="certPem" multiline rows="8" monospace raw-text placeholder="-----BEGIN CERTIFICATE-----" />
      <div v-if="certInfo" mt-4>
        <n-table size="small">
          <tbody>
            <tr><td>Subject</td><td><pre>{{ JSON.stringify(certInfo.subject, null, 2) }}</pre></td></tr>
            <tr><td>Issuer</td><td><pre>{{ JSON.stringify(certInfo.issuer, null, 2) }}</pre></td></tr>
            <tr><td>Serial</td><td>{{ certInfo.serialNumberHex }}</td></tr>
            <tr><td>Valid from</td><td>{{ certInfo.validFrom }}</td></tr>
            <tr><td>Valid to</td><td>{{ certInfo.validTo }}</td></tr>
            <tr><td>Signature alg</td><td>{{ certInfo.signatureAlgorithm }}</td></tr>
            <tr><td>Public key alg</td><td>{{ certInfo.publicKeyAlgorithm }}</td></tr>
            <tr v-if="certInfo.san?.length"><td>SAN</td><td>{{ certInfo.san.join(', ') }}</td></tr>
            <tr v-if="certInfo.fingerprintSHA1"><td>SHA1</td><td>{{ certInfo.fingerprintSHA1 }}</td></tr>
            <tr v-if="certInfo.fingerprintSHA256"><td>SHA256</td><td>{{ certInfo.fingerprintSHA256 }}</td></tr>
          </tbody>
        </n-table>
      </div>
    </c-card>

    <c-card>
      <h3 mb-3>{{ $t('tools.x509-csr.decodeCsr') }}</h3>
      <c-input-text v-model:value="csrPem" multiline rows="8" monospace raw-text placeholder="-----BEGIN CERTIFICATE REQUEST-----" />
      <div v-if="csrInfo" mt-4>
        <n-table size="small">
          <tbody>
            <tr><td>Subject</td><td><pre>{{ JSON.stringify(csrInfo.subject, null, 2) }}</pre></td></tr>
            <tr v-if="Object.keys(csrInfo.attributes).length"><td>Attributes</td><td><pre>{{ JSON.stringify(csrInfo.attributes, null, 2) }}</pre></td></tr>
            <tr v-if="csrInfo.san?.length"><td>SAN</td><td>{{ csrInfo.san.join(', ') }}</td></tr>
          </tbody>
        </n-table>
      </div>
    </c-card>

    <c-card>
      <h3 mb-3>{{ $t('tools.x509-csr.generateCsr') }}</h3>
      <div grid grid-cols-1 md:grid-cols-2 gap-3>
        <n-form-item label="Private key (PKCS#8)"><c-input-text v-model:value="privateKeyPem" multiline rows="6" monospace raw-text /></n-form-item>
        <div grid grid-cols-2 gap-2>
          <n-form-item label="CN"><c-input-text v-model:value="cn" /></n-form-item>
          <n-form-item label="O"><c-input-text v-model:value="o" /></n-form-item>
          <n-form-item label="OU"><c-input-text v-model:value="ou" /></n-form-item>
          <n-form-item label="C"><c-input-text v-model:value="c" /></n-form-item>
          <n-form-item label="ST"><c-input-text v-model:value="st" /></n-form-item>
          <n-form-item label="L"><c-input-text v-model:value="l" /></n-form-item>
          <n-form-item label="email"><c-input-text v-model:value="email" /></n-form-item>
          <n-form-item label="Hash">
            <n-select v-model:value="hash" :options="[
              { label: 'SHA-256', value: 'sha256' },
              { label: 'SHA-384', value: 'sha384' },
              { label: 'SHA-512', value: 'sha512' },
            ]" />
          </n-form-item>
          <n-form-item label="SAN (comma or newline)"><c-input-text v-model:value="sanText" multiline rows="3" /></n-form-item>
        </div>
      </div>
      <div mt-2>
        <n-button type="primary" @click="doGenerateCsr">Generate CSR</n-button>
      </div>
      <n-form-item label="CSR" mt-3>
        <TextareaCopyable :value="generatedCsr" />
      </n-form-item>
    </c-card>
  </div>
</template>


