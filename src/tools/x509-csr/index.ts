import { Certificate } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.x509-csr.title'),
  path: '/x509-csr',
  description: translate('tools.x509-csr.description'),
  keywords: ['x509', 'certificate', 'csr', 'pkcs10', 'pem', 'der', 'san', 'fingerprint', 'pki'],
  component: () => import('./x509-csr.vue'),
  icon: Certificate,
});


