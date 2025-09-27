<script setup lang="ts">
import { parseCurlCommand, generateAxios, generateFetch, generateHttpie, generateSqlmap, generatePostmanCollection, generateInsomniaRequest, generatePythonRequests, generateGoHttp, generatePowershell } from './curl-to-code.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const curl = ref("curl -X POST 'https://api.example.com/users?active=true' \\\n+  -H 'Authorization: Bearer <token>' \\\n+  -H 'Content-Type: application/json' \\\n+  --data '{\"name\":\"Alice\",\"age\":30}'");

const target = ref<'fetch' | 'axios' | 'httpie' | 'sqlmap' | 'postman' | 'insomnia' | 'python' | 'go' | 'powershell'>('fetch');

const output = computed(() => {
  const ir = parseCurlCommand(curl.value || '');
  if (!ir) return '';
  if (target.value === 'axios') return generateAxios(ir);
  if (target.value === 'httpie') return generateHttpie(ir);
  if (target.value === 'sqlmap') return generateSqlmap(ir);
  if (target.value === 'postman') return generatePostmanCollection(ir);
  if (target.value === 'insomnia') return generateInsomniaRequest(ir);
  if (target.value === 'python') return generatePythonRequests(ir);
  if (target.value === 'go') return generateGoHttp(ir);
  if (target.value === 'powershell') return generatePowershell(ir);
  return generateFetch(ir);
});
</script>

<template>
  <div>
    <div>
      <n-form-item :label="$t('tools.curl-to-code.input')" style="width: 100%">
        <c-input-text v-model:value="curl" multiline rows="8" monospace raw-text class="w-full" />
      </n-form-item>
    </div>
    <div flex gap-3>
      <n-form-item :label="$t('tools.curl-to-code.target')">
        <n-select
          style="min-width: 180px"
          v-model:value="target"
          :options="[
            { label: 'fetch', value: 'fetch' },
            { label: 'axios', value: 'axios' },
            { label: 'httpie', value: 'httpie' },
            { label: 'sqlmap', value: 'sqlmap' },
            { label: 'Postman (collection JSON)', value: 'postman' },
            { label: 'Insomnia (request JSON)', value: 'insomnia' },
            { label: 'Python (requests)', value: 'python' },
            { label: 'Go (net/http)', value: 'go' },
            { label: 'PowerShell (Invoke-RestMethod)', value: 'powershell' },
          ]"
        />
      </n-form-item>
    </div>
    <n-form-item :label="$t('tools.curl-to-code.result')" style="width: 100%">
      <TextareaCopyable :value="output" language="javascript" class="w-full" />
    </n-form-item>
  </div>
</template>


