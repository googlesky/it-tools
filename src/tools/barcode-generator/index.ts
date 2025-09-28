import { Barcode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.barcode-generator.title'),
  path: '/barcode-generator',
  description: translate('tools.barcode-generator.description'),
  keywords: ['barcode', 'code128', 'ean13', 'ean8', 'upc', 'pdf417'],
  component: () => import('./barcode-generator.vue'),
  icon: Barcode,
});


