import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.jose-jwk.title'),
  path: '/jose-jwk',
  description: translate('tools.jose-jwk.description'),
  keywords: ['jwk', 'pem', 'spki', 'pkcs8', 'jwks', 'jwe', 'encrypt', 'decrypt', 'jose'],
  component: () => import('./jose-jwk.vue'),
  icon: Key,
});


