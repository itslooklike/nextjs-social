module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: `@typescript-eslint/parser`,
  plugins: [`@typescript-eslint`],
  extends: [
    `eslint:recommended`,
    `airbnb`,
    `plugin:@typescript-eslint/eslint-recommended`,
    `plugin:@typescript-eslint/recommended`,
    `prettier`,
  ],
  rules: {
    semi: 0,
    'no-unused-vars': [`error`, { args: `all`, argsIgnorePattern: `^_` }],
    'no-underscore-dangle': 0,
    'no-console': 0,
    'consistent-return': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/jsx-filename-extension': 0,
    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': [`error`, { devDependencies: true }],
    curly: [`error`, `all`],
    quotes: [`error`, `backtick`],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
}
