
/**
 * Datos básicos de un elemento arrastrable
 */
export interface DragItem {
  id: string;
  type: string;
  data?: unknown;
}

/**
 * Información completa del elemento durante el arrastre
 */
export interface DragContext extends DragItem {
  sourceIndex?: number;
  sourceParent?: string;
}

/**
 * Resultado de una operación de drop
 */
export interface DropResult {
  item: DragItem;
  source: {
    index?: number;
    parent?: string;
  };
  destination: {
    id: string;
    index?: number;
    parent?: string;
  };
}

/**
 * Posición de inserción
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Configuración básica para Draggable
 */
export interface DragConfig {
  id: string;
  type: string;
  data?: unknown;
  disabled?: boolean;
}

/**
 * Configuración básica para Droppable  
 */
export interface DropConfig {
  id: string;
  accept?: string | string[];
  disabled?: boolean;
  onDrop?: (result: DropResult) => void;
}

/**
 * Configuración avanzada para Draggable
 */
export interface AdvancedDragConfig extends DragConfig {
  sourceIndex?: number;
  sourceParent?: string;
  preview?: React.ReactNode;
  onDragStart?: (item: DragContext) => void;
  onDragEnd?: (result: DropResult | null) => void;
  // Accesibilidad
  ariaLabel?: string;
  dragInstruction?: string;
}

/**
 * Configuración avanzada para Droppable
 */
export interface AdvancedDropConfig extends DropConfig {
  isContainer?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onDragEnter?: (item: DragContext) => void;
  onDragLeave?: (item: DragContext) => void;
  onDragOver?: (item: DragContext, position: DropPosition) => void;
  // Accesibilidad  
  ariaLabel?: string;
  dropInstruction?: string;
}

/**
 * Estado interno del sistema DnD
 */
export interface DndState {
  isDragging: boolean;
  dragItem: DragContext | null;
  dragPosition: { x: number; y: number } | null;
}

/**
 * Contexto principal del sistema
 */
export interface DndContextValue extends DndState {
  // Registro de elementos
  registerDraggable: (id: string, element: HTMLElement, config: AdvancedDragConfig) => void;
  registerDroppable: (id: string, element: HTMLElement, config: AdvancedDropConfig) => void;
  unregisterDraggable: (id: string) => void;
  unregisterDroppable: (id: string) => void;
  
  // Control de operaciones
  startDrag: (config: AdvancedDragConfig, event: React.DragEvent) => void;
  endDrag: (result: DropResult | null) => void;
  
  // Utilidades
  canDrop: (dragType: string, dropAccept: string | string[]) => boolean;
  announce: (message: string) => void;
}

/**
 * Props para componentes de alto nivel
 */
export interface SortableListProps<T = unknown> {
  items: Array<T & { id: string }>;
  onReorder: (items: Array<T & { id: string }>) => void;
  renderItem: (item: T & {
      id: string 
}, index: number) => React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  dragClassName?: string;
  placeholder?: React.ReactNode;
}

/**
 * Props para área de drag and drop simple
 */
export interface DragDropAreaProps {
  accept: string | string[];
  onDrop: (items: DragItem[]) => void;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
}