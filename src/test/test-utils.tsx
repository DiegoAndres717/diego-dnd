import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DndProvider } from '../context/DndContext';

// Provider personalizado para tests
const TestDndProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DndProvider announceMessages={false}>
      {children}
    </DndProvider>
  );
};

// Función de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: TestDndProvider, ...options });

export * from '@testing-library/react';
export { customRender as render };