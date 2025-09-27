<script setup lang="ts">
import figlet from 'figlet';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const input = ref('Ascii ART');
const font = useStorage('ascii-text-drawer:font', 'Standard');
const width = useStorage('ascii-text-drawer:width', 80);
const output = ref('');
const errored = ref(false);
const processing = ref(false);

// Load fonts locally via dynamic imports to avoid any CORS/external CDN issues
// Vite will code-split these and load on demand
const fontModules = import.meta.glob('/node_modules/figlet/importable-fonts/*.js');
const loadedFonts = new Set<string>();

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function ensureFontLoaded(fontName: string) {
  if (loadedFonts.has(fontName)) return;

  const normalizedTarget = normalizeName(fontName);
  const entries = Object.entries(fontModules);

  const matched = entries.find(([path]) => {
    const base = path.substring(path.lastIndexOf('/') + 1, path.length - 3); // remove .js
    return normalizeName(base.replace(/_/g, ' ')) === normalizedTarget;
  });

  if (!matched) {
    throw new Error(`Font module not found for ${fontName}`);
  }

  const loader = matched[1] as () => Promise<{ default: string }>;
  const mod = await loader();
  figlet.parseFont(fontName as any, mod.default);
  loadedFonts.add(fontName);
}

watchEffect(async () => {
  processing.value = true;
  try {
    await ensureFontLoaded(font.value);
    const options: figlet.Options = {
      font: font.value as any,
      width: width.value,
      whitespaceBreak: true,
    };
    output.value = await (new Promise<string>((resolve, reject) =>
      figlet.text(input.value, options,
        (err, text) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(text ?? '');
        })));
    errored.value = false;
  }
  catch (e: any) {
    errored.value = true;
  }
  processing.value = false;
});

// Keep a reasonable curated list (all fonts exist in figlet/importable-fonts)
const fonts = ['Standard', '3-D', '3D Diagonal', '3D-ASCII', '3x5', '4Max', '5 Line Oblique', 'Banner', 'Banner3-D', 'Banner3', 'Banner4', 'Basic', 'Big', 'Bigfig', 'Block', 'Bloody', 'Bubble', 'Calvin S', 'Cola', 'Colossal', 'Computer', 'Contessa', 'Cosmike', 'Cyberlarge', 'Cybermedium', 'Cybersmall', 'Doh', 'Doom', 'Dot Matrix', 'Electronic', 'Elite', 'Fire Font-s', 'Flipped', 'Flower Power', 'Fraktur', 'Ghost', 'Ghoulish', 'Gothic', 'Graffiti', 'Greek', 'Hex', 'Hollywood', 'Isometric1', 'Isometric2', 'Isometric3', 'Isometric4', 'Italic', 'Ivrit', 'Jerusalem', 'Larry 3D', 'Lean', 'Letters', 'Linux', 'Marquee', 'Mini', 'Mirror', 'Nancyj', 'Ogre', 'Pawp', 'Puffy', 'Rectangles', 'Relief', 'Relief2', 'Reverse', 'Roman', 'Rounded', 'Runic', 'Runyc', 'Serifcap', 'Shadow', 'Slant', 'Small', 'Small Slant', 'Speed', 'Star Wars', 'Straight', 'Swamp Land', 'Swan', 'Sweet', 'Term', 'Thick', 'Thin', 'Three Point', 'Tinker-Toy', 'Tombstone', 'Train', 'Trek', 'Tubular', 'USA Flag', 'Univers', 'Varsity', 'Weird', 'Whimsy'];
</script>

<template>
<c-card style="max-width: 900px;">
    <c-input-text
      v-model:value="input"
      label="Your text:"
      placeholder="Your text to draw"
      raw-text
      multiline
      rows="4"
    />

    <n-divider />

    <n-grid cols="4" x-gap="12" w-full>
      <n-gi span="2">
        <c-select
          v-model:value="font"
          label-position="top"
          label="Font:"
          :options="fonts"
          searchable="true"
          placeholder="Select font to use"
        />
      </n-gi>
      <n-gi span="2">
        <n-form-item label="Width:" label-placement="top" label-width="100" :show-feedback="false">
          <n-input-number v-model:value="width" min="0" max="10000" w-full placeholder="Width of the text" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-divider />

    <div v-if="processing" flex items-center justify-center>
      <n-spin size="medium" />
      <span class="ml-2">Loading font...</span>
    </div>

    <c-alert v-if="errored" mt-1 text-center type="error">
      Current settings resulted in error.
    </c-alert>

    <n-form-item v-if="!processing && !errored" label="Ascii Art text:">
      <TextareaCopyable
        :value="output"
        mb-1 mt-1
        copy-placement="outside"
        class="w-full"
      />
    </n-form-item>
  </c-card>
</template>
