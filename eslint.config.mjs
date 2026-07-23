import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".agents/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "public/**",
      "tina/__generated__/**",
      "next-env.d.ts",
      "*.md",
      "**/*.md",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "warn",
    },
  },
];

export default eslintConfig;
