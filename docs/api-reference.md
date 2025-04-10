# Referencia de la API

Esta documentación describe en detalle todos los componentes, hooks y tipos disponibles en diego-dnd.

## Componentes

### DndProvider

El componente principal que envuelve todo el sistema de arrastrar y soltar.

#### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `children` | `ReactNode` | - | Contenido hijo a renderizar |
| `onDragStart` | `(item: DragItem) => void` | `undefined` | Callback cuando comienza una operación de arrastre |
| `onDragEnd` | `(result: DropResult \| null) => void` | `undefined` | Callback cuando finaliza una operación de arrastre |
| `debugMode` | `boolean` | `false` | Habilita logs de depuración en la consola |

#### Ejemplo

```jsx
<DndProvider 
  onDragStart={(item) => console.log('Inicio del arrastre:', item)}
  onDragEnd={(result) => console.log('Fin del arrastre:', result)}
  debugMode={true}
>
  {/* Tu aplicación aquí */}
</DndProvider>
```

### Draggable

Define un elemento que puede ser arrastrado.

#### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `id` | `string` | - | ID único del elemento arrastrable |
| `type` | `string` | - | Tipo de elemento (usado para limitar compatibilidad) |
| `parentId` | `string` | `undefined` | ID del elemento padre (para estructuras anidadas) |
| `index` | `number` | `undefined` | Posición en el array de elementos |
| `data` | `any` | `undefined` | Datos adicionales que se transportarán durante el arrastre |
| `disabled` | `boolean` | `false` | Si el elemento está deshabilitado para arrastre |
| `dragActiveClass` | `string` | `'diego-dnd-dragging'` | Clase CSS aplicada cuando el elemento está siendo arrastrado |
| `onDragStart` | `(event: DragEvent) => void` | `undefined` | Callback al iniciar el arrastre |
| `onDragEnd` | `(event: DragEvent) => void` | `undefined` | Callback al finalizar el arrastre |
| `children` | `ReactNode` | - | Contenido a renderizar |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | Cualquier prop de un `div` estándar |

#### Ejemplo

```jsx
<Draggable
  id="item-1"
  type="TASK"
  index={0}
  data={{ priority: 'high', assignee: 'John' }}
  dragActiveClass="my-dragging-class"
  onDragStart={(e) => console.log('Iniciando arrastre', e)}
>
  <div className="custom-item">
    Mi elemento arrastrable
  </div>
</Draggable>
```

### Droppable

Define una zona donde se pueden soltar elementos.

#### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `id` | `string` | - | ID único de la zona de destino |
| `type` | `string \| string[]` | - | Tipo(s) de elemento que esta zona puede recibir |
| `parentId` | `string` | `undefined` | ID del elemento padre (para estructuras anidadas) |
| `disabled` | `boolean` | `false` | Si está deshabilitado para recibir elementos |
| `dropOverClass` | `string` | `'diego-dnd-over'` | Clase CSS cuando un elemento está sobre la zona |
| `dropBeforeClass` | `string` | `'diego-dnd-position-before'` | Clase CSS para posición 'before' |
| `dropAfterClass` | `string` | `'diego-dnd-position-after'` | Clase CSS para posición 'after' |
| `dropInsideClass` | `string` | `'diego-dnd-position-inside'` | Clase CSS para posición 'inside' |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Orientación del contenedor |
| `acceptTypes` | `string[]` | `undefined` | Si solo acepta ciertos tipos de elementos |
| `isGreedy` | `boolean` | `false` | Si captura el evento (evita propagación) |
| `highlightOnDragOver` | `boolean` | `true` | Si muestra resaltado visual al arrastrar sobre él |
| `onDragEnter` | `(item: DragItem) => void` | `undefined` | Callback cuando un elemento entra en la zona |
| `onDragLeave` | `(item: DragItem) => void` | `undefined` | Callback cuando un elemento sale de la zona |
| `onDragOver` | `(item: DragItem, position: DropPosition) => void` | `undefined` | Callback durante el arrastre sobre la zona |
| `onDrop` | `(item: DragItem, position: DropPosition) => DropResult \| null` | `undefined` | Callback cuando se suelta un elemento en la zona |
| `children` | `ReactNode` | - | Contenido a renderizar |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | Cualquier prop de un `div` estándar |

