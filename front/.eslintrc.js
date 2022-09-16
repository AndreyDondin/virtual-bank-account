module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'prettier',
    'plugin:jest/recommended',
    'plugin:cypress/recommended',
  ],
  env: {
    node: 1,
    browser: true,
    'jest/globals': true,
    'cypress/globals': true,
  },
  plugins: ['prettier', 'jest', 'cypress'],

  rules: {
    'no-alert': 0,
    'no-var': 'error',
    'no-param-reassign': [2, { props: false }],
    'no-plusplus': 0,
    'no-iterator': 0,
    'no-restricted-syntax': [2, 'WithStatement'],
    'func-style': 0,
    quotes: [2, 'single', { avoidEscape: true }],
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
      },
    ],
  },
};
