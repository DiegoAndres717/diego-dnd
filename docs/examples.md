# Ejemplos Avanzados

Esta sección contiene ejemplos más detallados de cómo utilizar diego-dnd para casos de uso comunes y avanzados.

## Tablero Kanban

Un tablero Kanban es uno de los casos de uso más comunes para las bibliotecas de arrastrar y soltar. Este ejemplo muestra cómo implementar un tablero Kanban completo donde puedes arrastrar tareas entre columnas.

```jsx
import React, { useState } from 'react';
import { DndProvider, Draggable, Droppable, DragPreview } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

// Tipos para nuestras estructuras de datos
interface Task {
  id: string;
  content: string;
  color?: string;
}

interface Columns {
  [key: string]: Task[];
}

const KanbanBoard = () => {
  // Estado para nuestras columnas y tareas
  const [columns, setColumns] = useState<Columns>({
    todo: [
      { id: 'task1', content: 'Revisar diseño', color: '#ffecb3' },
      { id: 'task2', content: 'Actualizar dependencias', color: '#e1f5fe' },
    ],
    inProgress: [
      { id: 'task3', content: 'Implementar API', color: '#e8f5e9' },
    ],
    done: [
      { id: 'task4', content: 'Configurar CI/CD', color: '#f3e5f5' },
    ],
  });

  // Función para manejar el evento de soltar
  const handleDrop = (result) => {
    console.log('Drop result:', result);
    
    // Si no hay destino, cancelar
    if (!result.destination) return;
    
    // Extraer información del resultado
    const { source, destination, item } = result;
    const draggedTask = item.data;
    
    // Determinar la columna de origen y destino
    let sourceColumnId = '';
    let sourceTaskIndex = -1;
    
    // Buscar la tarea en todas las columnas
    Object.keys(columns).forEach(columnId => {
      const index = columns[columnId].findIndex(task => task.id === draggedTask.id);
      if (index !== -1) {
        sourceColumnId = columnId;
        sourceTaskIndex = index;
      }
    });
    
    // Si no encontramos la tarea, cancelar
    if (sourceColumnId === '' || sourceTaskIndex === -1) return;
    
    // La columna de destino es el ID del destino
    const destColumnId = destination.id;
    
    // Crear una copia profunda del estado
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    // Eliminar la tarea de la columna de origen
    const [removedTask] = newColumns[sourceColumnId].splice(sourceTaskIndex, 1);
    
    // Añadir la tarea a la columna de destino
    if (destination.position === 'inside') {
      // Para 'inside', añadimos al final de la columna
      newColumns[destColumnId].push(removedTask);
    } else {
      // Para determinar en qué posición insertar
      let insertIndex = 0;
      
      // Si hay un índice específico (para reordenar), usarlo
      if (destination.position === 'after') {
        insertIndex = newColumns[destColumnId].length;
      } else if (destination.position === 'before') {
        insertIndex = 0;
      }
      
      // Insertar la tarea en la posición correcta
      newColumns[destColumnId].splice(insertIndex, 0, removedTask);
    }
    
    // Actualizar el estado
    setColumns(newColumns);
  };

  // Renderizado del tablero
  return (
    <DndProvider onDragEnd={handleDrop} debugMode={true}>
      <div style={{ padding: '20px' }}>
        <h1>Tablero Kanban</h1>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {Object.keys(columns).map(columnId => (
            <div 
              key={columnId}
              style={{ 
                width: '300px', 
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>
                {columnId === 'todo' ? 'Por hacer' : 
                 columnId === 'inProgress' ? 'En progreso' : 'Terminado'}
              </h2>
              
              <Droppable
                id={columnId}
                type="COLUMN"
                acceptTypes={['TASK']}
                dropOverClass="column-over"
                style={{
                  minHeight: '400px',
                  transition: 'background-color 0.2s',
                }}
              >
                {columns[columnId].map((task, index) => (
                  <Draggable
                    key={task.id}
                    id={task.id}
                    type="TASK"
                    index={index}
                    data={task}
                    style={{
                      backgroundColor: task.color || 'white',
                      padding: '12px',
                      margin: '8px 0',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      cursor: 'grab',
                    }}
                  >
                    <div>{task.content}</div>
                  </Draggable>
                ))}
              </Droppable>
            </div>
          ))}
        </div>
        
        {/* Vista previa durante el arrastre */}
        <DragPreview>
          {(item) => {
            const task = item as Task;
            return (
              <div 
                style={{
                  padding: '12px',
                  backgroundColor: task.color || 'white',
                  borderRadius: '4px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                  width: '250px',
                }}
              >
                {task.content}
              </div>
            );
          }}
        </DragPreview>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
```

