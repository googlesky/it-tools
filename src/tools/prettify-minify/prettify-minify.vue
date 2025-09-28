<script setup lang="ts">
const language = ref<'html' | 'css' | 'javascript'>('html');
const mode = ref<'format' | 'minify'>('format');
const input = ref('<div>  hello</div>');
const output = ref('');

async function run() {
  output.value = '';
  try {
    if (mode.value === 'format') {
      const prettierMod: any = await import('prettier/standalone');
      const prettier = prettierMod.default || prettierMod;
      const pluginHtml = (await import('prettier/plugins/html')).default as any;
      const pluginBabel = (await import('prettier/plugins/babel')).default as any;
      const pluginPostcss = (await import('prettier/plugins/postcss')).default as any;
      const parser = language.value === 'html' ? 'html' : (language.value === 'css' ? 'css' : 'babel');
      output.value = await prettier.format(input.value, { parser, plugins: [pluginHtml, pluginBabel, pluginPostcss] as any });
      return;
    }

    if (language.value === 'javascript') {
      const terserMod: any = await import('terser');
      const terser = terserMod.default || terserMod;
      const res = await terser.minify(input.value);
      output.value = res.code || '';
      return;
    }
    if (language.value === 'css') {
      const cssoMod: any = await import('csso');
      const csso = cssoMod.default || cssoMod;
      output.value = (csso as any).minify(input.value).css;
      return;
    }
    if (language.value === 'html') {
      // lightweight html minify
      output.value = input.value.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');
      return;
    }
  }
  catch (e: any) {
    output.value = String(e?.message ?? e);
  }
}
</script>

<template>
  <div>
    <div grid grid-cols-1 md:grid-cols-3 gap-3>
      <n-form-item label="Language"><n-select v-model:value="language" :options="['html','css','javascript'].map(v=>({label:v,value:v}))" /></n-form-item>
      <n-form-item label="Mode"><n-select v-model:value="mode" :options="['format','minify'].map(v=>({label:v,value:v}))" /></n-form-item>
      <n-button type="primary" @click="run">Run</n-button>
    </div>
    <n-grid cols="1 1000:2" x-gap="12" y-gap="12">
      <n-gi>
        <n-form-item label="Input"><c-input-text v-model:value="input" multiline rows="10" monospace raw-text /></n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Output"><c-input-text v-model:value="output" multiline rows="10" monospace raw-text /></n-form-item>
      </n-gi>
    </n-grid>
  </div>
</template>


