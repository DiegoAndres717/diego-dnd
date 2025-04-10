/** @type {import('jest').Config} */
const config = {
    // Ambiente de prueba
    testEnvironment: 'jsdom',
    
    // Rutas a ignorar
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    
    // Archivos de transformación
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.test.json',
      }],
    },
    
    // Extensiones de archivo a procesar
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    
    // Configuración de cobertura
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.ts',
      '!src/**/*.stories.{ts,tsx}',
    ],
    
    // Umbral de cobertura
    coverageThreshold: {
      global: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    
    // Configuración para CSS y archivos estáticos
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.js',
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/test/__mocks__/fileMock.js',
    },
    
    // Configuración para setup de pruebas
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
    
    // Configuración para snapshot
    snapshotSerializers: [],
  };
  
  module.exports = config;