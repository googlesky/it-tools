import { Adjustments } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.color-contrast-checker.title'),
  path: '/color-contrast-checker',
  description: translate('tools.color-contrast-checker.description'),
  keywords: ['color', 'contrast', 'wcag', 'aa', 'aaa', 'accessibility'],
  component: () => import('./color-contrast-checker.vue'),
  icon: Adjustments,
});


