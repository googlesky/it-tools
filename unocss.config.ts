import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

import { presetScrollbar } from 'unocss-preset-scrollbar';

export default defineConfig({
  presets: [presetUno(), presetAttributify({ ignoreAttributes: ['size'] }), presetTypography(), presetScrollbar()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: '#6366f1',

    },
  },
  shortcuts: {
    'pretty-scrollbar': 'scrollbar scrollbar-rounded scrollbar-thumb-color-gray-300 scrollbar-track-color-gray-100 dark:scrollbar-thumb-color-#424242 dark:scrollbar-track-color-#686868',
    'divider': 'h-1px bg-current op-10',
    'bg-surface': 'bg-#ffffff dark:bg-#131316',
    'bg-background': 'bg-#f8fafc dark:bg-#09090b',
    'card-shadow': 'shadow-sm shadow-gray-200/50 dark:shadow-black/20',
    'card-shadow-hover': 'shadow-md shadow-indigo-200/30 dark:shadow-indigo-500/10',
    'focus-ring': 'outline-2 outline-solid outline-#6366f1 outline-offset-2',
    'transition-base': 'transition-all duration-200 ease-in-out',
  },
});
