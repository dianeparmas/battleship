module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    // Add any other necessary configurations here
  ],
  rules: {
    // Keep this minimal to avoid conflicts
  },
  settings: {
    react: {
      version: "detect", // Automatically detect the React version
    },
  },
};
