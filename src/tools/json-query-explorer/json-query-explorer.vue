<script setup lang="ts">
import { JSONPath } from 'jsonpath-plus';
import jmespath from 'jmespath';
import JSON5 from 'json5';
import { withDefaultOnError } from '@/utils/defaults';

const rawJson = ref('{"users": [{"name": "Alice", "age": 20}, {"name": "Bob", "age": 30}] }');
const query = ref('$.users[*].name');
const engine = ref<'jsonpath' | 'jmespath'>('jsonpath');

const result = computed(() => withDefaultOnError(() => {
  const data = JSON5.parse(rawJson.value);
  if (engine.value === 'jsonpath') {
    return JSON.stringify(JSONPath({ json: data, path: query.value }), null, 2);
  }
  return JSON.stringify(jmespath.search(data, query.value), null, 2);
}, ''));
</script>

<template>
  <div>
    <div flex gap-3>
      <n-form-item label="Engine"><n-select v-model:value="engine" :options="[
        { label: 'JSONPath', value: 'jsonpath' },
        { label: 'JMESPath', value: 'jmespath' }
      ]" style="min-width: 180px" /></n-form-item>
      <n-form-item label="Query" style="flex:1"><c-input-text v-model:value="query" monospace raw-text /></n-form-item>
    </div>
    <n-form-item label="JSON" style="width: 100%"><c-input-text v-model:value="rawJson" multiline rows="12" monospace raw-text class="w-full" /></n-form-item>
    <n-form-item label="Result" style="width: 100%"><TextareaCopyable :value="result" language="json" class="w-full" /></n-form-item>
  </div>
</template>


