import { DropPosition } from '../types';

/**
 * Determina la posición relativa de un punto respecto a un elemento
 * @param event Evento de arrastre
 * @param element Elemento de referencia
 * @param orientation Orientación del contenedor ('vertical' o 'horizontal')
 * @param thresholds Umbrales personalizados (valores de 0 a 1)
 * @returns Posición relativa ('before', 'after' o 'inside')
 */
export function getDropPosition(
  event: React.DragEvent,
  element: HTMLElement,
  orientation: 'vertical' | 'horizontal' = 'vertical',
  thresholds = { before: 0.25, after: 0.75 }
): DropPosition {
  const rect = element.getBoundingClientRect();
  
  // Para orientación vertical (default)
  if (orientation === 'vertical') {
    const y = event.clientY - rect.top;
    const height = rect.height;
    const relativePosition = y / height;
    
    if (relativePosition < thresholds.before) {
      return 'before';
    } else if (relativePosition > thresholds.after) {
      return 'after';
    } else {
      return 'inside';
    }
  } 
  // Para orientación horizontal
  else {
    const x = event.clientX - rect.left;
    const width = rect.width;
    const relativePosition = x / width;
    
    if (relativePosition < thresholds.before) {
      return 'before';
    } else if (relativePosition > thresholds.after) {
      return 'after';
    } else {
      return 'inside';
    }
  }
}

/**
 * Encuentra el elemento más cercano a un punto (útil para containers)
 * @param containerEl Elemento contenedor
 * @param clientX Posición X del cursor
 * @param clientY Posición Y del cursor
 * @param selector Selector CSS para filtrar elementos hijos
 * @returns El elemento más cercano y la posición relativa
 */
export function findClosestElement(
  containerEl: HTMLElement,
  clientX: number,
  clientY: number,
  selector: string = '*'
): { element: HTMLElement | null; position: DropPosition } {
  // Obtener todos los elementos hijos que coincidan con el selector
  const children = Array.from(containerEl.querySelectorAll(selector)) as HTMLElement[];
  
  if (children.length === 0) {
    return { element: null, position: 'inside' };
  }
  
  // Convertir coordenadas globales a relativas al contenedor
  const containerRect = containerEl.getBoundingClientRect();
  const x = clientX - containerRect.left;
  const y = clientY - containerRect.top;
  
  // Variables para encontrar el elemento más cercano
  let closestElement: HTMLElement | null = null;
  let closestDistance = Number.MAX_VALUE;
  let closestPosition: DropPosition = 'inside';
  
  // Buscar el elemento más cercano
  children.forEach(element => {
    const rect = element.getBoundingClientRect();
    const relativeRect = {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      right: rect.right - containerRect.left,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height
    };
    
    // Calcular puntos de interés en el elemento
    const centerX = relativeRect.left + relativeRect.width / 2;
    const centerY = relativeRect.top + relativeRect.height / 2;
    
    // Calcular distancias a diferentes puntos del elemento
    const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const distanceToTop = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - relativeRect.top, 2));
    const distanceToBottom = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - relativeRect.bottom, 2));
    
    // Determinar si este elemento está más cerca que el anterior más cercano
    const minDistance = Math.min(distanceToCenter, distanceToTop, distanceToBottom);
    
    if (minDistance < closestDistance) {
      closestDistance = minDistance;
      closestElement = element;
      
      // Determinar la posición relativa
      if (minDistance === distanceToTop) {
        closestPosition = 'before';
      } else if (minDistance === distanceToBottom) {
        closestPosition = 'after';
      } else {
        closestPosition = 'inside';
      }
    }
  });
  
  return { element: closestElement, position: closestPosition };
}

/**
 * Aplica clases CSS para resaltar una zona de drop durante el arrastre
 * @param element Elemento a resaltar
 * @param position Posición de drop ('before', 'after', 'inside')
 * @param active Si está activo o no
 * @param customClasses Clases personalizadas
 */
export function applyDropHighlight(
  element: HTMLElement,
  position: DropPosition | null,
  active: boolean,
  customClasses: { [key: string]: string } = {
    base: 'diego-dnd-highlight',
    before: 'diego-dnd-highlight-before',
    after: 'diego-dnd-highlight-after',
    inside: 'diego-dnd-highlight-inside'
  }
) {
  // Remover todas las clases posibles primero
  element.classList.remove(
    customClasses.base,
    customClasses.before,
    customClasses.after,
    customClasses.inside
  );
  
  // Si está activo, añadir la clase base y la específica para la posición
  if (active) {
    element.classList.add(customClasses.base);
    
    if (position) {
      element.classList.add(customClasses[position]);
    }
  }
}