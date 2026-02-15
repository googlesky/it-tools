import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  Menu: {
    itemHeight: '32px',
  },

  Layout: { color: '#f8fafc' },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#818cf8FF',
    primaryColorHover: '#a5b4fcFF',
    primaryColorPressed: '#6366f1FF',
    primaryColorSuppl: '#a5b4fcFF',
  },

  Notification: {
    color: '#1a1a1f',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#0f0f11' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#09090b',
    siderColor: '#0f0f11',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#131316',
    borderColor: '#1f1f23',
  },

  Table: {
    tdColor: '#131316',
    thColor: '#1a1a1f',
  },
};
