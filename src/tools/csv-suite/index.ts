import { Table } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.csv-suite.title'),
  path: '/csv-suite',
  description: translate('tools.csv-suite.description'),
  keywords: ['csv', 'json', 'convert', 'parse', 'papaparse', 'dialect'],
  component: () => import('./csv-suite.vue'),
  icon: Table,
});


