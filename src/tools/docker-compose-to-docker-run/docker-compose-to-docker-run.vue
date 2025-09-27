<script setup lang="ts">
import { parse } from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const compose = ref('version: "3"\nservices:\n  app:\n    image: nginx\n    ports:\n      - "8080:80"\n    environment:\n      - NGINX_HOST=localhost\n    volumes:\n      - ./data:/data\n    restart: unless-stopped\n');

function toDockerRun(yml: string): string {
  if (!yml.trim()) return '';
  const doc = parse(yml) as any;
  const services = (doc?.services ?? {}) as Record<string, any>;
  const firstName = Object.keys(services)[0];
  if (!firstName) return '';
  const s = services[firstName];
  const parts: string[] = ['docker run -d'];
  // name
  parts.push(`--name ${firstName}`);
  // ports
  for (const p of s?.ports ?? []) parts.push(`-p ${String(p).replace(/\s+/g,'')}`);
  // env
  const env = s?.environment ?? [];
  if (Array.isArray(env)) for (const e of env) parts.push(`-e ${e}`);
  else for (const [k, v] of Object.entries(env)) parts.push(`-e ${k}=${v}`);
  // volumes
  for (const v of s?.volumes ?? []) parts.push(`-v ${String(v)}`);
  // restart
  if (s?.restart) parts.push(`--restart ${s.restart}`);
  // network
  if (s?.network_mode) parts.push(`--network ${s.network_mode}`);
  // image / command
  if (s?.image) parts.push(s.image);
  if (s?.command) parts.push(Array.isArray(s.command) ? s.command.join(' ') : String(s.command));
  return parts.join(' ');
}

const result = computed(() => toDockerRun(compose.value));
</script>

<template>
  <div>
    <n-form-item :label="$t('tools.docker-compose-to-docker-run.input')" style="width: 100%">
      <c-input-text v-model:value="compose" multiline rows="12" monospace raw-text class="w-full" />
    </n-form-item>
    <n-form-item :label="$t('tools.docker-compose-to-docker-run.result')" style="width: 100%">
      <TextareaCopyable :value="result" language="bash" class="w-full" />
    </n-form-item>
  </div>
</template>


