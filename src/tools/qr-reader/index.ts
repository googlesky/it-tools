import { Qrcode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.qr-reader.title'),
  path: '/qr-reader',
  description: translate('tools.qr-reader.description'),
  keywords: ['qr', 'scanner', 'reader', 'camera', 'image'],
  component: () => import('./qr-reader.vue'),
  icon: Qrcode,
});


