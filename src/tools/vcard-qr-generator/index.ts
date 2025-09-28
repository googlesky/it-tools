import { Qrcode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.vcard-qr-generator.title'),
  path: '/vcard-qr-generator',
  description: translate('tools.vcard-qr-generator.description'),
  keywords: ['vcard', 'mecard', 'contact', 'qr', 'phone', 'email'],
  component: () => import('./vcard-qr-generator.vue'),
  icon: Qrcode,
});


