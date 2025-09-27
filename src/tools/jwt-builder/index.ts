import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.jwt-builder.title'),
  path: '/jwt-builder',
  description: translate('tools.jwt-builder.description'),
  keywords: ['jwt', 'jwk', 'token', 'hs256', 'rs256', 'verify', 'sign'],
  component: () => import('./jwt-builder.vue'),
  icon: Key,
});


