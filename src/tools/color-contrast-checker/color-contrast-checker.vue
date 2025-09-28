<script setup lang="ts">
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
extend([a11yPlugin]);

const fg = ref('#000000');
const bg = ref('#ffffff');

const ratio = computed(() => colord(bg.value).contrast(fg.value));
const passesAA = computed(() => ratio.value >= 4.5);
const passesAAA = computed(() => ratio.value >= 7);
</script>

<template>
  <div>
    <n-form label-placement="left" label-width="140">
      <n-form-item label="Foreground color:"><n-color-picker v-model:value="fg" :modes="['hex']" /></n-form-item>
      <n-form-item label="Background color:"><n-color-picker v-model:value="bg" :modes="['hex']" /></n-form-item>
    </n-form>
    <div flex items-center gap-3 my-3>
      <div w-24 h-10 :style="{ backgroundColor: bg, color: fg }" flex items-center justify-center rounded>
        Aa
      </div>
      <div>
        <div>Contrast ratio: {{ ratio.toFixed(2) }}:1</div>
        <div :style="{ color: passesAA ? 'green' : 'red' }">WCAG AA: {{ passesAA ? 'Pass' : 'Fail' }}</div>
        <div :style="{ color: passesAAA ? 'green' : 'red' }">WCAG AAA: {{ passesAAA ? 'Pass' : 'Fail' }}</div>
      </div>
    </div>
  </div>
</template>


