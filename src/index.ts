
// ===== CORE PROVIDER & CONTEXT =====
export { DndProvider, useDndContext } from './context/DndContext';

// ===== BASIC COMPONENTS =====
export { Draggable } from './components/Draggable';
export { Droppable } from './components/Droppable';

// ===== HIGH-LEVEL COMPONENTS (MOST COMMON USE CASES) =====
export { SortableList } from './components/SortableList';
export { DragDropArea } from './components/DragDropArea';
export { DragPreview } from './components/DragPreview';

// ===== HOOKS =====
export { useDrag } from './hooks/useDrag';
export { useDrop } from './hooks/useDrop';

// ===== UTILITIES =====
export {
  generateId,
  getDropPosition,
  isCompatibleType,
  reorderArray,
  findIndexById,
  insertAt,
  removeById
} from './utils';

// ===== TYPES (FOR ADVANCED USAGE) =====
export type {
  DragItem,
  DragContext,
  DropResult,
  DropPosition,
  DragConfig,
  DropConfig,
  AdvancedDragConfig,
  AdvancedDropConfig,
  SortableListProps,
  DragDropAreaProps
} from './types';

// ===== VERSION =====
export const VERSION = '2.0.0';