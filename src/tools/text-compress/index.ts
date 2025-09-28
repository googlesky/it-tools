import { BoxMultiple } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.text-compress.title'),
  path: '/text-compress',
  description: translate('tools.text-compress.description'),
  keywords: ['gzip', 'deflate', 'brotli', 'compress', 'decompress', 'base64'],
  component: () => import('./text-compress.vue'),
  icon: BoxMultiple,
});


