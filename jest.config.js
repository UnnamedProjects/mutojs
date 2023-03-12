module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [],
  testMatch: ['<rootDir>/src/**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {},
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        ignoreCodes: [6133],
      },
    },
  },
}
