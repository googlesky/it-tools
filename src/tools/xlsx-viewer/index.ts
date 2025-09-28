import { Table } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.xlsx-viewer.title'),
  path: '/xlsx-viewer',
  description: translate('tools.xlsx-viewer.description'),
  keywords: ['xlsx', 'excel', 'sheet', 'csv', 'json', 'workbook'],
  component: () => import('./xlsx-viewer.vue'),
  icon: Table,
});


