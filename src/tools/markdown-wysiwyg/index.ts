import { Markdown } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.markdown-wysiwyg.title'),
  path: '/markdown-wysiwyg',
  description: translate('tools.markdown-wysiwyg.description'),
  keywords: ['markdown', 'editor', 'wysiwyg', 'md', 'rich'],
  component: () => import('./markdown-wysiwyg.vue'),
  icon: Markdown,
});


