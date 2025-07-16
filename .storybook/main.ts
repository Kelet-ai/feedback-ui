import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
    '@storybook/addon-themes',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  core: {
    disableWhatsNewNotifications: true,
  },

  async viteFinal(viteConfig) {
    viteConfig.optimizeDeps = {
      include: [
        ...(viteConfig.optimizeDeps?.include || []),
        'react/jsx-dev-runtime',
      ],
    };
    return viteConfig;
  },
};

export default config;