## Explorador de Archivos (Estructura Anidada)

Este ejemplo muestra cómo implementar un explorador de archivos con carpetas anidadas donde puedes arrastrar archivos entre carpetas y reorganizar la estructura.

```jsx
import React, { useState } from 'react';
import { DndProvider, Draggable, Droppable, DragPreview, DropResult } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

// Definir tipos para nuestros elementos
interface TreeItem {
  id: string;
  content: string;
  type: 'folder' | 'file';
  children?: TreeItem[];
  color?: string;
}

// Componente para representar un archivo o carpeta
const TreeNode = ({ 
  item, 
  parentId, 
  index, 
  level, 
  onDrop 
}) => {
  // Estado para controlar si la carpeta está expandida
  const [expanded, setExpanded] = useState(true);
  // Estado para mostrar indicadores de posición
  const [dropPosition, setDropPosition] = useState(null);
  
  return (
    <div style={{ marginLeft: `${level * 20}px`, position: 'relative' }}>
      {/* Indicadores de posición */}
      {dropPosition === 'before' && <div className="drop-indicator-before" />}
      {dropPosition === 'after' && <div className="drop-indicator-after" />}
      
      <Draggable
        id={item.id}
        type={item.type}
        parentId={parentId}
        index={index}
        data={item}
        className={`tree-node ${dropPosition === 'inside' ? 'drop-indicator-inside' : ''}`}
        style={{
          backgroundColor: item.color || '#fff',
          padding: '8px 12px',
          margin: '5px 0',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          position: 'relative'
        }}
      >
        {/* Icono según el tipo */}
        <span style={{ marginRight: '8px' }}>
          {item.type === 'folder' ? '📁' : '📄'}
        </span>
        
        {/* Contenido */}
        <span>{item.content}</span>
        
        {/* Botón expandir/contraer para carpetas */}
        {item.type === 'folder' && item.children && item.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {expanded ? '▼' : '►'}
          </button>
        )}
      </Draggable>
      
      {/* Si es una carpeta, crear un Droppable para sus hijos */}
      {item.type === 'folder' && (
        <Droppable
          id={`droppable-${item.id}`}
          type={['file', 'folder']}
          parentId={item.id}
          style={{
            display: expanded ? 'block' : 'none',
            padding: '4px 0',
            transition: 'all 0.2s ease',
            minHeight: '20px',
            border: '1px dashed transparent',
            borderRadius: '4px',
            position: 'relative'
          }}
          dropOverClass="folder-drop-active"
          isGreedy={true}
          onDragOver={(draggedItem, position) => {
            // Usamos esto para mostrar visualmente dónde se colocará el elemento
            setDropPosition(position);
          }}
          onDragLeave={() => {
            setDropPosition(null);
          }}
          onDrop={(draggedItem, position) => {
            setDropPosition(null);
            
            // Para folders, siempre queremos que el drop sea "inside"
            const effectivePosition = 'inside';
            
            // Crear un resultado personalizado
            const result = {
              source: {
                id: draggedItem.id,
                type: draggedItem.type,
                parentId: draggedItem.parentId,
                index: draggedItem.index
              },
              destination: {
                id: item.id,
                type: 'folder',
                parentId,
                position: effectivePosition
              },
              item: draggedItem
            };
            
            onDrop(result);
            return result;
          }}
        >
          {/* Renderizar hijos recursivamente si existen */}
          {item.children && item.children.length > 0 ? (
            item.children.map((child, childIndex) => (
              <TreeNode
                key={child.id}
                item={child}
                parentId={item.id}
                index={childIndex}
                level={level + 1}
                onDrop={onDrop}
              />
            ))
          ) : (
            <div className="empty-folder">
              Carpeta vacía - Arrastra archivos aquí
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};

// Función auxiliar para encontrar y eliminar un elemento por ID
const removeItemById = (items, id) => {
  return items.filter(item => {
    if (item.id === id) {
      return false;
    }
    if (item.children) {
      item.children = removeItemById(item.children, id);
    }
    return true;
  });
};

// Función auxiliar para añadir un elemento a un padre específico
const addItemToParent = (
  items,
  parentId,
  newItem,
  position,
  targetId
) => {
  return items.map(item => {
    // Si este es el elemento padre
    if (item.id === parentId) {
      if (!item.children) {
        item.children = [];
      }
      
      // Añadir según la posición
      if (position === 'inside') {
        item.children.push(newItem);
      } else if (targetId && (position === 'before' || position === 'after')) {
        const targetIndex = item.children.findIndex(child => child.id === targetId);
        if (targetIndex !== -1) {
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          item.children.splice(insertIndex, 0, newItem);
        } else {
          item.children.push(newItem);
        }
      }
      return item;
    }
    
    // Procesar recursivamente
    if (item.children) {
      item.children = addItemToParent(item.children, parentId, newItem, position, targetId);
    }
    
    return item;
  });
};

// Componente principal del explorador de archivos
const FileExplorer = () => {
  // Datos iniciales - estructura de archivos anidada
  const [items, setItems] = useState([
    {
      id: 'folder-1',
      content: 'Documentos',
      type: 'folder',
      color: '#e3f2fd',
      children: [
        {
          id: 'file-1',
          content: 'Reporte.docx',
          type: 'file',
          color: '#bbdefb'
        },
        {
          id: 'folder-2',
          content: 'Proyectos',
          type: 'folder',
          color: '#e3f2fd',
          children: [
            {
              id: 'file-3',
              content: 'Proyecto1.pdf',
              type: 'file',
              color: '#bbdefb'
            }
          ]
        }
      ]
    },
    {
      id: 'folder-3',
      content: 'Imágenes',
      type: 'folder',
      color: '#e8f5e9',
      children: [
        {
          id: 'file-4',
          content: 'Vacaciones.jpg',
          type: 'file',
          color: '#c8e6c9'
        }
      ]
    }
  ]);

  // Manejar el drop
  const handleDrop = (result) => {
    const { source, destination, item } = result;
    const draggedItem = item.data;
    
    if (!destination) return;
    
    // Prevenir el drop de un elemento en sí mismo
    if (source.id === destination.id) return;
    
    // Crear una copia de los items
    let newItems = JSON.parse(JSON.stringify(items));
    
    // Eliminar el elemento de su posición original
    newItems = removeItemById(newItems, draggedItem.id);
    
    // Si el destino es una carpeta y queremos poner el item dentro
    if (destination.position === 'inside') {
      // Si estamos soltando en la raíz
      if (destination.id === 'root') {
        newItems.push(draggedItem);
      } else {
        // Buscar la carpeta destino y añadir el item a sus hijos
        newItems = addItemToParent(
          newItems,
          destination.id,
          draggedItem,
          'inside'
        );
      }
    } else {
      // Si estamos soltando antes o después de un elemento a nivel raíz
      if (!destination.parentId) {
        const destIndex = newItems.findIndex(item => item.id === destination.id);
        if (destIndex !== -1) {
          const insertIndex = destination.position === 'before' ? destIndex : destIndex + 1;
          newItems.splice(insertIndex, 0, draggedItem);
        } else {
          newItems.push(draggedItem);
        }
      } else {
        // Si estamos soltando antes o después de un elemento dentro de una carpeta
        newItems = addItemToParent(
          newItems,
          destination.parentId,
          draggedItem,
          destination.position,
          destination.id
        );
      }
    }
    
    // Actualizar el estado
    setItems(newItems);
  };

  return (
    <DndProvider debugMode={true}>
      <div style={{ padding: '20px' }}>
        <h1>Explorador de Archivos</h1>
        
        <div style={{ 
          width: '400px', 
          margin: '0 auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9f9f9'
        }}>
          <Droppable
            id="root-droppable"
            type={['file', 'folder']}
            dropOverClass="diego-dnd-over"
            dropBeforeClass="diego-dnd-position-before"
            dropAfterClass="diego-dnd-position-after"
            dropInsideClass="diego-dnd-position-inside"
            highlightOnDragOver={true}
            onDrop={(draggedItem, position) => {
              // Si es dentro de la raíz, crear un resultado personalizado
              const result = {
                source: {
                  id: draggedItem.id,
                  type: draggedItem.type,
                  parentId: draggedItem.parentId,
                  index: draggedItem.index
                },
                destination: {
                  id: 'root',
                  type: 'root',
                  position
                },
                item: draggedItem
              };
              handleDrop(result);
              return result;
            }}
            style={{
              position: 'relative',
              minHeight: items.length ? 'auto' : '100px'
            }}
          >
            {items.map((item, index) => (
              <TreeNode
                key={item.id}
                item={item}
                index={index}
                level={0}
                onDrop={handleDrop}
              />
            ))}
          </Droppable>
        </div>
        
        {/* Vista previa durante el arrastre */}
        <DragPreview>
          {(item) => {
            const treeItem = item;
            return (
              <div style={{
                padding: '8px 12px',
                backgroundColor: treeItem.color || '#fff',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                width: '200px'
              }}>
                <span style={{ marginRight: '8px' }}>
                  {treeItem.type === 'folder' ? '📁' : '📄'}
                </span>
                {treeItem.content}
              </div>
            );
          }}
        </DragPreview>
      </div>
    </DndProvider>
  );
};

export default FileExplorer;
```