#### Ejemplo

```jsx
<Droppable
  id="column-1"
  type="COLUMN"
  acceptTypes={['TASK']}
  orientation="vertical"
  isGreedy={true}
  onDragEnter={(item) => console.log('Elemento entrando', item)}
  onDragOver={(item, position) => console.log('Posición', position)}
  onDrop={(item, position) => {
    console.log('Soltado en posición', position);
    return {
      source: { id: item.id, type: item.type },
      destination: { id: 'column-1', type: 'COLUMN', position },
      item
    };
  }}
  style={{ minHeight: '300px', padding: '10px' }}
>
  {/* Contenido de la zona de destino */}
</Droppable>
```

### DragPreview

Componente que muestra una vista previa personalizada durante el arrastre.

#### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `children` | `(item: any, type: string) => ReactNode` | - | Función para renderizar el componente de vista previa |
| `className` | `string` | `'diego-dnd-preview'` | Clase CSS para el contenedor de la vista previa |
| `style` | `CSSProperties` | `{}` | Estilo inline para el contenedor |
| `offsetX` | `number` | `15` | Desplazamiento X desde el cursor |
| `offsetY` | `number` | `15` | Desplazamiento Y desde el cursor |
| `scale` | `number` | `0.8` | Escala de la vista previa (1 = tamaño original) |

#### Ejemplo

```jsx
<DragPreview
  offsetX={20}
  offsetY={20}
  scale={0.75}
  className="my-custom-preview"
>
  {(item) => (
    <div className="preview-card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
</DragPreview>
```

## Hooks

### useDrag

Hook para hacer elementos arrastrables.

#### Parámetros

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `options` | `DragOptions<T>` | Opciones de configuración para el elemento arrastrable |

#### Retorno

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `ref` | `React.RefObject<HTMLElement>` | Referencia para adjuntar al elemento DOM |
| `draggableProps` | `object` | Props para aplicar al elemento arrastrable |
| `isDragging` | `boolean` | Si el elemento está siendo arrastrado actualmente |

#### Ejemplo

```jsx
const MyDraggableItem = ({ id, data }) => {
  const { ref, draggableProps, isDragging } = useDrag({
    id,
    type: 'ITEM',
    data
  });

  return (
    <div
      ref={ref}
      {...draggableProps}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      Mi elemento personalizado
    </div>
  );
};
```

### useDrop

Hook para crear zonas donde se pueden soltar elementos.

#### Parámetros

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `options` | `DropOptions` | Opciones de configuración para la zona de destino |

#### Retorno

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `ref` | `React.RefObject<HTMLElement>` | Referencia para adjuntar al elemento DOM |
| `droppableProps` | `object` | Props para aplicar a la zona de destino |
| `dropState` | `{ isOver: boolean, dropPosition: DropPosition \| null }` | Estado actual de la zona |
| `dropClasses` | `object` | Clases CSS basadas en el estado actual |

#### Ejemplo

```jsx
const MyDropZone = ({ id, onItemDropped }) => {
  const { ref, droppableProps, dropState } = useDrop({
    id,
    type: 'ZONE',
    acceptTypes: ['ITEM'],
    onDrop: (item, position) => {
      onItemDropped(item, position);
      return {
        source: { id: item.id, type: item.type },
        destination: { id, type: 'ZONE', position },
        item
      };
    }
  });

  return (
    <div
      ref={ref}
      {...droppableProps}
      className={`drop-zone ${dropState.isOver ? 'active' : ''}`}
    >
      {dropState.isOver ? 'Suelta aquí' : 'Arrastra elementos aquí'}
    </div>
  );
};
```

