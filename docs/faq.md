# Preguntas Frecuentes (FAQ)

## Preguntas generales

### ¿Qué hace que diego-dnd sea diferente de otras bibliotecas de DnD?

diego-dnd fue diseñada específicamente para manejar estructuras anidadas complejas (como árboles de carpetas) de forma intuitiva. Mientras que otras bibliotecas como react-dnd o react-beautiful-dnd son excelentes opciones, diego-dnd proporciona:

- Un enfoque más simple e intuitivo para estructuras anidadas
- Indicadores visuales mejorados de dónde se colocará un elemento
- Una API fácil de entender centrada en componentes
- Soporte completo de TypeScript
- Un sistema de posicionamiento (before/after/inside) que facilita determinar dónde se insertará un elemento

### ¿Puedo usar diego-dnd con cualquier framework de UI?

diego-dnd está diseñado para React. Funciona con cualquier biblioteca de componentes de UI como Material-UI, Chakra UI, Ant Design, etc. Dado que genera elementos DOM estándar (divs), puedes aplicar cualquier estilo o clase CSS que necesites.

### ¿Cuál es el tamaño de la biblioteca?

diego-dnd es bastante ligera, con un tamaño gzipped de aproximadamente 5-6 KB. Esto la hace adecuada incluso para proyectos donde el tamaño del bundle es una preocupación.

## Instalación y configuración

### ¿Por qué necesito importar los archivos CSS?

Los estilos CSS proporcionan las visualizaciones predeterminadas para estados como "hover", "dragging" e indicadores de posición. Puedes sobrescribir estos estilos con tus propias clases CSS si necesitas personalizar la apariencia.

```jsx
import 'diego-dnd/dist/diego-dnd.css';
```

### ¿Cómo personalizo los estilos?

Puedes personalizar los estilos de varias maneras:

1. Pasando propiedades `style` y `className` a los componentes
2. Usando las props específicas como `dragActiveClass`, `dropOverClass`, etc.
3. Sobrescribiendo las clases CSS predeterminadas en tu propio archivo CSS

Por ejemplo:

```jsx
<Draggable
  id="item1"
  type="ITEM"
  dragActiveClass="my-custom-dragging-class"
  className="my-item"
  style={{ backgroundColor: 'blue', color: 'white' }}
>
  Contenido
</Draggable>
```

### ¿Puedo usar diego-dnd con TypeScript?

¡Absolutamente! diego-dnd está completamente escrita en TypeScript y proporciona tipos detallados para todas sus APIs. Esto te da autocompletado y verificación de tipos mientras escribes.

## Uso

### ¿Por qué mi elemento arrastrando no se ve?

Si no puedes ver el elemento mientras lo arrastras, verifica:

1. Que tienes correctamente importado el CSS: `import 'diego-dnd/dist/diego-dnd.css'`
2. Que no estás sobrescribiendo la opacidad del elemento con tus propios estilos
3. Que no tienes otros estilos CSS que puedan estar afectando la visualización

También puedes usar el componente `DragPreview` para personalizar por completo cómo se ve un elemento durante el arrastre:

```jsx
<DragPreview>
  {(item) => (
    <div className="custom-preview">
      {item.content}
    </div>
  )}
</DragPreview>
```

### ¿Puedo restringir dónde se pueden soltar los elementos?

¡Sí! Utiliza la propiedad `acceptTypes` en el componente `Droppable` para especificar qué tipos de elementos puede aceptar:

```jsx
<Droppable
  id="documents"
  type="FOLDER"
  acceptTypes={['DOCUMENT', 'IMAGE']}
>
  {/* contenido */}
</Droppable>
```

En este ejemplo, el Droppable solo aceptará elementos con tipo "DOCUMENT" o "IMAGE".

### ¿Cómo puedo obtener información detallada sobre la operación de arrastre?

El callback `onDragEnd` recibe un objeto `DropResult` que contiene información detallada:

```jsx
const handleDragEnd = (result) => {
  if (result) {
    console.log('Origen:', result.source);
    console.log('Destino:', result.destination);
    console.log('Elemento arrastrado:', result.item);
  }
};

<DndProvider onDragEnd={handleDragEnd}>
  {/* contenido */}
</DndProvider>
```

También puedes activar el modo de depuración para ver logs detallados en la consola:

```jsx
<DndProvider debugMode={true}>
  {/* contenido */}
</DndProvider>
```

### ¿Cómo puedo hacer que algunos elementos no sean arrastrables?

Usa la propiedad `disabled` en el componente `Draggable`:

```jsx
<Draggable
  id="locked-item"
  type="ITEM"
  disabled={true}
>
  Este elemento no se puede arrastrar
</Draggable>
```

### El rendimiento es lento con muchos elementos. ¿Qué puedo hacer?

Si tienes un gran número de elementos arrastrables y droppables, considera:

1. Usar virtualización (como `react-window` o `react-virtualized`) para renderizar solo los elementos visibles
2. Implementar memoización con React.memo para evitar re-renderizados innecesarios
3. Descomponer tus grandes listas en componentes más pequeños

