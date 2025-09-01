# 📋 Kanban Board - Tablero Estilo Trello

Un tablero Kanban completo con múltiples columnas, drag & drop entre ellas y gestión avanzada de tareas.

![Kanban Board Demo](../assets/gifs/kanban-board.gif)

## ✨ Características

- 📊 Múltiples columnas (To Do, In Progress, Done)
- 🔄 Mover tareas entre columnas
- 📝 Añadir/editar/eliminar tareas
- 🏷️ Etiquetas por prioridad
- 👤 Asignar usuarios
- 📅 Fechas de vencimiento
- 🎨 Colores por categoría
- 📱 Completamente responsive

## 🚀 Código Completo

```tsx
// KanbanBoard.tsx
import React, { useState, useCallback } from 'react';
import { DndProvider, Draggable, Droppable, SortableList } from 'diego-dnd';
import './KanbanBoard.css';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags: string[];
  createdAt: Date;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  limit?: number;
}

type ColumnId = 'todo' | 'inprogress' | 'done';

const INITIAL_COLUMNS: Record<ColumnId, Column> = {
  todo: {
    id: 'todo',
    title: '📝 To Do',
    tasks: [
      {
        id: '1',
        title: 'Diseñar nueva landing page',
        description: 'Crear mockups y prototipos para la nueva página principal',
        priority: 'high',
        assignee: 'Ana García',
        dueDate: '2024-02-15',
        tags: ['design', 'frontend'],
        createdAt: new Date('2024-01-10')
      },
      {
        id: '2',
        title: 'Configurar CI/CD',
        description: 'Implementar pipeline de despliegue automático',
        priority: 'medium',
        assignee: 'Carlos López',
        tags: ['devops', 'backend'],
        createdAt: new Date('2024-01-12')
      }
    ],
    color: '#e2e8f0',
    limit: 5
  },
  inprogress: {
    id: 'inprogress',
    title: '⚡ In Progress',
    tasks: [
      {
        id: '3',
        title: 'Implementar autenticación',
        description: 'JWT + OAuth2 con Google y GitHub',
        priority: 'high',
        assignee: 'Diego Andrés',
        dueDate: '2024-02-10',
        tags: ['backend', 'security'],
        createdAt: new Date('2024-01-08')
      }
    ],
    color: '#fed7aa',
    limit: 3
  },
  done: {
    id: 'done',
    title: '✅ Done',
    tasks: [
      {
        id: '4',
        title: 'Setup del proyecto',
        description: 'Configuración inicial con Vite + React + TypeScript',
        priority: 'medium',
        assignee: 'María Rodríguez',
        tags: ['setup', 'frontend'],
        createdAt: new Date('2024-01-05')
      }
    ],
    color: '#bbf7d0'
  }
};

export function KanbanBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [isAddingTask, setIsAddingTask] = useState<ColumnId | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  // Mover tarea entre columnas
  const handleTaskMove = useCallback((result: any) => {
    const { item, source, destination } = result;
    
    if (!destination) return;

    const sourceColumnId = source.parent as ColumnId;
    const destColumnId = destination.id as ColumnId;
    
    if (sourceColumnId === destColumnId) {
      // Reordenar dentro de la misma columna
      setColumns(prev => ({
        ...prev,
        [sourceColumnId]: {
          ...prev[sourceColumnId],
          tasks: prev[sourceColumnId].tasks // SortableList maneja el reorden
        }
      }));
      return;
    }

    // Mover entre columnas diferentes
    setColumns(prev => {
      const sourceColumn = prev[sourceColumnId];
      const destColumn = prev[destColumnId];
      
      // Verificar límite de la columna destino
      if (destColumn.limit && destColumn.tasks.length >= destColumn.limit) {
        alert(`La columna ${destColumn.title} ha alcanzado su límite de ${destColumn.limit} tareas`);
        return prev;
      }

      const taskToMove = sourceColumn.tasks.find(task => task.id === item.id);
      if (!taskToMove) return prev;

      return {
        ...prev,
        [sourceColumnId]: {
          ...sourceColumn,
          tasks: sourceColumn.tasks.filter(task => task.id !== item.id)
        },
        [destColumnId]: {
          ...destColumn,
          tasks: [newTask, ...prev[columnId].tasks]
      }
    }));
    
    setIsAddingTask(null);
  };

  // Eliminar tarea
  const deleteTask = (taskId: string) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId as ColumnId] = {
          ...newColumns[columnId as ColumnId],
          tasks: newColumns[columnId as ColumnId].tasks.filter(task => task.id !== taskId)
        };
      });
      return newColumns;
    });
  };

  // Editar tarea
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId as ColumnId] = {
          ...newColumns[columnId as ColumnId],
          tasks: newColumns[columnId as ColumnId].tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        };
      });
      return newColumns;
    });
    
    setEditingTask(null);
  };

  // Obtener estadísticas
  const getStats = () => {
    const allTasks = Object.values(columns).flatMap(col => col.tasks);
    return {
      total: allTasks.length,
      todo: columns.todo.tasks.length,
      inProgress: columns.inprogress.tasks.length,
      done: columns.done.tasks.length,
      highPriority: allTasks.filter(t => t.priority === 'high').length,
      overdue: allTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date()
      ).length
    };
  };

  const stats = getStats();

  return (
    <DndProvider onDragEnd={handleTaskMove}>
      <div className="kanban-board">
        {/* Header con estadísticas */}
        <header className="kanban-header">
          <h1>📋 Kanban Board</h1>
          
          <div className="board-stats">
            <div className="stat">
              📊 Total: <strong>{stats.total}</strong>
            </div>
            <div className="stat">
              📝 To Do: <strong>{stats.todo}</strong>
            </div>
            <div className="stat">
              ⚡ En Progreso: <strong>{stats.inProgress}</strong>
            </div>
            <div className="stat">
              ✅ Completadas: <strong>{stats.done}</strong>
            </div>
            {stats.highPriority > 0 && (
              <div className="stat priority">
                🔥 Alta Prioridad: <strong>{stats.highPriority}</strong>
              </div>
            )}
            {stats.overdue > 0 && (
              <div className="stat overdue">
                ⏰ Vencidas: <strong>{stats.overdue}</strong>
              </div>
            )}
          </div>
        </header>

        {/* Columnas del tablero */}
        <div className="kanban-columns">
          {Object.values(columns).map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={() => setIsAddingTask(column.id as ColumnId)}
              isAddingTask={isAddingTask === column.id}
              onCancelAdd={() => setIsAddingTask(null)}
              onConfirmAdd={(taskData) => addTask(column.id as ColumnId, taskData)}
              onEditTask={setEditingTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              editingTask={editingTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

// Componente de columna individual
interface KanbanColumnProps {
  column: Column;
  onAddTask: () => void;
  isAddingTask: boolean;
  onCancelAdd: () => void;
  onConfirmAdd: (taskData: Partial<Task>) => void;
  onEditTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  editingTask: string | null;
}

function KanbanColumn({
  column,
  onAddTask,
  isAddingTask,
  onCancelAdd,
  onConfirmAdd,
  onEditTask,
  onUpdateTask,
  onDeleteTask,
  editingTask
}: KanbanColumnProps) {
  
  return (
    <div className="kanban-column">
      {/* Header de la columna */}
      <div className="column-header" style={{ backgroundColor: column.color }}>
        <h3 className="column-title">
          {column.title}
          <span className="task-count">({column.tasks.length})</span>
          {column.limit && (
            <span className="column-limit">
              / {column.limit}
            </span>
          )}
        </h3>
        
        <button
          onClick={onAddTask}
          className="add-task-btn"
          disabled={column.limit ? column.tasks.length >= column.limit : false}
          title="Añadir nueva tarea"
        >
          ➕
        </button>
      </div>

      {/* Formulario para añadir tarea */}
      {isAddingTask && (
        <TaskForm
          onSubmit={onConfirmAdd}
          onCancel={onCancelAdd}
        />
      )}

      {/* Lista de tareas usando Droppable y SortableList */}
      <Droppable
        config={{
          id: column.id,
          accept: 'kanban-task',
          onDrop: (result) => {
            // El manejo del drop se hace en el componente padre
          }
        }}
        className="column-tasks"
      >
        <SortableList
          items={column.tasks}
          onReorder={(reorderedTasks) => {
            // Actualizar orden en la misma columna
          }}
          renderItem={(task) => (
            <TaskCard
              key={task.id}
              task={task}
              isEditing={editingTask === task.id}
              onEdit={() => onEditTask(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
              onDelete={() => onDeleteTask(task.id)}
              columnId={column.id}
            />
          )}
          direction="vertical"
          className="tasks-list"
          placeholder={
            <div className="empty-column">
              <span className="empty-icon">📭</span>
              <p>No hay tareas</p>
              <small>Arrastra tareas aquí o añade una nueva</small>
            </div>
          }
        />
      </Droppable>
    </div>
  );
}

// Componente de tarjeta de tarea
interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  columnId: string;
}

function TaskCard({ task, isEditing, onEdit, onUpdate, onDelete, columnId }: TaskCardProps) {
  if (isEditing) {
    return (
      <TaskForm
        task={task}
        onSubmit={onUpdate}
        onCancel={() => {}}
      />
    );
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#fed7d7';
      case 'medium': return '#fef3c7';
      case 'low': return '#d1fae5';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🟢';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Draggable
      config={{
        id: task.id,
        type: 'kanban-task',
        data: { ...task, sourceColumn: columnId }
      }}
    >
      <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
        {/* Header de la tarjeta */}
        <div className="task-header">
          <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
            {getPriorityIcon(task.priority)}
          </div>
          <div className="task-actions">
            <button onClick={onEdit} className="edit-btn" title="Editar">
              ✏️
            </button>
            <button onClick={onDelete} className="delete-btn" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <h4 className="task-title">{task.title}</h4>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map(tag => (
              <span key={tag} className="task-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer con info adicional */}
        <div className="task-footer">
          {task.assignee && (
            <div className="task-assignee" title={task.assignee}>
              👤 {task.assignee.split(' ')[0]}
            </div>
          )}
          
          {task.dueDate && (
            <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
              📅 {new Date(task.dueDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

// Formulario para añadir/editar tareas
interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as Task['priority'],
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || '',
    tags: task?.tags?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      assignee: formData.assignee.trim() || undefined,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Título de la tarea..."
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        className="form-input"
        autoFocus
        required
      />
      
      <textarea
        placeholder="Descripción (opcional)..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="form-textarea"
        rows={3}
      />
      
      <div className="form-row">
        <select
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
          className="form-select"
        >
          <option value="low">🟢 Baja</option>
          <option value="medium">⚡ Media</option>
          <option value="high">🔥 Alta</option>
        </select>
        
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          className="form-input"
          title="Fecha de vencimiento"
        />
      </div>
      
      <input
        type="text"
        placeholder="Asignado a..."
        value={formData.assignee}
        onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
        className="form-input"
      />
      
      <input
        type="text"
        placeholder="Tags (separados por comas)..."
        value={formData.tags}
        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
        className="form-input"
      />
      
      <div className="form-actions">
        <button type="submit" className="confirm-btn">
          ✅ {task ? 'Actualizar' : 'Añadir'}
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
}
```

