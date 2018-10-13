module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  plugins: [
    'import',
    'flowtype',
  ],
  env: {
    node: true,
  },
  rules: {
    // Lines between class members doesn't work well with flow declarations
    'lines-between-class-members': 'off',
    
    'no-underscore-dangle': 'off', // We use "private" class members
    'no-bitwise': 'off', // We use bitwise operators
    'no-plusplus': 'off', // Life is too short; learn the problem this rule is designed to circumvent
    'class-methods-use-this': 'off', // Allow "abstract" methods
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-confusing-arrow': 'off',  // Who is confused?
    'prefer-destructuring': 'off', // Doesn't play well with Flow
    'no-lonely-if': 'off', // Makes code harder to read when you can't indent logical levels
  }
};