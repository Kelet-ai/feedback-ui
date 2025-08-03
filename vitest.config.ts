/// <reference types="vitest/config" />
import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import viteConfig from './vite.config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@kelet-ai/feedback-ui': path.resolve(dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      projects: [
        {
          resolve: {
            alias: {
              '@': path.resolve(dirname, './src'),
              '@kelet-ai/feedback-ui': path.resolve(dirname, './src'),
            },
          },
          test: {
            name: 'unit',
            environment: 'jsdom',
            globals: true,
            include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            exclude: ['**/*.stories.{js,ts,jsx,tsx}', '**/node_modules/**'],
          },
        },
        {
          resolve: {
            alias: {
              '@': path.resolve(dirname, './src'),
              '@kelet-ai/feedback-ui': path.resolve(dirname, './src'),
            },
          },
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [
                {
                  browser: 'chromium',
                },
              ],
            },
            setupFiles: ['.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  })
);
