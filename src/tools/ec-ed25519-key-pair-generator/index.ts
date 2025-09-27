import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.ec-ed25519-key-pair-generator.title'),
  path: '/ec-ed25519-key-pair-generator',
  description: translate('tools.ec-ed25519-key-pair-generator.description'),
  keywords: ['ec', 'ed25519', 'key', 'pair', 'generator', 'elliptic', 'curve', 'ecdsa', 'eddsa', 'crypto', 'jwk', 'pem'],
  component: () => import('./ec-ed25519-key-pair-generator.vue'),
  icon: Key,
});