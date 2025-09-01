import { DropPosition } from '../types';

/**
 * Calcula la posición de drop basada en la posición del cursor
 */
export function getDropPosition(
  event: React.DragEvent,
  element: HTMLElement,
  orientation: 'horizontal' | 'vertical' = 'vertical',
  threshold = 0.5
): DropPosition {
  const rect = element.getBoundingClientRect();
  
  if (orientation === 'vertical') {
    const y = event.clientY - rect.top;
    const relativeY = y / rect.height;
    return relativeY < threshold ? 'before' : 'after';
  } else {
    const x = event.clientX - rect.left;
    const relativeX = x / rect.width;
    return relativeX < threshold ? 'before' : 'after';
  }
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return `diego-dnd-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Verifica si un tipo es compatible con los tipos aceptados
 */
export function isCompatibleType(dragType: string, acceptTypes: string | string[]): boolean {
  if (typeof acceptTypes === 'string') {
    return acceptTypes === '*' || acceptTypes === dragType;
  }
  return acceptTypes.includes('*') || acceptTypes.includes(dragType);
}

/**
 * Reordena un array moviendo un elemento de una posición a otra
 */
export function reorderArray<T>(
  array: T[], 
  fromIndex: number, 
  toIndex: number
): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Encuentra el índice de un elemento por ID
 */
export function findIndexById<T extends { id: string }>(
  array: T[], 
  id: string
): number {
  return array.findIndex(item => item.id === id);
}

/**
 * Inserta un elemento en un array en la posición especificada
 */
export function insertAt<T>(
  array: T[], 
  index: number, 
  item: T
): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

/**
 * Remueve un elemento de un array por ID
 */
export function removeById<T extends { id: string }>(
  array: T[], 
  id: string
): T[] {
  return array.filter(item => item.id !== id);
}