import love from 'eslint-config-love'

export default [
  {
    ...love,
    ignores: [
      'dist/**/*.ts',
      'dist/**',
      "**/*.mjs",
      "eslint.config.js",
      "**/*.js"
    ],
    files: ['**/*.js', '**/*.ts'],
    rules: {
      "max-params": "off"
    }
  },
]