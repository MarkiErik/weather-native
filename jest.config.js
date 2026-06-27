module.exports = {
  preset: "jest-expo",
  // Resolve the "@/..." path alias the same way tsconfig does.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Unit tests for pure logic live next to the code in __tests__ folders.
  testMatch: ["**/__tests__/**/*.test.ts"],
};
