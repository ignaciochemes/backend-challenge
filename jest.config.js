module.exports = {
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
    ],
    rootDir: '.',
    testMatch: [
        '<rootDir>/test/**/*.spec.ts',
        '<rootDir>/test/**/**.test.ts'
    ],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.entity.ts',
        '!src/**/*.enum.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
        '!src/Migrations/**/*',
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
    verbose: true,
};