## Menú de navegación ordenable

Este ejemplo muestra cómo crear un menú de navegación donde puedes reordenar los elementos arrastrándolos.

```jsx
import React, { useState } from 'react';
import { DndProvider, Draggable, Droppable } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

const SortableNavMenu = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'about', label: 'Acerca de', icon: 'ℹ️' },
    { id: 'services', label: 'Servicios', icon: '🛠️' },
    { id: 'portfolio', label: 'Portafolio', icon: '📁' },
    { id: 'contact', label: 'Contacto', icon: '📞' }
  ]);

  const handleDrop = (result) => {
    const { source, destination, item } = result;
    
    if (!destination) return;
    
    // Encontrar índices para reordenar
    const itemId = item.id;
    const sourceIndex = menuItems.findIndex(menuItem => menuItem.id === itemId);
    
    // Crear una copia del array
    const newMenuItems = [...menuItems];
    
    // Eliminar el elemento de su posición original
    const [draggedItem] = newMenuItems.splice(sourceIndex, 1);
    
    // Determinar el índice de destino
    const destIndex = menuItems.findIndex(menuItem => menuItem.id === destination.id);
    const insertIndex = destination.position === 'before' ? destIndex : destIndex + 1;
    
    // Insertar el elemento en la nueva posición
    newMenuItems.splice(insertIndex, 0, draggedItem);
    
    // Actualizar el estado
    setMenuItems(newMenuItems);
  };

  return (
    <DndProvider onDragEnd={handleDrop}>
      <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px' }}>
        <h2>Menú de Navegación</h2>
        <p>Arrastra los elementos para reordenarlos</p>
        
        <Droppable
          id="nav-menu"
          type="MENU"
          dropBeforeClass="insert-before"
          dropAfterClass="insert-after"
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {menuItems.map((item, index) => (
            <Draggable
              key={item.id}
              id={item.id}
              type="MENU_ITEM"
              index={index}
              data={item}
              style={{
                padding: '12px 16px',
                margin: '8px 0',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab'
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '20px' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Draggable>
          ))}
        </Droppable>
      </div>
    </DndProvider>
  );
};

export default SortableNavMenu;
```

