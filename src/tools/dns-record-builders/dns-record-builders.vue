<script setup lang="ts">
const domain = ref('example.com');

// SPF
const spfV = ref<'spf1'>('spf1');
const spfIncludes = ref('spf.protection.outlook.com');
const spfAll = ref<'~all' | '-all' | '?all' | '+all'>('~all');
const spf = computed(() => `v=${spfV.value} include:${spfIncludes.value} ${spfAll.value}`);

// DKIM
const dkimSelector = ref('default');
const dkimKey = ref('');
const dkimTxt = computed(() => dkimKey.value.trim() ? `v=DKIM1; k=rsa; p=${dkimKey.value.trim()}` : '');

// DMARC
const dmarcPolicy = ref<'none' | 'quarantine' | 'reject'>('none');
const dmarcRua = ref('mailto:dmarc@example.com');
const dmarcPct = ref(100);
const dmarcTxt = computed(() => `v=DMARC1; p=${dmarcPolicy.value}; rua=${dmarcRua.value}; pct=${dmarcPct.value}`);
</script>

<template>
  <div grid gap-4>
    <c-card>
      <h3>SPF</h3>
      <div grid grid-cols-1 md:grid-cols-3 gap-3>
        <n-form-item label="Include"><c-input-text v-model:value="spfIncludes" /></n-form-item>
        <n-form-item label="All"><n-select v-model:value="spfAll" :options="['~all','-all','?all','+all'].map(v=>({label:v,value:v}))" /></n-form-item>
      </div>
      <n-form-item label="TXT record"><c-input-text :value="spf" readonly monospace raw-text /></n-form-item>
      <div mt-2>Host: <code>{{ domain }}</code> → TXT</div>
    </c-card>

    <c-card>
      <h3>DKIM</h3>
      <div grid grid-cols-1 md:grid-cols-2 gap-3>
        <n-form-item label="Selector"><c-input-text v-model:value="dkimSelector" /></n-form-item>
        <n-form-item label="Public key (base64 without headers)"><c-input-text v-model:value="dkimKey" multiline rows="4" monospace raw-text /></n-form-item>
      </div>
      <n-form-item label="TXT record"><c-input-text :value="dkimTxt" readonly monospace raw-text /></n-form-item>
      <div mt-2>Host: <code>{{ dkimSelector }}._domainkey.{{ domain }}</code> → TXT</div>
    </c-card>

    <c-card>
      <h3>DMARC</h3>
      <div grid grid-cols-1 md:grid-cols-3 gap-3>
        <n-form-item label="Policy"><n-select v-model:value="dmarcPolicy" :options="['none','quarantine','reject'].map(v=>({label:v,value:v}))" /></n-form-item>
        <n-form-item label="RUA"><c-input-text v-model:value="dmarcRua" /></n-form-item>
        <n-form-item label="pct"><n-input-number v-model:value="dmarcPct" min="1" max="100" /></n-form-item>
      </div>
      <n-form-item label="TXT record"><c-input-text :value="dmarcTxt" readonly monospace raw-text /></n-form-item>
      <div mt-2>Host: <code>_dmarc.{{ domain }}</code> → TXT</div>
    </c-card>
  </div>
</template>


