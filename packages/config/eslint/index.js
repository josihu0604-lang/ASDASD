module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    // Geo-privacy: prohibit raw coordinate logging
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.object.name='console'][callee.property.name='log'] Literal[value=/lat|lng|latitude|longitude/i]",
        "message": "원시 좌표 로깅 금지: geohash5를 사용하세요. (Raw coordinate logging prohibited: use geohash5)"
      },
      {
        "selector": "CallExpression[callee.object.name='console'][callee.property.name=/log|info|debug/] MemberExpression[property.name=/lat|lng|latitude|longitude/i]",
        "message": "원시 좌표 로깅 금지: geohash5를 사용하세요. (Raw coordinate logging prohibited: use geohash5)"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ]
  },
  ignorePatterns: [
    "**/dist/**",
    "**/.next/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/*.config.js",
    "**/*.config.ts"
  ]
};