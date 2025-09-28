<script setup lang="ts">
const bytesInput = ref('1024');
const dataRateInput = ref('100');
const durationInput = ref('3600');

const bytesBase = ref<'B' | 'KB' | 'KiB' | 'MB' | 'MiB' | 'GB' | 'GiB'>('KiB');
const dataRateBase = ref<'bps' | 'Kbps' | 'Mbps' | 'Gbps'>('Mbps');
const durationBase = ref<'s' | 'ms' | 'min' | 'h' | 'd'>('s');

function parseNumber(text: string) { return Number(text.replace(/_/g, '').trim() || '0'); }

const bytesOutputs = computed(() => {
  const v = parseNumber(bytesInput.value);
  const factor = bytesBase.value.endsWith('iB') ? 1024 : 1000;
  const pow = { B: 0, KB: 1, KiB: 1, MB: 2, MiB: 2, GB: 3, GiB: 3 } as const;
  const inBytes = v * Math.pow(factor, pow[bytesBase.value]);
  return {
    B: inBytes,
    KB: inBytes / 1e3,
    MB: inBytes / 1e6,
    GB: inBytes / 1e9,
    KiB: inBytes / 1024,
    MiB: inBytes / (1024 ** 2),
    GiB: inBytes / (1024 ** 3),
  };
});

const dataRateOutputs = computed(() => {
  const v = parseNumber(dataRateInput.value);
  const pow = { bps: 0, Kbps: 1, Mbps: 2, Gbps: 3 } as const;
  const inBps = v * Math.pow(1000, pow[dataRateBase.value]);
  return {
    bps: inBps,
    Kbps: inBps / 1e3,
    Mbps: inBps / 1e6,
    Gbps: inBps / 1e9,
  };
});

const durationOutputs = computed(() => {
  const v = parseNumber(durationInput.value);
  let seconds = v;
  if (durationBase.value === 'ms') seconds = v / 1000;
  if (durationBase.value === 'min') seconds = v * 60;
  if (durationBase.value === 'h') seconds = v * 3600;
  if (durationBase.value === 'd') seconds = v * 86400;
  return {
    ms: seconds * 1000,
    s: seconds,
    min: seconds / 60,
    h: seconds / 3600,
    d: seconds / 86400,
  };
});
</script>

<template>
  <div grid gap-4>
    <c-card>
      <h3>Bytes</h3>
      <div grid grid-cols-1 md:grid-cols-3 gap-3>
        <n-form-item label="Value"><c-input-text v-model:value="bytesInput" /></n-form-item>
        <n-form-item label="Unit"><n-select v-model:value="bytesBase" :options="['B','KB','KiB','MB','MiB','GB','GiB'].map(v=>({label:v,value:v}))" /></n-form-item>
      </div>
      <n-table size="small"><tbody>
        <tr><td>B</td><td>{{ bytesOutputs.B.toLocaleString() }}</td></tr>
        <tr><td>KB</td><td>{{ bytesOutputs.KB.toLocaleString() }}</td></tr>
        <tr><td>MB</td><td>{{ bytesOutputs.MB.toLocaleString() }}</td></tr>
        <tr><td>GB</td><td>{{ bytesOutputs.GB.toLocaleString() }}</td></tr>
        <tr><td>KiB</td><td>{{ bytesOutputs.KiB.toLocaleString() }}</td></tr>
        <tr><td>MiB</td><td>{{ bytesOutputs.MiB.toLocaleString() }}</td></tr>
        <tr><td>GiB</td><td>{{ bytesOutputs.GiB.toLocaleString() }}</td></tr>
      </tbody></n-table>
    </c-card>

    <c-card>
      <h3>Data rate</h3>
      <div grid grid-cols-1 md:grid-cols-3 gap-3>
        <n-form-item label="Value"><c-input-text v-model:value="dataRateInput" /></n-form-item>
        <n-form-item label="Unit"><n-select v-model:value="dataRateBase" :options="['bps','Kbps','Mbps','Gbps'].map(v=>({label:v,value:v}))" /></n-form-item>
      </div>
      <n-table size="small"><tbody>
        <tr><td>bps</td><td>{{ dataRateOutputs.bps.toLocaleString() }}</td></tr>
        <tr><td>Kbps</td><td>{{ dataRateOutputs.Kbps.toLocaleString() }}</td></tr>
        <tr><td>Mbps</td><td>{{ dataRateOutputs.Mbps.toLocaleString() }}</td></tr>
        <tr><td>Gbps</td><td>{{ dataRateOutputs.Gbps.toLocaleString() }}</td></tr>
      </tbody></n-table>
    </c-card>

    <c-card>
      <h3>Duration</h3>
      <div grid grid-cols-1 md:grid-cols-3 gap-3>
        <n-form-item label="Value"><c-input-text v-model:value="durationInput" /></n-form-item>
        <n-form-item label="Unit"><n-select v-model:value="durationBase" :options="['ms','s','min','h','d'].map(v=>({label:v,value:v}))" /></n-form-item>
      </div>
      <n-table size="small"><tbody>
        <tr><td>ms</td><td>{{ durationOutputs.ms.toLocaleString() }}</td></tr>
        <tr><td>s</td><td>{{ durationOutputs.s.toLocaleString() }}</td></tr>
        <tr><td>min</td><td>{{ durationOutputs.min.toLocaleString() }}</td></tr>
        <tr><td>h</td><td>{{ durationOutputs.h.toLocaleString() }}</td></tr>
        <tr><td>d</td><td>{{ durationOutputs.d.toLocaleString() }}</td></tr>
      </tbody></n-table>
    </c-card>
  </div>
</template>


