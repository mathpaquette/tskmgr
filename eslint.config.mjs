import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*', 'docs/**'],
  },
  {
    files: ['{package,project}.json'],
    rules: {
      '@nx/dependency-checks': 'error',
    },
    ignoredFiles: [
      '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
      '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
    ],
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
];
