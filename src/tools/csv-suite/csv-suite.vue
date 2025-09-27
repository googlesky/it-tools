<script setup lang="ts">
import Papa from 'papaparse';
import JSON5 from 'json5';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

type Mode = 'csv-to-json' | 'json-to-csv'

const mode = ref<Mode>('csv-to-json');
const csvInput = ref('name,age\nAlice,20\nBob,30');
const jsonInput = ref('[{"name":"Alice","age":20},{"name":"Bob","age":30}]');

const delimiter = ref<string | null>(null);
const header = ref(true);
const quoteChar = ref('"');
const escapeChar = ref('"');

function detectDialect(csv: string) {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestScore = -1;
  for (const d of candidates) {
    const lines = csv.split(/\r?\n/).slice(0, 15).filter(Boolean);
    const counts = lines.map(l => l.split(d).length);
    const unique = new Set(counts).size;
    const avg = counts.reduce((a, b) => a + b, 0) / Math.max(1, counts.length);
    const score = (avg > 1 ? 1 : 0) + (unique <= 2 ? 1 : 0);
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

const jsonOutput = computed(() => {
  if (mode.value !== 'csv-to-json') return '';
  const d = delimiter.value || detectDialect(csvInput.value);
  const res = Papa.parse<string[]>(csvInput.value, {
    delimiter: d,
    header: header.value,
    quoteChar: quoteChar.value || '"',
    escapeChar: escapeChar.value || '"',
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  if (res.errors?.length) {
    return res.errors.map(e => `Row ${e.row ?? '-'}: ${e.message}`).join('\n');
  }
  const data = res.data as any[];
  return JSON.stringify(data, null, 2);
});

const csvOutput = computed(() => {
  if (mode.value !== 'json-to-csv') return '';
  const arr = JSON5.parse(jsonInput.value || '[]');
  return Papa.unparse(arr, {
    quotes: false,
    delimiter: delimiter.value || ',',
    header: header.value,
    quoteChar: quoteChar.value || '"',
    escapeChar: escapeChar.value || '"',
  });
});
</script>

<template>
  <div>
    <div flex gap-3>
      <n-form-item :label="$t('tools.csv-suite.mode')">
        <n-select v-model:value="mode" :options="[
          { label: 'CSV → JSON', value: 'csv-to-json' },
          { label: 'JSON → CSV', value: 'json-to-csv' },
        ]" style="min-width: 180px" />
      </n-form-item>
      <n-form-item :label="$t('tools.csv-suite.header')"><n-switch v-model:value="header" /></n-form-item>
      <n-form-item :label="$t('tools.csv-suite.delimiter')"><c-input-text v-model:value="delimiter" placeholder="," raw-text /></n-form-item>
      <n-form-item :label="$t('tools.csv-suite.quoteChar')"><c-input-text v-model:value="quoteChar" placeholder='"' raw-text /></n-form-item>
      <n-form-item :label="$t('tools.csv-suite.escapeChar')"><c-input-text v-model:value="escapeChar" placeholder='"' raw-text /></n-form-item>
    </div>

    <div v-if="mode==='csv-to-json'">
      <n-form-item :label="$t('tools.csv-suite.csvInput')" style="width: 100%"><c-input-text v-model:value="csvInput" multiline rows="10" monospace raw-text class="w-full" /></n-form-item>
      <n-form-item :label="$t('tools.csv-suite.jsonOutput')" style="width: 100%"><TextareaCopyable :value="jsonOutput" language="json" class="w-full" /></n-form-item>
    </div>

    <div v-else>
      <n-form-item :label="$t('tools.csv-suite.jsonInput')" style="width: 100%"><c-input-text v-model:value="jsonInput" multiline rows="10" monospace raw-text class="w-full" /></n-form-item>
      <n-form-item :label="$t('tools.csv-suite.csvOutput')" style="width: 100%"><TextareaCopyable :value="csvOutput" language="csv" class="w-full" /></n-form-item>
    </div>
  </div>
</template>


