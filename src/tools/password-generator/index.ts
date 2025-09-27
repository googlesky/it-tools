import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.password-generator.title'),
  path: '/password-generator',
  description: translate('tools.password-generator.description'),
  keywords: [
    'password', 'generator', 'pass', 'random', 'secure', 'strong',
    'uppercase', 'lowercase', 'numbers', 'symbols', 'exclude ambiguous', 'ensure each',
    'mật khẩu', 'tạo mật khẩu', 'mật khẩu mạnh', 'ngẫu nhiên', 'bảo mật',
  ],
  component: () => import('./password-generator.vue'),
  icon: Key,
});
