<script setup lang="ts">
const input = ref('hello');
const output = ref('');
const mode = ref<'gzip' | 'deflate' | 'brotli'>('gzip');
const action = ref<'compress' | 'decompress'>('compress');

async function run() {
  output.value = '';
  try {
    if (mode.value === 'brotli') {
      if (action.value === 'compress') {
        const compressed = await (window as any).CompressionStream ? await compressStream('br', input.value) : await compressBrotliWasm(input.value);
        output.value = btoa(String.fromCharCode(...new Uint8Array(compressed)));
      }
      else {
        const bytes = Uint8Array.from(atob(input.value), c => c.charCodeAt(0));
        const decompressed = await ((window as any).DecompressionStream ? await decompressStream('br', bytes) : await decompressBrotliWasm(bytes));
        output.value = new TextDecoder().decode(decompressed);
      }
      return;
    }

    const format = mode.value === 'gzip' ? 'gzip' : 'deflate-raw';
    if (action.value === 'compress') {
      const compressed = await compressStream(format, input.value);
      output.value = btoa(String.fromCharCode(...new Uint8Array(compressed)));
    }
    else {
      const bytes = Uint8Array.from(atob(input.value), c => c.charCodeAt(0));
      const decompressed = await decompressStream(format, bytes);
      output.value = new TextDecoder().decode(decompressed);
    }
  }
  catch (e: any) {
    output.value = String(e?.message ?? e);
  }
}

async function compressStream(format: 'gzip' | 'deflate' | 'deflate-raw' | 'br', text: string) {
  const stream = new (window as any).CompressionStream(format);
  const writer = stream.writable.getWriter();
  await writer.write(new TextEncoder().encode(text));
  await writer.close();
  const buf = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompressStream(format: 'gzip' | 'deflate' | 'deflate-raw' | 'br', data: Uint8Array) {
  const stream = new (window as any).DecompressionStream(format);
  const writer = stream.writable.getWriter();
  await writer.write(data);
  await writer.close();
  const buf = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buf);
}

async function compressBrotliWasm(text: string) {
  throw new Error('Brotli not supported in this browser');
}

async function decompressBrotliWasm(bytes: Uint8Array) {
  throw new Error('Brotli not supported in this browser');
}
</script>

<template>
  <div>
    <div grid grid-cols-1 md:grid-cols-2 gap-3>
      <n-form-item label="Mode"><n-select v-model:value="mode" :options="['gzip','deflate','brotli'].map(v=>({label:v,value:v}))" /></n-form-item>
      <n-form-item label="Action"><n-select v-model:value="action" :options="['compress','decompress'].map(v=>({label:v,value:v}))" /></n-form-item>
    </div>
    <n-form-item label="Input"><c-input-text v-model:value="input" multiline rows="8" /></n-form-item>
    <n-button type="primary" @click="run">Run</n-button>
    <n-form-item label="Output" mt-3><c-input-text v-model:value="output" multiline rows="8" monospace raw-text /></n-form-item>
  </div>
</template>


