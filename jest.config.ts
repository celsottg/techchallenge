export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  injectGlobals: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/__tests__/**",
    "!src/server.ts",
    "!src/app.ts",
    "!src/env/**",
    "!src/lib/**",
    "!src/use-cases/factory/**",
    "!src/http/**",
    "!src/entities/models/**",
    "!src/repositories/post.repository.interface.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 30,
      statements: 30,
      functions: 30,
      branches: 30,
    },
  },
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageDirectory: "coverage",
};
