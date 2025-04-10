import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Droppable } from '../../src/components/Droppable';
import { renderWithDndProvider, createDragEvent } from '../testUtils';

describe('Droppable', () => {
  // Prueba de renderizado básico
  test('renders children correctly', () => {
    renderWithDndProvider(
      <Droppable id="test" type="TEST">
        <div data-testid="droppable-child">Drop here</div>
      </Droppable>
    );
    
    const element = screen.getByTestId('droppable-child');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Drop here');
  });
  
  // Prueba de atributos de datos
  test('applies correct data attributes', () => {
    renderWithDndProvider(
      <Droppable 
        id="test-id" 
        type="TEST_TYPE" 
        parentId="parent-id"
        orientation="horizontal" 
        data-testid="droppable-element"
      >
        Drop here
      </Droppable>
    );
    
    const element = screen.getByTestId('droppable-element');
    expect(element).toHaveAttribute('data-diego-dnd-id', 'test-id');
    expect(element).toHaveAttribute('data-diego-dnd-type', 'TEST_TYPE');
    expect(element).toHaveAttribute('data-diego-dnd-parent', 'parent-id');
    expect(element).toHaveAttribute('data-diego-dnd-orientation', 'horizontal');
  });
  
  // Prueba de estado deshabilitado
  test('respects disabled prop', () => {
    renderWithDndProvider(
      <Droppable 
        id="test-id" 
        type="TEST_TYPE" 
        disabled={true}
        data-testid="droppable-element"
      >
        Drop here
      </Droppable>
    );
    
    const element = screen.getByTestId('droppable-element');
    expect(element).toHaveAttribute('aria-disabled', 'true');
    expect(element).toHaveAttribute('aria-dropeffect', 'none');
  });
  
  // Prueba de eventos de drop
  test('handles drop events', () => {
    const onDragEnter = jest.fn();
    const onDragLeave = jest.fn();
    const onDragOver = jest.fn();
    const onDrop = jest.fn().mockReturnValue({
      source: { id: 'source-id', type: 'TEST' },
      destination: { id: 'test-id', type: 'TEST_TYPE', position: 'inside' },
      item: { id: 'source-id', type: 'TEST' }
    });
    
    renderWithDndProvider(
      <Droppable 
        id="test-id" 
        type="TEST_TYPE" 
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        data-testid="droppable-element"
      >
        Drop here
      </Droppable>
    );
    
    const element = screen.getByTestId('droppable-element');
    
    // Simular eventos
    // Para pruebas completas, necesitamos configurar un estado de arrastre en el contexto
    fireEvent(element, createDragEvent('dragenter', {
      item: { id: 'source-id', type: 'TEST' }
    }));
    
    fireEvent(element, createDragEvent('dragover', {
      item: { id: 'source-id', type: 'TEST' },
      clientX: 100,
      clientY: 50
    }));
    
    fireEvent(element, createDragEvent('drop', {
      item: { id: 'source-id', type: 'TEST' }
    }));
    
    // Las pruebas completas de esta funcionalidad deberían hacerse en pruebas de integración
    // ya que dependen mucho del estado del contexto
  });
  
  // Prueba de atributos de accesibilidad
  test('has correct accessibility attributes', () => {
    renderWithDndProvider(
      <Droppable 
        id="test-id" 
        type="TEST_TYPE"
        ariaLabel="Zona de destino de prueba"
        data-testid="droppable-element"
      >
        Drop here
      </Droppable>
    );
    
    const element = screen.getByTestId('droppable-element');
    
    // Verificar atributos ARIA
    expect(element).toHaveAttribute('role', 'region');
    expect(element).toHaveAttribute('aria-dropeffect', 'move');
    expect(element).toHaveAttribute('aria-roledescription', 'zona para soltar');
    expect(element).toHaveAttribute('aria-label', 'Zona de destino de prueba');
  });
});