import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#1a1a1f',
    borderColor: '#1f1f23',

    focus: {
      backgroundColor: '#6366f11a',
    },
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e69e',

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});