### useDndContext

Hook para acceder al contexto DnD desde cualquier componente.

#### Retorno

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `isDragging` | `boolean` | Si hay una operación de arrastre en curso |
| `draggedItem` | `DragItem \| null` | El elemento que está siendo arrastrado actualmente |
| `dragPosition` | `DragPosition \| null` | La posición actual del arrastre |
| `registerDraggable` | `function` | Función para registrar un elemento arrastrable |
| `registerDroppable` | `function` | Función para registrar una zona de destino |
| `unregisterDraggable` | `function` | Función para eliminar el registro de un elemento arrastrable |
| `unregisterDroppable` | `function` | Función para eliminar el registro de una zona de destino |
| `startDrag` | `function` | Función para iniciar una operación de arrastre |
| `endDrag` | `function` | Función para finalizar una operación de arrastre |
| `resetDragState` | `function` | Función para resetear el estado de arrastre |

#### Ejemplo

```jsx
const DraggingIndicator = () => {
  const { isDragging, draggedItem } = useDndContext();

  if (!isDragging) return null;

  return (
    <div className="dragging-indicator">
      Arrastrando: {draggedItem.id}
    </div>
  );
};
```

## Tipos de TypeScript

### DragItem

Información sobre un elemento que está siendo arrastrado.

```typescript
interface DragItem<T = any> {
  id: string;
  type: string;
  parentId?: string;
  index?: number;
  data?: T;
}
```

### DropPosition

Posición relativa donde se soltará un elemento.

```typescript
type DropPosition = 'before' | 'after' | 'inside';
```

### DragPosition

Posición de un elemento durante el arrastre.

```typescript
interface DragPosition {
  x: number;
  y: number;
}
```

### DropResult

Resultado de una operación de drop.

```typescript
interface DropResult {
  source: {
    id: string;
    type: string;
    parentId?: string;
    index?: number;
  };
  destination: {
    id: string;
    type: string;
    parentId?: string;
    position: DropPosition;
  };
  item: DragItem;
}
```

### DragOptions

Opciones para el hook useDrag.

```typescript
interface DragOptions<T = any, E extends Element = Element> {
  id: string;
  type: string;
  parentId?: string;
  index?: number;
  data?: T;
  disabled?: boolean;
  dragPreview?: React.ReactNode;
  onDragStart?: (event: React.DragEvent<E>) => void;
  onDragEnd?: (event: React.DragEvent<E>) => void;
}
```

### DropOptions

Opciones para el hook useDrop.

```typescript
interface DropOptions {
  id: string;
  type: string | string[];
  acceptTypes?: string[];
  parentId?: string;
  isGreedy?: boolean;
  disabled?: boolean;
  highlightOnDragOver?: boolean;
  onDragEnter?: (item: DragItem) => void;
  onDragLeave?: (item: DragItem) => void;
  onDragOver?: (item: DragItem, position: DropPosition) => void;
  onDrop?: (item: DragItem, position: DropPosition) => DropResult | null;
}
```

## Utilitarios

### getDropPosition

Determina la posición relativa de un punto respecto a un elemento.

```typescript
function getDropPosition(
  event: React.DragEvent,
  element: HTMLElement,
  orientation: 'vertical' | 'horizontal' = 'vertical',
  thresholds = { before: 0.25, after: 0.75 }
): DropPosition;
```

### findClosestElement

Encuentra el elemento más cercano a un punto.

```typescript
function findClosestElement(
  containerEl: HTMLElement,
  clientX: number,
  clientY: number,
  selector: string = '*'
): { element: HTMLElement | null; position: DropPosition };
```

### applyDropHighlight

Aplica clases CSS para resaltar una zona de drop durante el arrastre.

```typescript
function applyDropHighlight(
  element: HTMLElement,
  position: DropPosition | null,
  active: boolean,
  customClasses?: { [key: string]: string }
): void;
```