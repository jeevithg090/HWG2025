module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"], // Align with user-service
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/src/**/*.test.ts",
  ],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10, // Standard practice, can be adjusted
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Added from user-service
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
