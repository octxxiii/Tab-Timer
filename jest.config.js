module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testTimeout: 60000
}; 