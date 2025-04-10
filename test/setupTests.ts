// Extender expect con matchers de React Testing Library
import '@testing-library/jest-dom';

// Mock para IntersectionObserver que puede no estar disponible en JSDOM
if (typeof window !== 'undefined') {
  class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  // Mock para drag and drop de HTML5
  Object.defineProperty(window, 'DragEvent', {
    writable: true,
    configurable: true,
    value: class extends Event {
      constructor(type: string, options: EventInit = {}) {
        super(type, options);
      }
      dataTransfer = {
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        effectAllowed: 'move',
      };
    },
  });
}

// Suprimir errores de consola en las pruebas
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Ignorar errores específicos que pueden aparecer en las pruebas
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: ReactDOM.render'))
  ) {
    return;
  }
  originalConsoleError(...args);
};