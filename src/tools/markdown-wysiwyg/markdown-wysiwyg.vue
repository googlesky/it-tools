<script setup lang="ts">
import 'md-editor-v3/lib/style.css';
import { MdEditor } from 'md-editor-v3';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useStyleStore } from '@/stores/style.store';
import { useI18n } from 'vue-i18n';

const content = ref<string>('# Markdown WYSIWYG\n\nStart typing...');
const html = ref('');
const styleStore = useStyleStore();
const { locale, t } = useI18n();

function onChange(v: string) {
  content.value = v;
}

const mdLang = computed(() => {
  const l = String(locale.value || 'en').toLowerCase();
  if (l.startsWith('zh')) return 'zh-CN';
  if (l.startsWith('pt')) return 'pt-BR';
  // Fallback
  return 'en-US';
});
</script>

<template>
  <c-card>
    <div class="mb-2 opacity-80">Markdown editor:</div>
    <MdEditor
      v-model="content"
      :theme="styleStore.isDarkTheme ? 'dark' : 'light'"
      :preview-theme="styleStore.isDarkTheme ? 'github-dark' : 'github'"
      :code-theme="styleStore.isDarkTheme ? 'atom' : 'github'"
      :language="mdLang"
      @on-change="onChange"
      style="--md-color: var(--c-text-color); --md-bk-color: var(--c-bg-color);"
    />
    <n-divider />
    <n-form-item label="Markdown">
      <TextareaCopyable :value="content" language="markdown" class="w-full" />
    </n-form-item>
  </c-card>
</template>


