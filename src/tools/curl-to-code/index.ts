import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.curl-to-code.title'),
  path: '/curl-to-code',
  description: translate('tools.curl-to-code.description'),
  keywords: ['curl', 'http', 'request', 'fetch', 'axios', 'httpie', 'converter'],
  component: () => import('./curl-to-code.vue'),
  icon: Code,
});


