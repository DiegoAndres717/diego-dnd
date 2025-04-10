// Componentes principales
export { DndProvider } from './components/DndContext';
export { Draggable } from './components/Draggable';
export { Droppable } from './components/Droppable';
export { DragPreview } from './components/DragPreview';

// Hooks
export { useDrag } from './hooks/useDrag';
export { useDrop } from './hooks/useDrop';
export { useDndContext } from './hooks/useDndContext';

// Utilidades
export { getDropPosition, findClosestElement, applyDropHighlight } from './utils/positionHelpers';

// Tipos
export type {
  DragItemType,
  DragItem,
  DragPosition,
  DropPosition,
  DropResult,
  DndContextType,
  DragOptions,
  DropOptions,
  DndNode
} from './types';

// Versión
export const VERSION = '0.1.0';