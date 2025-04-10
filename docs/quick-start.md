# Guía de inicio rápido

## Instalación

diego-dnd está disponible como un paquete npm y puede instalarse usando npm, yarn o pnpm:

```bash
# Con npm
npm install diego-dnd

# Con yarn
yarn add diego-dnd

# Con pnpm
pnpm add diego-dnd
```

Asegúrate de incluir los estilos CSS de la biblioteca:

```jsx
// En tu archivo principal (por ejemplo, App.js o index.js)
import 'diego-dnd/dist/diego-dnd.css';
```

## Conceptos básicos

diego-dnd se basa en algunos conceptos fundamentales:

### 1. Provider

Todo sistema de arrastrar y soltar debe estar envuelto en un `DndProvider` que gestiona el estado global:

```jsx
import { DndProvider } from 'diego-dnd';

const App = () => (
  <DndProvider>
    {/* Tu aplicación aquí */}
  </DndProvider>
);
```

### 2. Elementos arrastrables

Los elementos que se pueden arrastrar se definen con el componente `Draggable`:

```jsx
import { Draggable } from 'diego-dnd';

const DraggableItem = ({ id, content }) => (
  <Draggable id={id} type="ITEM">
    <div className="item">{content}</div>
  </Draggable>
);
```

### 3. Zonas de destino

Las áreas donde se pueden soltar elementos se definen con el componente `Droppable`:

```jsx
import { Droppable } from 'diego-dnd';

const DropZone = ({ id, children }) => (
  <Droppable id={id} type="ZONE">
    <div className="drop-zone">
      {children}
    </div>
  </Droppable>
);
```

### 4. Vista previa del arrastre

Puedes personalizar cómo se ve un elemento mientras se arrastra con `DragPreview`:

```jsx
import { DragPreview } from 'diego-dnd';

const App = () => (
  <DndProvider>
    {/* Tus componentes aquí */}
    
    <DragPreview>
      {(item) => (
        <div className="custom-preview">
          {item.content}
        </div>
      )}
    </DragPreview>
  </DndProvider>
);
```

## Ejemplo completo: Lista ordenable

Aquí tienes un ejemplo básico que muestra cómo crear una lista ordenable:

```jsx
import React, { useState } from 'react';
import { DndProvider, Draggable, Droppable } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

const SortableList = () => {
  const [items, setItems] = useState([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
    { id: '4', content: 'Item 4' }
  ]);

  const handleDrop = (result) => {
    const { source, destination, item } = result;
    
    // Si no hay destino, no hacer nada
    if (!destination) return;
    
    // Crear una copia de los items
    const newItems = [...items];
    
    // Encontrar y eliminar el item de su posición original
    const draggedItem = newItems.find(i => i.id === item.id);
    const draggedIndex = newItems.findIndex(i => i.id === item.id);
    newItems.splice(draggedIndex, 1);
    
    // Determinar dónde insertar el item
    let insertIndex = 0;
    
    if (destination.position === 'after') {
      // Encontrar el índice del elemento destino
      const destIndex = newItems.findIndex(i => i.id === destination.id);
      insertIndex = destIndex + 1;
    } else if (destination.position === 'before') {
      // Encontrar el índice del elemento destino
      const destIndex = newItems.findIndex(i => i.id === destination.id);
      insertIndex = destIndex;
    } else {
      // Para 'inside', vamos a añadir al final
      insertIndex = newItems.length;
    }
    
    // Insertar el item en la nueva posición
    newItems.splice(insertIndex, 0, draggedItem);
    
    // Actualizar el estado
    setItems(newItems);
  };

  return (
    <DndProvider onDragEnd={handleDrop} debugMode={true}>
      <h2>Lista ordenable</h2>
      <Droppable
        id="sortable-list"
        type="LIST"
        style={{
          padding: '10px',
          border: '1px dashed #ccc',
          borderRadius: '4px'
        }}
      >
        {items.map((item, index) => (
          <Draggable
            key={item.id}
            id={item.id}
            type="ITEM"
            index={index}
            data={item}
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              cursor: 'grab'
            }}
          >
            {item.content}
          </Draggable>
        ))}
      </Droppable>
    </DndProvider>
  );
};

export default SortableList;
```

## Trabajando con estructuras anidadas

diego-dnd brilla especialmente cuando se trabaja con estructuras anidadas como árboles de carpetas o menús jerárquicos.

La clave para implementar estas estructuras es:

1. Usar el atributo `parentId` en `Draggable` para establecer relaciones jerárquicas
2. Usar `Droppable` anidados para crear zonas donde se pueden soltar elementos
3. Gestionar correctamente el estado para mantener la estructura jerárquica

```jsx
<Draggable
  id="folder-1"
  type="folder"
  parentId="root"
  index={0}
>
  <div className="folder">Carpeta 1</div>
</Draggable>

<Droppable
  id="folder-1-contents"
  type="folder-contents"
  parentId="folder-1"
>
  <Draggable
    id="file-1"
    type="file"
    parentId="folder-1"
    index={0}
  >
    <div className="file">Archivo 1</div>
  </Draggable>
</Droppable>
```

Consulta [el ejemplo completo de anidamiento](examples.md) para más detalles.

## Siguientes pasos

- Explora la [Referencia de la API](api-reference.md) para conocer todas las opciones disponibles
- Revisa los [Ejemplos avanzados](examples.md) para inspirarte
- Consulta las [FAQ](faq.md) para solucionar problemas comunes