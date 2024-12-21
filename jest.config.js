module.exports = {
    roots: ['<rootDir>/test'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest'
    },
    testEnvironment: 'jsdom'
  };