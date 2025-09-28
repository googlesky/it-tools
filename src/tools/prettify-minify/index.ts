import { Brackets } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.prettify-minify.title'),
  path: '/prettify-minify',
  description: translate('tools.prettify-minify.description'),
  keywords: ['html', 'css', 'js', 'format', 'minify', 'prettier', 'terser'],
  component: () => import('./prettify-minify.vue'),
  icon: Brackets,
});


