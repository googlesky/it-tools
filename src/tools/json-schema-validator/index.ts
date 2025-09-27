import { Braces } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.json-schema-validator.title'),
  path: '/json-schema-validator',
  description: translate('tools.json-schema-validator.description'),
  keywords: ['json', 'schema', 'validator', 'ajv', 'validate', 'jsonschema'],
  component: () => import('./json-schema-validator.vue'),
  icon: Braces,
});


