import { Search } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.json-query-explorer.title'),
  path: '/json-query-explorer',
  description: translate('tools.json-query-explorer.description'),
  keywords: ['json', 'jsonpath', 'jmespath', 'query', 'filter', 'search'],
  component: () => import('./json-query-explorer.vue'),
  icon: Search,
});


