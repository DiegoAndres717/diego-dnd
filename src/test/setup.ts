import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender las expectativas con jest-dom matchers
expect.extend(matchers);

// Tipos para TypeScript
declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        matchers.TestingLibraryMatchers<T, void> {}
  }
}

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock para ResizeObserver (común en tests)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock para DragEvent
Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent extends Event {
    constructor(type: string, options?: DragEventInit) {
      super(type, options);
      this.dataTransfer = {
        dropEffect: 'none',
        effectAllowed: 'uninitialized',
        items: [] as any,
        files: [] as any,
        types: [],
        getData: vi.fn(),
        setData: vi.fn(),
        clearData: vi.fn(),
        setDragImage: vi.fn(),
      };
    }
    dataTransfer: DataTransfer;
  },
});