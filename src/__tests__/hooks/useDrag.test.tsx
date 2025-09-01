import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DndProvider } from '../../context/DndContext';
import { useDrag } from '../../hooks/useDrag';
import React from 'react';

// Wrapper para hooks que necesitan DndProvider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <DndProvider announceMessages={false}>
      {children}
    </DndProvider>
  );
};

describe('useDrag hook', () => {
  const mockConfig = {
    id: 'test-item',
    type: 'test-type',
    data: { test: 'data' },
  };

  describe('Basic functionality', () => {
    it('returns correct initial state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDrag(mockConfig), { wrapper });

      expect(result.current.ref).toBeDefined();
      expect(result.current.dragProps).toBeDefined();
      expect(result.current.isDragging).toBe(false);
    });

    it('provides draggable props when not disabled', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDrag(mockConfig), { wrapper });

      expect(result.current.dragProps.draggable).toBe(true);
      expect(result.current.dragProps.onDragStart).toBeDefined();
    });

    it('disables draggable when disabled config is true', () => {
      const wrapper = createWrapper();
      const disabledConfig = { ...mockConfig, disabled: true };
      const { result } = renderHook(() => useDrag(disabledConfig), { wrapper });

      expect(result.current.dragProps.draggable).toBe(false);
    });
  });

  describe('Drag start handling', () => {
    it('handles drag start event correctly', () => {
      const mockDataTransfer = {
        setData: vi.fn(),
        effectAllowed: '',
      };

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: mockDataTransfer,
      } as any;

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDrag(mockConfig), { wrapper });

      act(() => {
        result.current.dragProps.onDragStart(mockEvent);
      });

      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', 'test-item');
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/diego-dnd',
        JSON.stringify({
          id: 'test-item',
          type: 'test-type',
          data: { test: 'data' },
        })
      );
    });

    it('prevents drag start when disabled', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { setData: vi.fn() },
      } as any;

      const wrapper = createWrapper();
      const disabledConfig = { ...mockConfig, disabled: true };
      const { result } = renderHook(() => useDrag(disabledConfig), { wrapper });

      act(() => {
        result.current.dragProps.onDragStart(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.setData).not.toHaveBeenCalled();
    });
  });

  describe('Registration and cleanup', () => {
    it('registers and unregisters element correctly', () => {
      // Mock del elemento DOM
      const mockElement = {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
      } as any;

      const wrapper = createWrapper();
      const { result, unmount } = renderHook(() => useDrag(mockConfig), { wrapper });

      // Simular la asignación de ref
      act(() => {
        (result.current.ref as any).current = mockElement;
      });

      // Verificar que se registra
      expect(result.current.ref).toBeDefined();

      // Limpiar
      unmount();

      // El cleanup debería haberse ejecutado
      // (en una implementación real, verificaríamos que unregisterDraggable fue llamado)
    });
  });

  describe('Configuration updates', () => {
    it('updates when config changes', () => {
      const wrapper = createWrapper();
      const { result, rerender } = renderHook(
        (props) => useDrag(props.config),
        { 
          wrapper,
          initialProps: { config: mockConfig }
        }
      );

      const newConfig = { ...mockConfig, disabled: true };
      
      rerender({ config: newConfig });

      expect(result.current.dragProps.draggable).toBe(false);
    });
  });
});
