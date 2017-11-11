module.exports = {
  extends: 'stylelint-config-standard',
  plugins: ['stylelint-scss'],
  rules: {
    indentation: 2,
    'at-rule-whitelist': ['extend', 'import'],
    'rule-empty-line-before': 'never'
  }
};
