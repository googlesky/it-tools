import { BrandDocker } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.docker-compose-to-docker-run.title'),
  path: '/docker-compose-to-docker-run',
  description: translate('tools.docker-compose-to-docker-run.description'),
  keywords: ['docker', 'compose', 'yaml', 'yml', 'run', 'convert'],
  component: () => import('./docker-compose-to-docker-run.vue'),
  icon: BrandDocker,
});


