import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // dist-* covers local build-verification scratch dirs (dist-verify, …).
  // supabase/.temp holds bundles the CLI writes on `supabase start` (the edge
  // runtime's generated main/index.ts among them). It is gitignored, but flat
  // config does not read .gitignore, so without this every developer running
  // the local stack fails `npm run lint` on minified vendor code.
  { ignores: ['dist', 'dist-*', 'supabase/.temp'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    // Mirrors the old --report-unused-disable-directives CLI flag, which
    // ESLint 9 flat config no longer accepts.
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
