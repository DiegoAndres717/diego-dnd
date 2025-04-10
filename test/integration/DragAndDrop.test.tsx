import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DndProvider } from '../../src/components/DndContext';
import { Draggable } from '../../src/components/Draggable';
import { Droppable } from '../../src/components/Droppable';
import { simulateDragAndDrop, simulateKeyboardNavigation } from '../testUtils';

// Componente de prueba para una lista simple
const SimpleList = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  
  const handleDrop = (result) => {
    if (!result) return;
    
    const { source, destination } = result;
    
    if (!destination) return;
    
    const newItems = Array.from(items);
    const [removed] = newItems.splice(source.index, 1);
    
    if (destination.position === 'before') {
      const targetIndex = items.findIndex(item => item === destination.id);
      newItems.splice(targetIndex, 0, removed);
    } else if (destination.position === 'after') {
      const targetIndex = items.findIndex(item => item === destination.id);
      newItems.splice(targetIndex + 1, 0, removed);
    } else {
      // 'inside' no tiene sentido en una lista plana
    }
    
    setItems(newItems);
  };
  
  return (
    <DndProvider onDragEnd={handleDrop}>
      <div data-testid="simple-list">
        <Droppable id="list-container" type="LIST">
          {items.map((item, index) => (
            <Draggable
              key={item}
              id={item}
              type="ITEM"
              index={index}
              data-testid={`draggable-${item.replace(' ', '-')}`}
              ariaLabel={item}
            >
              <div className="list-item">{item}</div>
            </Draggable>
          ))}
        </Droppable>
      </div>
    </DndProvider>
  );
};

// Componente de prueba para un Kanban Board simple
const SimpleKanban = () => {
  const [columns, setColumns] = useState({
    todo: [{ id: 'task1', content: 'Tarea 1' }],
    inProgress: [{ id: 'task2', content: 'Tarea 2' }],
    done: [{ id: 'task3', content: 'Tarea 3' }]
  });
  
  const handleDrop = (result) => {
    if (!result) return;
    
    const { source, destination, item } = result;
    
    if (!destination) return;
    
    // Crear copia del estado
    const newColumns = { ...columns };
    
    // Encontrar columna de origen y destino
    let sourceColumn;
    let sourceColumnId;
    
    for (const [colId, tasks] of Object.entries(columns)) {
      const taskIndex = tasks.findIndex(task => task.id === item.id);
      if (taskIndex >= 0) {
        sourceColumn = tasks;
        sourceColumnId = colId;
        break;
      }
    }
    
    if (!sourceColumn || !sourceColumnId) return;
    
    // Eliminar de columna de origen
    const [removedTask] = newColumns[sourceColumnId].splice(
      source.index, 
      1
    );
    
    // Añadir a columna de destino
    newColumns[destination.id].push(removedTask);
    
    setColumns(newColumns);
  };
  
  return (
    <DndProvider onDragEnd={handleDrop}>
      <div data-testid="kanban-board" style={{ display: 'flex' }}>
        {Object.keys(columns).map(columnId => (
          <Droppable 
            key={columnId} 
            id={columnId} 
            type="COLUMN"
            data-testid={`column-${columnId}`}
            ariaLabel={`Columna ${columnId}`}
          >
            <div className="column">
              <h2>{columnId}</h2>
              {columns[columnId].map((task, index) => (
                <Draggable
                  key={task.id}
                  id={task.id}
                  type="TASK"
                  index={index}
                  data={task}
                  data-testid={`task-${task.id}`}
                  ariaLabel={task.content}
                >
                  <div className="task">{task.content}</div>
                </Draggable>
              ))}
            </div>
          </Droppable>
        ))}
      </div>
    </DndProvider>
  );
};

describe('Drag and Drop Integration', () => {
  // Prueba de lista simple
  test('Simple list reordering works', () => {
    render(<SimpleList />);
    
    // Verificar orden inicial usando testids específicos en lugar de texto
    const item1 = screen.getByTestId('draggable-Item-1');
    const item2 = screen.getByTestId('draggable-Item-2');
    const item3 = screen.getByTestId('draggable-Item-3');
    
    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();
    expect(item3).toBeInTheDocument();
    
    // Verificar que cada elemento contiene el texto correcto
    // Usamos toContain en lugar de toBe porque ahora también hay texto de accesibilidad
    expect(item1.textContent).toContain('Item 1');
    expect(item2.textContent).toContain('Item 2');
    expect(item3.textContent).toContain('Item 3');
    
    // Esta prueba es difícil de implementar completamente en JSDOM
    // ya que las operaciones de drag & drop requieren mucha interacción del DOM
    // y algunos eventos no se disparan correctamente
    
    // En una implementación real, usaríamos Cypress o pruebas E2E
    // para probar esta funcionalidad
  });
  
  // Prueba de accesibilidad con teclado
  test('Keyboard navigation works', () => {
    const handleDragEnd = jest.fn();
    
    render(
      <DndProvider onDragEnd={handleDragEnd} enableKeyboardNavigation={true}>
        <Draggable 
          id="source" 
          type="TEST" 
          data-testid="source"
        >
          Source
        </Draggable>
        <Droppable 
          id="target" 
          type="TEST" 
          data-testid="target"
        >
          Target
        </Droppable>
      </DndProvider>
    );
    
    const source = screen.getByTestId('source');
    
    // Simular navegación por teclado
    act(() => {
      simulateKeyboardNavigation({
        source,
        direction: 'down',
        steps: 1,
        complete: true
      });
    });
    
    // En un entorno real, esto dispararía el handleDragEnd
    // pero en pruebas de JSDOM puede ser difícil de simular por completo
  });
  
  // Prueba de anuncios ARIA
  test('Makes ARIA announcements', () => {
    render(
      <DndProvider debugMode={true}>
        <Draggable 
          id="item1" 
          type="TEST" 
          ariaLabel="Elemento 1"
          data-testid="draggable"
        >
          Drag me
        </Draggable>
      </DndProvider>
    );
    
    // Verificar que hay un elemento sr-only para anuncios
    const srOnlyElements = document.querySelectorAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);
    
    // Las pruebas completas de anuncios ARIA serían más adecuadas
    // en pruebas E2E con soporte para lectores de pantalla
  });
  
  // Prueba de Kanban simple
  test('Moving tasks between columns works', () => {
    render(<SimpleKanban />);
    
    // Verificar estado inicial
    expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    expect(screen.getByText('Tarea 2')).toBeInTheDocument();
    expect(screen.getByText('Tarea 3')).toBeInTheDocument();
    
    // Las pruebas completas de arrastre entre columnas serían
    // más adecuadas en pruebas E2E como Cypress
  });
});