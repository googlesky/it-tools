import { BrandDocker } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.docker-inspect-to-deployment.title'),
  path: '/docker-inspect-to-deployment',
  description: translate('tools.docker-inspect-to-deployment.description'),
  keywords: ['docker', 'inspect', 'compose', 'run', 'container', 'converter'],
  component: () => import('./docker-inspect-to-deployment.vue'),
  icon: BrandDocker,
});
