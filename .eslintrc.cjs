module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'security',
    'jsx-a11y',
    'unicorn',
    'import',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    // File naming convention
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
          pascalCase: true,
        },
        ignore: ['^\\[.*\\]\\.tsx?$'], // Allow Next.js dynamic routes
      },
    ],
    
    // Import ordering
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // TypeScript specific
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    
    // Privacy: Prevent raw coordinates in code
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Property[key.name=/^(lat|lng|latitude|longitude)$/]',
        message: '⚠️ Raw coordinates prohibited: Use geohash5 only for privacy protection',
      },
      {
        selector: 'Identifier[name=/^(lat|lng|latitude|longitude)$/]',
        message: '⚠️ Raw coordinate variable names prohibited: Use geohash5 for location data',
      },
    ],
    
    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component
    
    // Unicorn adjustments for Next.js
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-module': 'off', // Next.js config files need CommonJS
    
    // Import plugin
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'warn',
    
    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-unused-vars': 'off', // Use TypeScript's instead
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.cjs', '*.config.mjs'],
      env: {
        node: true,
      },
      rules: {
        'unicorn/prefer-module': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    '.next/',
    'node_modules/',
    'out/',
    'public/',
    '.turbo/',
    'coverage/',
  ],
};