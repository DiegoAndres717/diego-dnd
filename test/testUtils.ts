import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DndProvider } from '../src/components/DndContext';
import { DragItem, DropResult } from '../src/types';

// Interfaz para props personalizadas del wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  dndProviderProps?: {
    children: React.ReactNode;
    onDragStart?: (item: DragItem) => void;
    onDragEnd?: (result: DropResult | null) => void;
    debugMode?: boolean;
    ariaStartMessage?: string;
    ariaEndMessage?: string;
    enableKeyboardNavigation?: boolean;
  };
}

// Interfaz para el objeto de overrides en createDragEvent
interface DragEventOverrides {
  item?: {
    id: string;
    type: string;
    [key: string]: any;
  };
  clientX?: number;
  clientY?: number;
  [key: string]: any;
}

/**
 * Renderiza componentes dentro de un DndProvider para pruebas
 */
function renderWithDndProvider(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { dndProviderProps = {}, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(DndProvider, { ...dndProviderProps, children }, children)
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Crea un evento de arrastre simulado para pruebas
 */
function createDragEvent(type: string, overrides: DragEventOverrides = {}) {
  // Creamos un evento que extiende Event pero con propiedades adicionales
  const event = document.createEvent('Event') as any;
  event.initEvent(type, true, true);
  
  // Agregamos dataTransfer
  event.dataTransfer = {
    setData: jest.fn(),
    getData: jest.fn((format: string) => {
      if (format === 'application/diego-dnd' && overrides.item) {
        return JSON.stringify(overrides.item);
      }
      return '';
    }),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
    effectAllowed: 'move',
  };
  
  // Añadimos las propiedades adicionales
  Object.assign(event, overrides);
  
  return event;
}

/**
 * Simula una operación completa de drag & drop para pruebas
 */
function simulateDragAndDrop({
  source,
  target,
  position = 'inside',
  sourceCoords = { x: 0, y: 0 },
  targetCoords = { x: 100, y: 100 },
}: {
  source: HTMLElement;
  target: HTMLElement;
  position?: 'before' | 'after' | 'inside';
  sourceCoords?: { x: number; y: number };
  targetCoords?: { x: number; y: number };
}) {
  // 1. Iniciar arrastre en el origen
  const dragStartEvent = createDragEvent('dragstart', {
    clientX: sourceCoords.x,
    clientY: sourceCoords.y,
  });
  source.dispatchEvent(dragStartEvent);
  
  // 2. Entrar en la zona de destino
  const dragEnterEvent = createDragEvent('dragenter', {
    clientX: targetCoords.x,
    clientY: targetCoords.y,
  });
  target.dispatchEvent(dragEnterEvent);
  
  // 3. Mover sobre la zona de destino
  const dragOverEvent = createDragEvent('dragover', {
    clientX: targetCoords.x,
    clientY: targetCoords.y,
  });
  target.dispatchEvent(dragOverEvent);
  
  // 4. Soltar en la zona de destino
  const dropEvent = createDragEvent('drop', {
    clientX: targetCoords.x,
    clientY: targetCoords.y,
  });
  target.dispatchEvent(dropEvent);
  
  // 5. Finalizar arrastre
  const dragEndEvent = createDragEvent('dragend');
  source.dispatchEvent(dragEndEvent);
}

/**
 * Simula navegación mediante teclado para accesibilidad
 */
function simulateKeyboardNavigation({
  source,
  direction,
  steps = 1,
  complete = false,
}: {
  source: HTMLElement;
  direction: 'up' | 'down' | 'left' | 'right';
  steps?: number;
  complete?: boolean;
}) {
  // 1. Seleccionar elemento con Espacio
  source.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
    })
  );
  
  // 2. Mover en la dirección especificada
  for (let i = 0; i < steps; i++) {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: `Arrow${direction.charAt(0).toUpperCase() + direction.slice(1)}`,
        bubbles: true,
      })
    );
  }
  
  // 3. Completar operación si se solicita
  if (complete) {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      })
    );
  }
}

// Exportar utilidades
export {
  renderWithDndProvider,
  createDragEvent,
  simulateDragAndDrop,
  simulateKeyboardNavigation,
};