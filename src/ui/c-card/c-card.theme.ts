import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#232323',
    borderColor: '#333333',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.15)',
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#efeff5',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
  },
});