## Lista ordenable con restricciones

Este ejemplo muestra cómo crear una lista ordenable con restricciones: algunos elementos solo pueden ser colocados en ciertas posiciones.

```jsx
import React, { useState } from 'react';
import { DndProvider, Draggable, Droppable } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

const RestrictedSortableList = () => {
  const [items, setItems] = useState([
    { id: 'header', content: 'Encabezado', type: 'header', fixed: true },
    { id: 'intro', content: 'Introducción', type: 'content' },
    { id: 'main', content: 'Contenido principal', type: 'content' },
    { id: 'sidebar', content: 'Barra lateral', type: 'sidebar' },
    { id: 'footer', content: 'Pie de página', type: 'footer', fixed: true }
  ]);

  const handleDrop = (result) => {
    const { source, destination, item } = result;
    const draggedItem = item.data;
    
    if (!destination) return;
    
    // Verificar restricciones
    if (draggedItem.fixed) {
      console.log('Este elemento no se puede mover');
      return;
    }
    
    // Si estamos intentando poner un elemento en una posición no permitida
    const destIndex = items.findIndex(i => i.id === destination.id);
    if (
      // El pie de página siempre debe estar al final
      (destIndex === items.length - 1 && destination.position === 'after') ||
      // El encabezado siempre debe estar al principio
      (destIndex === 0 && destination.position === 'before')
    ) {
      console.log('No se puede colocar en esta posición');
      return;
    }
    
    // Procesamiento normal del drop
    const sourceIndex = items.findIndex(i => i.id === draggedItem.id);
    const newItems = [...items];
    
    // Eliminar el elemento de su posición original
    const [removed] = newItems.splice(sourceIndex, 1);
    
    // Calcular el índice de inserción
    let insertIndex;
    if (destination.position === 'before') {
      insertIndex = destIndex;
    } else {
      insertIndex = destIndex + 1;
    }
    
    // Insertar el elemento en la nueva posición
    newItems.splice(insertIndex, 0, removed);
    
    // Actualizar el estado
    setItems(newItems);
  };

  return (
    <DndProvider onDragEnd={handleDrop}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <h2>Lista con Restricciones</h2>
        <p>Elementos fijos no se pueden mover. Otros tienen posiciones restringidas.</p>
        
        <Droppable
          id="restricted-list"
          type="LIST"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}
        >
          {items.map((item, index) => (
            <Draggable
              key={item.id}
              id={item.id}
              type="ITEM"
              index={index}
              data={item}
              disabled={item.fixed}
              style={{
                padding: '12px',
                margin: '8px 0',
                backgroundColor: item.fixed ? '#f0f0f0' : 'white',
                borderRadius: '4px',
                border: `1px solid ${
                  item.type === 'header' ? '#2196f3' : 
                  item.type === 'footer' ? '#f44336' : 
                  item.type === 'sidebar' ? '#ff9800' : '#4caf50'
                }`,
                cursor: item.fixed ? 'not-allowed' : 'grab',
                opacity: item.fixed ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.content}</span>
                {item.fixed && (
                  <span style={{ fontSize: '12px', color: '#777' }}>
                    (Fijo)
                  </span>
                )}
              </div>
            </Draggable>
          ))}
        </Droppable>
      </div>
    </DndProvider>
  );
};

export default RestrictedSortableList;
```

Estos ejemplos muestran diferentes casos de uso y patrones avanzados que puedes implementar con diego-dnd. Cada uno incluye código completo que puedes adaptar a tus propios proyectos.