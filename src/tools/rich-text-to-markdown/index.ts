import { FileText } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.rich-text-to-markdown.title'),
  path: '/rich-text-to-markdown',
  description: translate('tools.rich-text-to-markdown.description'),
  keywords: ['paste', 'clipboard', 'html', 'rtf', 'rich text', 'markdown', 'to-markdown', 'turndown'],
  component: () => import('./rich-text-to-markdown.vue'),
  icon: FileText,
});


