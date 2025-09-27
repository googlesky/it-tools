import { Braces } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.json-prettify.title'),
  path: '/json-prettify',
  description: translate('tools.json-prettify.description'),
  keywords: [
    'json', 'viewer', 'prettify', 'format', 'formatter', 'beautify', 'beautifier',
    'pretty', 'pretty print', 'pretty-print', 'prettyprint',
    'json format', 'format json', 'json formatter', 'json beautify',
    // Vietnamese synonyms
    'định dạng', 'làm đẹp', 'định dạng json', 'trình định dạng', 'đẹp json', 'định dạng dữ liệu',
  ],
  component: () => import('./json-viewer.vue'),
  icon: Braces,
  redirectFrom: ['/json-viewer', '/json-formatter', '/json-format', '/json-beautify'],
});
