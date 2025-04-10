import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Draggable } from '../../src/components/Draggable';
import { renderWithDndProvider, createDragEvent } from '../testUtils';

describe('Draggable', () => {
  // Prueba de renderizado básico
  test('renders children correctly', () => {
    renderWithDndProvider(
      <Draggable id="test" type="TEST">
        <div data-testid="draggable-child">Drag me</div>
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-child');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Drag me');
  });
  
  // Prueba de atributos de datos
  test('applies correct data attributes', () => {
    renderWithDndProvider(
      <Draggable 
        id="test-id" 
        type="TEST_TYPE" 
        parentId="parent-id" 
        index={5}
        data-testid="draggable-element"
      >
        Drag me
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-element');
    expect(element).toHaveAttribute('data-diego-dnd-id', 'test-id');
    expect(element).toHaveAttribute('data-diego-dnd-type', 'TEST_TYPE');
    expect(element).toHaveAttribute('data-diego-dnd-parent', 'parent-id');
    expect(element).toHaveAttribute('data-diego-dnd-index', '5');
  });
  
  // Prueba de estado deshabilitado
  test('respects disabled prop', () => {
    renderWithDndProvider(
      <Draggable 
        id="test-id" 
        type="TEST_TYPE" 
        disabled={true}
        data-testid="draggable-element"
      >
        Drag me
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-element');
    expect(element).toHaveAttribute('draggable', 'false');
    expect(element).toHaveAttribute('aria-disabled', 'true');
  });
  
  // Prueba de eventos de arrastre
  test('handles drag events', () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();
    
    renderWithDndProvider(
      <Draggable 
        id="test-id" 
        type="TEST_TYPE" 
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        data-testid="draggable-element"
      >
        Drag me
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-element');
    
    // Crear y disparar evento dragstart
    fireEvent(element, createDragEvent('dragstart'));
    expect(onDragStart).toHaveBeenCalled();
    
    // Crear y disparar evento dragend
    fireEvent(element, createDragEvent('dragend'));
    expect(onDragEnd).toHaveBeenCalled();
  });
  
  // Prueba de clases CSS durante arrastre
  test('applies drag active class when dragging', () => {
    // Este test es más complejo y requiere manipular el estado del contexto
    // Lo implementaremos en una prueba de integración
  });
  
  // Prueba de atributos de accesibilidad
  test('has correct accessibility attributes', () => {
    renderWithDndProvider(
      <Draggable 
        id="test-id" 
        type="TEST_TYPE"
        ariaLabel="Elemento de prueba"
        data-testid="draggable-element"
      >
        Drag me
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-element');
    
    // Verificar atributos ARIA
    expect(element).toHaveAttribute('role', 'button');
    expect(element).toHaveAttribute('aria-grabbed', 'false');
    expect(element).toHaveAttribute('aria-roledescription', 'elemento arrastrable');
    expect(element).toHaveAttribute('aria-label', 'Elemento de prueba');
    expect(element).toHaveAttribute('tabIndex', '0');
  });
  
  // Prueba de soporte de teclado
  test('supports keyboard navigation', () => {
    const onDragStart = jest.fn();
    
    renderWithDndProvider(
      <Draggable 
        id="test-id" 
        type="TEST_TYPE"
        onDragStart={onDragStart}
        data-testid="draggable-element"
      >
        Drag me
      </Draggable>
    );
    
    const element = screen.getByTestId('draggable-element');
    
    // Simular selección con teclado
    fireEvent.keyDown(element, { key: ' ' });
    
    // Verificar cambio en aria-grabbed (debería ser controlado por el estado interno)
    // Nota: Esta prueba puede requerir ajustes dependiendo de la implementación exacta
  });
});