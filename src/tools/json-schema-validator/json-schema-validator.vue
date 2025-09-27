<script setup lang="ts">
import Ajv from 'ajv';
import JSON5 from 'json5';
import { withDefaultOnError } from '@/utils/defaults';

const ajv = new Ajv({ allErrors: true, strict: false });

const rawJson = ref('{"name": "John", "age": 30}');
const rawSchema = ref('{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "number"}}, "required": ["name", "age"], "additionalProperties": false}');

const errorsText = computed(() => withDefaultOnError(() => {
  const data = JSON5.parse(rawJson.value);
  const schema = JSON5.parse(rawSchema.value);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (valid) return 'Valid ✅';
  return (validate.errors || []).map(e => `${e.instancePath || '/'} ${e.message}`).join('\n');
}, ''));
</script>

<template>
  <div>
    <n-form-item label="JSON">
      <c-input-text v-model:value="rawJson" multiline rows="12" monospace raw-text />
    </n-form-item>
    <n-form-item label="Schema">
      <c-input-text v-model:value="rawSchema" multiline rows="12" monospace raw-text />
    </n-form-item>
    <n-form-item label="Result">
      <TextareaCopyable :value="errorsText" language="txt" />
    </n-form-item>
  </div>
</template>


