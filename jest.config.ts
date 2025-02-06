import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['**/*.(t|j)s', '!main.ts', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
  modulePaths: ['<rootDir>'],
  verbose: true,
};

export default config;
