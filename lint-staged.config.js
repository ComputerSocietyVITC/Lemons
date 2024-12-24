export default {
  '*.{js,ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*': 'prettier --write',
};
