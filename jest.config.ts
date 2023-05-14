import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 25000,
  testPathIgnorePatterns: ['./dist'],
  coverageReporters: ['lcov', 'text-summary', ['text', { skipFull: true }]],
  collectCoverageFrom: ['!**/?(*.)+(test|e2e).ts', './src/**/*.ts'],
  coveragePathIgnorePatterns: [
    './src/config.ts',
    './src/main-rest-api.ts',
    './src/infra/database',
    './src/infra/http/ExpressHttpServer.ts',
  ],
  moduleNameMapper: {
    '@/ports/(.*)': ['<rootDir>/src/application/ports/$1'],
    '@/use-cases/(.*)': ['<rootDir>/src/application/use-cases/$1'],
    '@/entities/(.*)': ['<rootDir>/src/domain/entities/$1'],
    '@/controllers/(.*)': ['<rootDir>/src/infra/controllers/$1'],
    '@/database/(.*)': ['<rootDir>/src/infra/database/$1'],
    '@/http/(.*)': ['<rootDir>/src/infra/http/$1'],
    '@/repositories/(.*)': ['<rootDir>/src/infra/repositories/$1'],
    '@/(.*)': ['<rootDir>/src/$1'],
  },
}

export default config
