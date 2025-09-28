import { Server } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.dns-record-builders.title'),
  path: '/dns-record-builders',
  description: translate('tools.dns-record-builders.description'),
  keywords: ['dns', 'spf', 'dkim', 'dmarc', 'record', 'email'],
  component: () => import('./dns-record-builders.vue'),
  icon: Server,
});


