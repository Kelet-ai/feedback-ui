// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'src/components/ui/*.{ts,tsx}',
      '*.config.{ts,js}',
      '.storybook/**/*',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // ignore all variables whose name starts with _
          varsIgnorePattern: '^_',
          // ignore all function args whose name starts with _
          argsIgnorePattern: '^_',
          // ignore catch-clause errors named _*
          caughtErrorsIgnorePattern: '^_',
          // if you use rest/spread, ignore the leftover siblings
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  storybook.configs['flat/recommended']
);
