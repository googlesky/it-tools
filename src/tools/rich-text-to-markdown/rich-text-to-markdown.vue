<script setup lang="ts">
import TurndownService from 'turndown';
import { gfm as turndownGfm } from 'turndown-plugin-gfm';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const html = ref('');
const markdown = ref('');
const keepImages = ref(true);
const useGfm = ref(true);
const smartLinks = ref(true);

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
if (useGfm.value) td.use(turndownGfm);

watch([useGfm], () => {
  td.removeRule('gfm');
  const fresh = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  if (useGfm.value) fresh.use(turndownGfm);
  // copy options
  (td as any).options = (fresh as any).options;
});

function convertNow() {
  const service = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  if (useGfm.value) service.use(turndownGfm);

  if (!keepImages.value) {
    service.addRule('removeImages', {
      filter: 'img',
      replacement: () => '',
    });
  }

  if (smartLinks.value) {
    service.addRule('smartLinks', {
      filter: (node) => node.nodeName === 'A' && (node as HTMLAnchorElement).textContent === (node as HTMLAnchorElement).href,
      replacement: (_content, node) => {
        const href = (node as HTMLAnchorElement).getAttribute('href') || '';
        return `<${href}>`;
      },
    });
  }

  markdown.value = service.turndown(html.value);
}

onMounted(() => {
  try {
    const stored = localStorage.getItem('rtmd:clipboard');
    if (stored) {
      html.value = stored;
      localStorage.removeItem('rtmd:clipboard');
      convertNow();
    }
  }
  catch {}
});

async function onPaste(e: ClipboardEvent) {
  const dt = e.clipboardData;
  if (!dt) return;
  const htmlData = dt.getData('text/html');
  const rtf = dt.getData('text/rtf');
  const plain = dt.getData('text/plain');

  if (htmlData) {
    html.value = htmlData;
  }
  else if (rtf) {
    // Let the browser render RTF into HTML via hidden contenteditable element
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.style.position = 'fixed';
    div.style.left = '-9999px';
    document.body.appendChild(div);
    div.focus();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    document.execCommand('insertText', false, rtf);
    html.value = div.innerHTML;
    div.remove();
  }
  else if (plain) {
    html.value = `<pre>${plain.replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s] as string))}</pre>`;
  }

  e.preventDefault();
  convertNow();
}
</script>

<template>
  <c-card>
    <n-grid cols="1 900:2" x-gap="12" y-gap="12">
      <n-gi>
        <div class="mb-2 opacity-80">Paste rich text (HTML/RTF) here:</div>
        <c-input-text
          v-model:value="html"
          raw-text
          multiline
          rows="12"
          class="w-full"
          placeholder="Paste from clipboard (Ctrl+V) or drop HTML here..."
          @paste="onPaste"
        />
        <n-form class="mt-3" label-width="160" label-placement="left">
          <n-form-item label="Use GitHub Flavored Markdown">
            <n-switch v-model:value="useGfm" />
          </n-form-item>
          <n-form-item label="Keep <img> tags">
            <n-switch v-model:value="keepImages" />
          </n-form-item>
          <n-form-item label="Smart autolinks">
            <n-switch v-model:value="smartLinks" />
          </n-form-item>
          <n-button type="primary" @click="convertNow">Convert</n-button>
        </n-form>
      </n-gi>
      <n-gi>
        <n-form-item label="Markdown">
          <TextareaCopyable :value="markdown" language="markdown" class="w-full" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>
</template>


