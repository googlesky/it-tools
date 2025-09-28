import { ShieldCheck } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.jwt-verify.title'),
  path: '/jwt-verify',
  description: translate('tools.jwt-verify.description'),
  keywords: ['jwt', 'verify', 'jwk', 'jwks', 'pem', 'signature'],
  component: () => import('./jwt-verify.vue'),
  icon: ShieldCheck,
});


