import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.ec-ed25519-keygen.title'),
  path: '/ec-ed25519-keygen',
  description: translate('tools.ec-ed25519-keygen.description'),
  keywords: ['key', 'keypair', 'ECDSA', 'Ed25519', 'EC', 'JWK', 'PEM', 'PKCS8', 'SPKI'],
  component: () => import('./keygen.vue'),
  icon: Key,
});


