# ⚡ Quick Start - Tu primera lista en 5 minutos

¡Vamos a crear tu primera lista con drag & drop en menos de 5 minutos!

## 📦 Paso 1: Instalación

```bash
npm install diego-dnd
# o
yarn add diego-dnd
```

## 🎨 Paso 2: Importar estilos

```tsx
// En tu archivo principal (App.tsx, index.tsx)
import 'diego-dnd/dist/diego-dnd.css';
```

## 🚀 Paso 3: Tu primera lista

Crea un archivo `TaskList.tsx`:

```tsx
import React, { useState } from 'react';
import { DndProvider, SortableList } from 'diego-dnd';

interface Task {
  id: string;
  text: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: '🏠 Limpiar la casa' },
    { id: '2', text: '📚 Estudiar React' },
    { id: '3', text: '🛒 Ir de compras' },
    { id: '4', text: '💻 Programar proyecto' }
  ]);

  return (
    <DndProvider>
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h2>📝 Mis Tareas</h2>
        
        <SortableList
          items={tasks}
          onReorder={setTasks}
          renderItem={(task) => (
            <div style={{
              padding: '12px 16px',
              margin: '8px 0',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              cursor: 'grab'
            }}>
              {task.text}
            </div>
          )}
        />
      </div>
    </DndProvider>
  );
}
```

## 🎯 Paso 4: Usar en tu App

```tsx
// App.tsx
import { TaskList } from './TaskList';

export default function App() {
  return (
    <div className="App">
      <TaskList />
    </div>
  );
}
```

## ✨ ¡Resultado!

![Lista básica](assets/gifs/quick-start-result.gif)

**¡Eso es todo!** Ya tienes una lista completamente funcional con:
- ✅ Drag & drop
- ✅ Reordenamiento visual 
- ✅ Estado persistente
- ✅ Accesibilidad incluida

## 🎨 Mejorarlo con CSS

Añade estos estilos para que se vea mejor:

```css
/* TaskList.css */
.task-item {
  padding: 12px 16px;
  margin: 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-item:active {
  cursor: grabbing;
}

/* Durante el arrastre */
.diego-dnd-dragging {
  transform: rotate(5deg) scale(0.95);
  opacity: 0.8;
}
```

Y actualizar el componente:

```tsx
// Importar CSS
import './TaskList.css';

// Actualizar renderItem
renderItem={(task) => (
  <div className="task-item">
    {task.text}
  </div>
)}
```

## 🔥 Próximos pasos

¡Perfecto! Ahora que tienes lo básico funcionando, puedes:

### Añadir funcionalidades:
- [✅ **Lista de Tareas Completa**](examples/02-todo-list.md) - Añadir, eliminar, marcar como completado
- [📁 **Subir Archivos**](examples/03-file-uploader.md) - Zona de drop para archivos
- [📋 **Kanban Board**](examples/04-kanban-board.md) - Tablero estilo Trello

### Personalizar:
- [🎨 **Estilos**](guides/styling.md) - Temas y personalización
- [♿ **Accesibilidad**](guides/accessibility.md) - A11y y navegación por teclado

### Optimizar:
- [⚡ **Performance**](guides/performance.md) - Listas con miles de elementos
- [🧪 **Testing**](guides/testing.md) - Cómo testear tus componentes

## 🆘 ¿Problemas?

### No se ven los estilos
```tsx
// Asegúrate de importar el CSS
import 'diego-dnd/dist/diego-dnd.css';
```

### No funciona en móvil
```css
/* Añadir a tu CSS */
.diego-dnd-draggable {
  touch-action: none;
}
```

### TypeScript da errores
```bash
# Actualizar tipos
npm install @types/react@latest
```

---

**¿Listo para más?** Ve al [ejemplo completo de lista de tareas](examples/02-todo-list.md) 🚀