## 🎨 Estilos CSS

```css
/* KanbanBoard.css */
.kanban-board {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.kanban-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.kanban-header h1 {
  font-size: 3rem;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.board-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.stat {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.stat.priority {
  color: #fbbf24;
  font-weight: bold;
}

.stat.overdue {
  color: #f87171;
  font-weight: bold;
}

/* Columnas */
.kanban-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.kanban-column {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  height: fit-content;
}

/* Header de columna */
.column-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.column-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-count {
  font-size: 0.9rem;
  opacity: 0.7;
}

.column-limit {
  font-size: 0.8rem;
  opacity: 0.6;
}

.add-task-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-task-btn:hover {
  transform: scale(1.1);
  background: white;
}

.add-task-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Lista de tareas */
.column-tasks {
  min-height: 200px;
  padding: 16px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

/* Tarjeta de tarea */
.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: grab;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.overdue {
  border-color: #f87171;
  background: linear-gradient(135deg, #fef2f2 0%, white 50%);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Contenido de la tarjeta */
.task-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.4;
}

.task-description {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 12px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.task-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #4c51bf;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #a0aec0;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due-date.overdue {
  color: #e53e3e;
  font-weight: 600;
}

/* Formulario de tarea */
.task-form {
  background: #f7fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 2px solid #e2e8f0;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.confirm-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}

.cancel-btn:hover {
  background: #d1d5db;
}

/* Durante arrastre */
.diego-dnd-dragging {
  transform: rotate(3deg) scale(1.05);
  opacity: 0.9;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  cursor: grabbing;
}

/* Zona activa de drop */
.diego-dnd-drop-active {
  background: rgba(102, 126, 234, 0.05);
  border: 2px dashed #667eea;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .kanban-board {
    padding: 16px;
  }

  .kanban-header h1 {
    font-size: 2rem;
  }

  .board-stats {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .kanban-columns {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .task-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .column-header {
    padding: 16px;
  }

  .task-card {
    padding: 12px;
  }

  .task-actions {
    opacity: 1;
  }
}
```

