import { Scan } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.qrcode-reader.title'),
  path: '/qrcode-reader',
  description: translate('tools.qrcode-reader.description'),
  keywords: ['qr', 'code', 'reader', 'scanner', 'decode', 'image', 'webcam', 'camera', 'upload'],
  component: () => import('./qr-code-reader.vue'),
  icon: Scan,
});