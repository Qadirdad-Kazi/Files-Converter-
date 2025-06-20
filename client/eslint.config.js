export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
    plugins: ["react", "@typescript-eslint"],
    rules: {
      // custom rules
    },
  },
];
