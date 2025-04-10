import { useState } from 'react';
import {
  DndProvider,
  Draggable,
  Droppable,
  DragPreview,
  DropResult
} from '../src';
import '../src/diego-dnd.css';

// Definir un tipo para los elementos
interface TaskItem {
  id: string;
  content: string;
  color?: string;
}

// Componente que representa un elemento de tarea
const Task: React.FC<{ task: TaskItem; index: number }> = ({ task, index }) => {
  return (
    <Draggable
      id={task.id}
      type="TASK"
      index={index}
      data={task}
      className="task-item"
      style={{ 
        backgroundColor: task.color || '#fff',
        padding: '10px',
        margin: '5px 0',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        cursor: 'grab'
      }}
    >
      {task.content}
    </Draggable>
  );
};

// Componente de columna donde se pueden colocar tareas
const TaskColumn: React.FC<{ 
  id: string, 
  title: string, 
  tasks: TaskItem[], 
  onDrop: (result: DropResult) => void 
}> = ({ id, title, tasks, onDrop }) => {
  return (
    <div className="task-column" style={{ width: '250px', margin: '0 10px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h3>
      <Droppable
        id={id}
        type="COLUMN"
        acceptTypes={['TASK']}
        dropOverClass="diego-dnd-over"
        dropBeforeClass="diego-dnd-position-before"
        dropAfterClass="diego-dnd-position-after"
        dropInsideClass="diego-dnd-position-inside"
        highlightOnDragOver={true}
        onDrop={(item, position) => {
          // Crear un resultado personalizado
          const result: DropResult = {
            source: {
              id: item.id,
              type: item.type,
              parentId: item.parentId,
              index: item.index
            },
            destination: {
              id,
              type: 'COLUMN',
              position
            },
            item
          };
          onDrop(result);
          return result;
        }}
        style={{
          minHeight: '300px',
          backgroundColor: '#f3f4f6',
          padding: '10px',
          borderRadius: '4px',
          border: '1px dashed #ccc',
          position: 'relative'
        }}
      >
        {tasks.map((task, index) => (
          <Task key={task.id} task={task} index={index} />
        ))}
      </Droppable>
    </div>
  );
};

// Aplicación principal
const DndTestApp: React.FC = () => {
  // Estado para nuestras columnas de tareas
  const [columns, setColumns] = useState<{[key: string]: TaskItem[]}>({
    todo: [
      { id: 'task1', content: 'Revisar código', color: '#ffecb3' },
      { id: 'task2', content: 'Probar la librería', color: '#e1f5fe' },
      { id: 'task3', content: 'Publicar en npm', color: '#e8f5e9' }
    ],
    inProgress: [
      { id: 'task4', content: 'Escribir documentación', color: '#f3e5f5' },
      { id: 'task5', content: 'Añadir tests unitarios', color: '#fff3e0' }
    ],
    done: [
      { id: 'task6', content: 'Setup inicial del proyecto', color: '#e0f2f1' }
    ]
  });
  
  // Manejar el evento de soltar
  const handleDrop = (result: DropResult) => {
    console.log('Drop result:', result);
    
    // Asegurarse de que hay un destino
    if (!result.destination) {
      console.log('No hay destino');
      return;
    }
    
    // Obtener la columna de origen y destino
    const sourceId = result.item.parentId || '';
    const destinationId = result.destination.id;
    
    // Determinar las columnas de origen y destino
    let sourceColumnKey: string;
    
    // Si el origen no tiene parentId, buscar en todas las columnas
    if (!sourceId) {
      // Buscar qué columna contiene la tarea
      sourceColumnKey = Object.keys(columns).find(key => 
        columns[key].some(task => task.id === result.item.id)
      ) || '';
      
      if (!sourceColumnKey) {
        console.log('No se encontró columna de origen');
        return;
      }
    } else {
      sourceColumnKey = sourceId;
    }
    
    const destColumnKey = destinationId;
    
    console.log(`Moviendo de ${sourceColumnKey} a ${destColumnKey}`);
    
    if (!columns[sourceColumnKey] || !columns[destColumnKey]) {
      console.log('Columna no encontrada', { sourceColumnKey, destColumnKey });
      return;
    }
    
    // Hacer una copia profunda de las columnas actuales
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    // Encontrar la tarea a mover por su ID
    const taskId = result.item.id;
    const sourceIndex = newColumns[sourceColumnKey].findIndex((task: { id: string; }) => task.id === taskId);
    
    if (sourceIndex === -1) {
      console.log('Tarea no encontrada en columna de origen');
      return;
    }
    
    // Eliminar la tarea de la columna de origen
    const [removedTask] = newColumns[sourceColumnKey].splice(sourceIndex, 1);
    
    // Calcular dónde insertar la tarea
    let insertIndex = 0;
    
    // Determinar el índice de inserción basado en la posición
    if (result.destination.position === 'after') {
      insertIndex = newColumns[destColumnKey].length;
    } else if (result.destination.position === 'before') {
      insertIndex = 0;
    } else if (result.destination.position === 'inside') {
      // Para 'inside', añadir al final por defecto
      insertIndex = newColumns[destColumnKey].length;
    }
    
    // Insertar la tarea en la posición calculada
    newColumns[destColumnKey].splice(insertIndex, 0, removedTask);
    
    // Actualizar el estado
    console.log('Estado actualizado:', JSON.parse(JSON.stringify(newColumns)));
    setColumns(newColumns);
  };
  
  // Manejadores para los eventos de drag and drop
  const handleDragStart = (item: any) => {
    console.log('Drag started:', item);
  };
  
  const handleDragEnd = (result: DropResult | null) => {
    console.log('Drag ended:', result);
  };
  
  return (
    <div className="dnd-test-app" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Prueba de diego-dnd</h2>
      
      <DndProvider 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        debugMode={true}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TaskColumn 
            id="todo" 
            title="Por hacer" 
            tasks={columns.todo} 
            onDrop={handleDrop}
          />
          <TaskColumn 
            id="inProgress" 
            title="En progreso" 
            tasks={columns.inProgress} 
            onDrop={handleDrop}
          />
          <TaskColumn 
            id="done" 
            title="Terminado" 
            tasks={columns.done} 
            onDrop={handleDrop}
          />
        </div>
        
        {/* Vista previa durante el arrastre */}
        <DragPreview>
          {(item) => {
            const task = item as TaskItem;
            return (
              <div 
                style={{
                  padding: '10px',
                  backgroundColor: task.color || '#fff',
                  borderRadius: '4px',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                  width: '200px'
                }}
              >
                {task.content}
              </div>
            );
          }}
        </DragPreview>
      </DndProvider>
    </div>
  );
};

export default DndTestApp;