```jsx
// Ejemplo con memoización
const MemoizedDraggable = React.memo(({ id, content }) => (
  <Draggable id={id} type="ITEM">
    {content}
  </Draggable>
));
```

## Solución de problemas

### Los elementos de mi lista dejan de ser arrastrables después de un par de operaciones

Este problema puede ocurrir si no estás manejando correctamente el estado después de cada operación. Asegúrate de:

1. Hacer una copia profunda del estado antes de modificarlo: `const newState = JSON.parse(JSON.stringify(state))`
2. Actualizar correctamente todos los índices y parentIds después de cada operación
3. No tener efectos secundarios no controlados en tus manejadores de eventos

### ¿Por qué obtengo errores de "tipos incompatibles" en TypeScript?

Si ves errores como "Type ... is not assignable to type ...", asegúrate de:

1. Estar utilizando la versión más reciente de diego-dnd
2. Especificar correctamente los tipos genéricos cuando sea necesario:

```tsx
interface TaskItem {
  id: string;
  title: string;
}

<Draggable<TaskItem>
  id="task-1"
  type="TASK"
  data={{ id: "task-1", title: "Mi tarea" }}
>
  {/* contenido */}
</Draggable>
```

### Los estilos de hover/drop no aparecen correctamente

Si los indicadores visuales no aparecen correctamente durante el arrastre:

1. Asegúrate de haber importado el archivo CSS
2. Verifica que no estás sobrescribiendo las clases CSS relevantes
3. Usa las propiedades `dropOverClass`, `dropBeforeClass`, etc. para personalizar los estilos

```jsx
<Droppable
  id="my-droppable"
  type="ZONE"
  dropOverClass="my-custom-over"
  dropBeforeClass="my-custom-before"
  dropAfterClass="my-custom-after"
  dropInsideClass="my-custom-inside"
>
  {/* contenido */}
</Droppable>
```

### No puedo arrastrar elementos en dispositivos móviles

El API de Drag and Drop HTML5 que diego-dnd utiliza no funciona bien en dispositivos táctiles. Para soporte táctil completo, considera:

1. Usar una biblioteca como React DnD Touch Backend junto con diego-dnd
2. Implementar manipuladores de eventos táctiles personalizados

## Preguntas avanzadas

### ¿Puedo extender la funcionalidad de diego-dnd?

¡Absolutamente! diego-dnd está diseñada para ser extensible. Puedes:

1. Crear tus propios componentes personalizados usando los hooks `useDrag` y `useDrop`
2. Acceder al contexto DnD directamente usando `useDndContext`
3. Crear utilidades personalizadas para manejar casos de uso específicos

### ¿Cómo implemento funcionalidad de autodesplazamiento?

Para implementar el autodesplazamiento (auto-scrolling) cuando arrastras cerca del borde de un contenedor con scroll:

```jsx
// En tu componente Droppable
const handleDragOver = (item, position) => {
  const container = containerRef.current;
  if (!container) return;
  
  const { top, bottom, height } = container.getBoundingClientRect();
  const scrollSpeed = 10;
  
  if (event.clientY < top + 50) {
    // Desplazar hacia arriba
    container.scrollTop -= scrollSpeed;
  } else if (event.clientY > bottom - 50) {
    // Desplazar hacia abajo
    container.scrollTop += scrollSpeed;
  }
};

<Droppable
  id="scrollable-container"
  type="LIST"
  onDragOver={handleDragOver}
  style={{ height: '400px', overflow: 'auto' }}
>
  {/* muchos elementos */}
</Droppable>
```

### ¿Cómo sincronizo el estado de DnD con un backend?

Para sincronizar el estado con un backend (por ejemplo, al cambiar el orden de elementos en una base de datos):

```jsx
const handleDragEnd = async (result) => {
  if (!result) return;
  
  // Actualizar el estado localmente primero para una UI responsiva
  updateLocalState(result);
  
  try {
    // Luego enviar los cambios al backend
    await api.updateItemOrder({
      itemId: result.item.id,
      newParentId: result.destination.id,
      position: result.destination.position
    });
  } catch (error) {
    // En caso de error, revertir al estado anterior
    revertToLastState();
    showErrorNotification('No se pudo actualizar el orden');
  }
};
```

### ¿Puedo implementar múltiples zonas de DnD independientes?

Sí, puedes tener múltiples sistemas DnD independientes usando varios componentes `DndProvider`. Solo asegúrate de que cada sistema tenga su propio contexto y no se solapen:

```jsx
<div className="layout">
  <div className="sidebar">
    <DndProvider>
      {/* Sistema DnD para el menú de la barra lateral */}
    </DndProvider>
  </div>
  
  <div className="main-content">
    <DndProvider>
      {/* Sistema DnD para el contenido principal */}
    </DndProvider>
  </div>
</div>
```

Si necesitas más ayuda o tienes otras preguntas, no dudes en abrir un issue en el repositorio de GitHub.