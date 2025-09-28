import { Scale } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.unit-converters.title'),
  path: '/unit-converters',
  description: translate('tools.unit-converters.description'),
  keywords: ['bytes', 'bits', 'kb', 'mb', 'gb', 'bandwidth', 'duration', 'time'],
  component: () => import('./unit-converters.vue'),
  icon: Scale,
});


