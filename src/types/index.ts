/**
 * Tipos de elementos que se pueden arrastrar
 * Permite extensión mediante string para tipos personalizados
 */
export type DragItemType = string;

/**
 * Información sobre un elemento que está siendo arrastrado
 */
export interface DragItem<T = any> {
  id: string;
  type: DragItemType;
  parentId?: string;
  index?: number;
  data?: T;
}

/**
 * Posición de un elemento durante el arrastre
 */
export interface DragPosition {
  x: number;
  y: number;
}

/**
 * Estado del arrastre por teclado
 */
export interface KeyboardDragState {
  active: boolean;
  sourceId: string | null;
  currentDroppableId: string | null;
}

/**
 * Posición relativa donde se soltará un elemento
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Resultado de una operación de drop
 */
export interface DropResult {
  source: {
    id: string;
    type: DragItemType;
    parentId?: string;
    index?: number;
  };
  destination: {
    id: string;
    type: DragItemType;
    parentId?: string;
    position: DropPosition;
  };
  item: DragItem;
}

/**
 * Tipo del contexto de Drag and Drop
 */
export interface DndContextType {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dragPosition: DragPosition | null;
  keyboardDragState: KeyboardDragState;
  registerDraggable: (id: string, ref: React.RefObject<HTMLElement>) => void;
  registerDroppable: (id: string, ref: React.RefObject<HTMLElement>) => void;
  unregisterDraggable: (id: string) => void;
  unregisterDroppable: (id: string) => void;
  startDrag: (item: DragItem, event: React.DragEvent<any>) => void;
  endDrag: (result: DropResult | null) => void;
  resetDragState: () => void;
  // Nuevos métodos para accesibilidad
  startKeyboardDrag: (itemId: string) => void;
  moveToNextDroppable: (direction: 'up' | 'down' | 'left' | 'right') => void;
  completeKeyboardDrop: () => void;
  announce: (message: string) => void;
}

/**
 * Opciones para el hook useDrag
 */
export interface DragOptions<T = any, E extends Element = Element> {
  id: string;
  type: DragItemType;
  parentId?: string;
  index?: number;
  data?: T;
  disabled?: boolean;
  dragPreview?: React.ReactNode;
  onDragStart?: (event: React.DragEvent<E>) => void;
  onDragEnd?: (event: React.DragEvent<E>) => void;
  // Nuevas opciones para accesibilidad
  ariaLabel?: string;
  ariaDragLabel?: string;
}

/**
 * Opciones para el hook useDrop
 */
export interface DropOptions {
  id: string;
  type: DragItemType | DragItemType[];
  acceptTypes?: DragItemType[];
  parentId?: string;
  isGreedy?: boolean;
  disabled?: boolean;
  highlightOnDragOver?: boolean;
  onDragEnter?: (item: DragItem) => void;
  onDragLeave?: (item: DragItem) => void;
  onDragOver?: (item: DragItem, position: DropPosition) => void;
  onDrop?: (item: DragItem, position: DropPosition) => DropResult | null;
  // Nuevas opciones para accesibilidad
  ariaLabel?: string;
  ariaDroppableLabel?: string;
}

/**
 * Información de un nodo en la estructura anidada
 */
export interface DndNode {
  id: string;
  type: DragItemType;
  parentId?: string;
  children?: string[];
  level: number;
  index: number;
  rect?: DOMRect;
}