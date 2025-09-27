<script setup lang="ts">
import YAML from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';

const raw = ref('');
const spec = ref<any>(null);
const errorMsg = ref('');
const selectedPath = ref<string>('');
const selectedMethod = ref<HttpMethod | ''>('');

function parseSpec() {
  try {
    errorMsg.value = '';
    const txt = raw.value.trim();
    if (!txt) { spec.value = null; return; }
    spec.value = txt.startsWith('{') ? JSON.parse(txt) : YAML.parse(txt);
    selectedPath.value = '';
    selectedMethod.value = '';
  }
  catch (e: any) {
    spec.value = null;
    errorMsg.value = String(e?.message || e);
  }
}

const pathsList = computed(() => {
  const s = spec.value; if (!s?.paths) return [] as string[];
  return Object.keys(s.paths);
});

const methodsForSelectedPath = computed(() => {
  const s = spec.value; if (!s || !selectedPath.value) return [] as HttpMethod[];
  const obj = s.paths[selectedPath.value] || {};
  return Object.keys(obj).filter(k => ['get','post','put','patch','delete','head','options','trace'].includes(k)) as HttpMethod[];
});

const endpoint = computed(() => {
  if (!spec.value || !selectedPath.value || !selectedMethod.value) return null;
  return spec.value.paths[selectedPath.value]?.[selectedMethod.value] || null;
});

const sampleRequest = computed(() => {
  if (!endpoint.value) return '';
  const baseUrl = spec.value?.servers?.[0]?.url || 'https://api.example.com';
  const url = `${baseUrl}${selectedPath.value}`;
  const headers: Record<string,string> = { 'accept': 'application/json' };
  let body = '';
  const reqBody = endpoint.value.requestBody?.content?.['application/json']?.schema;
  if (reqBody) body = JSON.stringify(exampleFromSchema(reqBody), null, 2);
  const method = selectedMethod.value.toUpperCase();
  const lines = [`fetch('${url}', {`, `  method: '${method}',`, `  headers: ${JSON.stringify(headers, null, 2)}`];
  if (body) lines.push(`  ,body: ${JSON.stringify(body)}`);
  lines.push('})');
  return lines.join('\n');
});

function exampleFromSchema(schema: any): any {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number' || schema.type === 'integer') return 0;
  if (schema.type === 'boolean') return true;
  if (schema.type === 'array') return [exampleFromSchema(schema.items || {})];
  if (schema.type === 'object' || schema.properties) {
    const obj: any = {};
    Object.entries(schema.properties || {}).forEach(([k, v]: any) => { obj[k] = exampleFromSchema(v); });
    return obj;
  }
  return null;
}
</script>

<template>
  <c-card>
    <n-grid cols="1 1100:2" x-gap="12" y-gap="12">
      <n-gi>
        <div class="mb-2 opacity-80">OpenAPI (YAML/JSON):</div>
        <c-input-text v-model:value="raw" multiline rows="16" class="w-full" placeholder="Paste OpenAPI spec here..." />
        <div class="mt-2 flex gap-2">
          <n-button type="primary" @click="parseSpec">Parse</n-button>
        </div>
        <c-alert v-if="errorMsg" type="error" class="mt-2">{{ errorMsg }}</c-alert>
      </n-gi>
      <n-gi>
        <div v-if="spec">
          <n-grid cols="1 1100:2" x-gap="12" y-gap="12">
            <n-gi>
              <n-form label-placement="top">
                <n-form-item label="Path">
                  <n-select v-model:value="selectedPath" :options="pathsList.map(p => ({ label: p, value: p }))" filterable />
                </n-form-item>
                <n-form-item label="Method">
                  <n-select v-model:value="selectedMethod" :options="methodsForSelectedPath.map(m => ({ label: m.toUpperCase(), value: m }))" />
                </n-form-item>
              </n-form>
            </n-gi>
            <n-gi>
              <div v-if="endpoint">
                <div class="mb-2 text-sm opacity-80">Summary:</div>
                <div class="mb-3">{{ endpoint.summary || endpoint.operationId || '—' }}</div>
                <div class="mb-2 text-sm opacity-80">Fetch sample:</div>
                <TextareaCopyable :value="sampleRequest" language="javascript" class="w-full" />
              </div>
            </n-gi>
          </n-grid>
        </div>
      </n-gi>
    </n-grid>
  </c-card>
</template>


