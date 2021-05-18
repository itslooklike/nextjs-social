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
    'no-underscore-dangle': 0,
    'no-console': 0,
    'consistent-return': 0,
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
