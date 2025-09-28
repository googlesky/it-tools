<script setup lang="ts">
// Lazy import sheetjs only when used to keep bundle lean.
let XLSX: any;
const file = ref<File | null>(null);
const sheets = ref<string[]>([]);
const activeSheet = ref('');
const rows = ref<any[][]>([]);

async function onUpload(f: File) {
  file.value = f;
  if (!XLSX) {
    const mod: any = await import('xlsx');
    XLSX = mod.default || mod;
  }
  const buf = await f.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  sheets.value = wb.SheetNames;
  activeSheet.value = sheets.value[0];
  loadSheet(wb, activeSheet.value);
}

function loadSheet(wb: any, name: string) {
  const ws = wb.Sheets[name];
  rows.value = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
}

async function onSelectSheet(name: string) {
  if (!file.value) return;
  if (!XLSX) {
    const mod: any = await import('xlsx');
    XLSX = mod.default || mod;
  }
  const buf = await file.value.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  activeSheet.value = name;
  loadSheet(wb, name);
}
</script>

<template>
  <div>
    <c-file-upload title="Drag and drop an XLSX file here, or click to select a file" accept=".xlsx" @file-upload="onUpload" />
    <div v-if="file" mt-4>
      <n-tabs type="line" :value="activeSheet" @update:value="onSelectSheet">
        <n-tab v-for="s in sheets" :key="s" :name="s">{{ s }}</n-tab>
      </n-tabs>
      <n-data-table :columns="rows[0]?.map((_, i) => ({ title: String(rows[0][i] ?? ('Col ' + (i+1))), key: 'c'+i }))" :data="rows.slice(1).map(r => Object.fromEntries(r.map((v,i)=>['c'+i, v])))" size="small" :paginate="false" />
    </div>
  </div>
</template>


