import type {Preview} from '@storybook/react-vite';
import {withThemeByClassName} from '@storybook/addon-themes'

import '@/styles/globals.css';
import '@/styles/accessibility.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],

  tags: ['autodocs'],
};

export default preview;
