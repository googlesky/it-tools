import { Api } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.openapi-viewer.title'),
  path: '/openapi-viewer',
  description: translate('tools.openapi-viewer.description'),
  keywords: ['openapi', 'swagger', 'api', 'spec', 'yaml', 'json', 'endpoints'],
  component: () => import('./openapi-viewer.vue'),
  icon: Api,
});