## 🎯 Funcionalidades Avanzadas

### 1. Límites de Columnas
```tsx
// Verificar límite antes de mover
if (destColumn.limit && destColumn.tasks.length >= destColumn.limit) {
  alert(`La columna ${destColumn.title} ha alcanzado su límite`);
  return;
}
```

### 2. Validación de Fechas
```tsx
const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
```

### 3. Filtros y Búsqueda
```tsx
const [filters, setFilters] = useState({
  assignee: '',
  priority: '',
  dueDate: '',
  tags: []
});

const filteredTasks = tasks.filter(task => {
  if (filters.assignee && !task.assignee?.includes(filters.assignee)) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.tags.length && !filters.tags.some(tag => task.tags.includes(tag))) return false;
  return true;
});
```

## 🚀 Mejoras Posibles

### Persistencia con Backend
```tsx
const saveBoard = async (columns: Record<ColumnId, Column>) => {
  await fetch('/api/kanban-board', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(columns)
  });
};
```

### Tiempo Real con WebSockets
```tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001/kanban');
  
  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    
    if (type === 'TASK_MOVED') {
      setColumns(data.columns);
    }
  };
  
  return () => ws.close();
}, []);
```

### Notificaciones
```tsx
const checkOverdueTasks = () => {
  const overdue = Object.values(columns)
    .flatMap(col => col.tasks)
    .filter(task => task.dueDate && new Date(task.dueDate) < new Date());
    
  if (overdue.length > 0) {
    showNotification(`Tienes ${overdue.length} tareas vencidas`);
  }
};
```

## 📱 Demo en Vivo

- [CodeSandbox](https://codesandbox.io/s/diego-dnd-kanban-board) - Prueba el tablero
- [GitHub](https://github.com/DiegoAndres717/diego-dnd/tree/main/examples/kanban-board) - Código completo

---

**Siguiente:** [📁 Carpetas Anidadas](05-nested-folders.md) 
