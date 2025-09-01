# 📝 Lista de Tareas Completa

Una lista de tareas funcional con todas las características: añadir, eliminar, completar y reordenar.

![Todo List Demo](../assets/gifs/todo-list.gif)

## ✨ Características

- ✅ Añadir nuevas tareas
- ✅ Marcar como completadas/pendientes  
- ✅ Eliminar tareas
- ✅ Reordenar con drag & drop
- ✅ Persistencia en localStorage
- ✅ Contador de tareas
- ✅ Filtros (todas/pendientes/completadas)

## 🚀 Código Completo

```tsx
// TodoList.tsx
import React, { useState, useEffect } from 'react';
import { DndProvider, SortableList } from 'diego-dnd';
import './TodoList.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type Filter = 'all' | 'pending' | 'completed';

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('diego-todos');
    if (saved) {
      const parsedTodos = JSON.parse(saved).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Guardar en localStorage cuando cambian los todos
  useEffect(() => {
    localStorage.setItem('diego-todos', JSON.stringify(todos));
  }, [todos]);

  // Añadir nueva tarea
  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date()
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
  };

  // Toggle completar/pendiente
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  // Eliminar tarea
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Filtrar tareas
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'pending': return !todo.completed;
      case 'completed': return todo.completed;
      default: return true;
    }
  });

  // Estadísticas
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  };

  return (
    <DndProvider>
      <div className="todo-app">
        <header className="todo-header">
          <h1>📝 Mis Tareas</h1>
          
          {/* Input para nueva tarea */}
          <div className="add-todo">
            <input
              type="text"
              placeholder="¿Qué necesitas hacer?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              className="todo-input"
            />
            <button onClick={addTodo} className="add-button">
              ➕ Añadir
            </button>
          </div>

          {/* Estadísticas */}
          <div className="stats">
            <span className="stat">
              📊 Total: <strong>{stats.total}</strong>
            </span>
            <span className="stat">
              ⏳ Pendientes: <strong>{stats.pending}</strong>
            </span>
            <span className="stat">
              ✅ Completadas: <strong>{stats.completed}</strong>
            </span>
          </div>

          {/* Filtros */}
          <div className="filters">
            <button
              className={filter === 'all' ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter('all')}
            >
              Todas ({stats.total})
            </button>
            <button
              className={filter === 'pending' ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter('pending')}
            >
              Pendientes ({stats.pending})
            </button>
            <button
              className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter('completed')}
            >
              Completadas ({stats.completed})
            </button>
          </div>
        </header>

        {/* Lista de tareas */}
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              {filter === 'all' && (
                <div>
                  <span className="empty-icon">🎯</span>
                  <p>¡Empieza añadiendo tu primera tarea!</p>
                </div>
              )}
              {filter === 'pending' && (
                <div>
                  <span className="empty-icon">🎉</span>
                  <p>¡No tienes tareas pendientes!</p>
                </div>
              )}
              {filter === 'completed' && (
                <div>
                  <span className="empty-icon">📋</span>
                  <p>Aún no has completado ninguna tarea</p>
                </div>
              )}
            </div>
          ) : (
            <SortableList
              items={filteredTodos}
              onReorder={setTodos}
              renderItem={(todo) => (
                <TodoItem
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              )}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
}

// Componente individual de tarea
interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* Drag handle */}
      <div className="drag-handle">
        ⋮⋮
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        className="todo-checkbox"
      />

      {/* Texto */}
      <span className="todo-text">
        {todo.text}
      </span>

      {/* Timestamp */}
      <span className="todo-date">
        {todo.createdAt.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })}
      </span>

      {/* Botón eliminar */}
      <button
        onClick={onDelete}
        className="delete-button"
        title="Eliminar tarea"
      >
        🗑️
      </button>
    </div>
  );
}
```

## 🎨 Estilos CSS

```css
/* TodoList.css */
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.todo-header {
  margin-bottom: 32px;
}

.todo-header h1 {
  font-size: 2.5rem;
  margin-bottom: 24px;
  text-align: center;
  color: #2d3748;
}

/* Input nueva tarea */
.add-todo {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.todo-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Estadísticas */
.stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 24px;
}

.stat {
  font-size: 14px;
  color: #718096;
}

/* Filtros */
.filters {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.filter-button {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-button:hover {
  border-color: #667eea;
}

.filter-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Lista de tareas */
.todo-list {
  margin-top: 32px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
}

/* Item individual */
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: grab;
}

.todo-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  opacity: 0.7;
  background: #f7fafc;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #a0aec0;
}

/* Elementos del item */
.drag-handle {
  color: #cbd5e0;
  cursor: grab;
  font-weight: bold;
  user-select: none;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  color: #2d3748;
}

.todo-date {
  font-size: 12px;
  color: #a0aec0;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #fed7d7;
}

/* Durante arrastre */
.diego-dnd-dragging {
  transform: rotate(2deg) scale(0.98);
  opacity: 0.8;
  cursor: grabbing;
}

/* Responsive */
@media (max-width: 640px) {
  .todo-app {
    padding: 16px;
  }
  
  .add-todo {
    flex-direction: column;
  }
  
  .stats {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .filters {
    flex-wrap: wrap;
  }
  
  .todo-item {
    padding: 12px;
  }
}
```

## 🎯 Funcionalidades Principales

### 1. Gestión de Estado
- Estado local con `useState`
- Persistencia automática en `localStorage`
- Filtros reactivos

### 2. Drag & Drop  
- Reordenamiento visual inmediato
- Handle de arrastre dedicado
- Transiciones suaves

### 3. Interacciones
- Añadir con Enter o botón
- Toggle con click en checkbox
- Eliminar con confirmación visual

### 4. Responsive
- Adaptado a móviles
- Touch-friendly
- Layouts flexibles

## 🚀 Posibles Mejoras

```tsx
// Añadir categorías
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'urgent';
  createdAt: Date;
}

// Añadir fechas de vencimiento
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}

// Añadir prioridades
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}
```

## 📱 Demo en Vivo

- [CodeSandbox](https://codesandbox.io/s/diego-dnd-todo-list) - Prueba el código
- [GitHub](https://github.com/DiegoAndres717/diego-dnd/tree/main/examples/todo-list) - Código fuente completo

---

**Siguiente:** [📁 File Uploader](03-file-uploader.md) - Zona de carga de archivos