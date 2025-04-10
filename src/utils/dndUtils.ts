import { DragItem, DropResult, DndNode } from '../types';

/**
 * Genera un ID único para elementos arrastables o zonas de destino
 * @returns String con ID único
 */
export const generateUniqueId = (): string => {
  return `diego-dnd-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Determina si un tipo es aceptado por una zona de destino
 * @param dragType Tipo del elemento arrastrado
 * @param acceptTypes Array de tipos aceptados
 * @returns Boolean indicando si es aceptado
 */
export const isTypeAccepted = (
  dragType: string, 
  acceptTypes?: string[]
): boolean => {
  // Si no hay tipos definidos o es un array vacío, aceptar todo
  if (!acceptTypes || acceptTypes.length === 0) {
    return true;
  }
  
  // Verificar si el tipo está en la lista de aceptados
  return acceptTypes.includes(dragType);
};

/**
 * Crea el mapa de relaciones entre nodos para estructuras anidadas
 * @param nodes Lista plana de nodos
 * @returns Mapa con relaciones padre-hijo
 */
export const createNodeMap = (nodes: DndNode[]): Map<string, DndNode[]> => {
  const nodeMap = new Map<string, DndNode[]>();
  
  // Agrupar nodos por su parentId
  nodes.forEach(node => {
    const parentId = node.parentId || 'root';
    
    if (!nodeMap.has(parentId)) {
      nodeMap.set(parentId, []);
    }
    
    nodeMap.get(parentId)?.push(node);
  });
  
  // Ordenar nodos por su índice dentro de cada grupo
  nodeMap.forEach((nodeList, parentId) => {
    nodeMap.set(parentId, nodeList.sort((a, b) => a.index - b.index));
  });
  
  return nodeMap;
};

/**
 * Encuentra un nodo en una estructura anidada
 * @param items Array de elementos anidados
 * @param id ID a buscar
 * @param idField Nombre del campo ID
 * @param childrenField Nombre del campo de hijos
 * @returns El elemento encontrado o null
 */
export function findNodeById<T extends { [key: string]: any }>(
  items: T[],
  id: string,
  idField: string = 'id',
  childrenField: string = 'children'
): T | null {
  // Buscar en el nivel actual
  for (const item of items) {
    if (item[idField] === id) {
      return item;
    }
    
    // Buscar en los hijos si existen
    if (item[childrenField] && Array.isArray(item[childrenField])) {
      const found = findNodeById(item[childrenField], id, idField, childrenField);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Elimina un nodo de una estructura anidada
 * @param items Array de elementos anidados
 * @param id ID a eliminar
 * @param idField Nombre del campo ID
 * @param childrenField Nombre del campo de hijos
 * @returns Nuevo array sin el elemento eliminado
 */
export function removeNodeById<T extends { [key: string]: any }>(
  items: T[],
  id: string,
  idField: string = 'id',
  childrenField: string = 'children'
): T[] {
  // Filtrar elementos del nivel actual
  const result = items.filter(item => item[idField] !== id);
  
  // Procesar hijos recursivamente
  return result.map(item => {
    if (item[childrenField] && Array.isArray(item[childrenField])) {
      return {
        ...item,
        [childrenField]: removeNodeById(item[childrenField], id, idField, childrenField)
      };
    }
    return item;
  });
}

/**
 * Crea una copia profunda del objeto
 * @param obj Objeto a copiar
 * @returns Copia profunda del objeto
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Crea un objeto DropResult a partir de información de drag y drop
 * @param draggedItem Elemento arrastrado
 * @param destinationId ID del destino
 * @param destinationType Tipo del destino
 * @param destinationParentId ID del padre del destino
 * @param position Posición relativa
 * @returns Objeto DropResult
 */
export const createDropResult = (
  draggedItem: DragItem,
  destinationId: string,
  destinationType: string,
  destinationParentId?: string,
  position: 'before' | 'after' | 'inside' = 'inside'
): DropResult => {
  return {
    source: {
      id: draggedItem.id,
      type: draggedItem.type,
      parentId: draggedItem.parentId,
      index: draggedItem.index
    },
    destination: {
      id: destinationId,
      type: destinationType,
      parentId: destinationParentId,
      position
    },
    item: draggedItem
  };
};

/**
 * Convierte una estructura anidada a una lista plana
 * @param items Array anidado
 * @param idField Nombre del campo ID
 * @param childrenField Nombre del campo de hijos
 * @param parentId ID del nodo padre
 * @param level Nivel de anidamiento
 * @returns Lista plana de nodos
 */
export function flattenTree<T extends { [key: string]: any }>(
  items: T[],
  idField: string = 'id',
  childrenField: string = 'children',
  parentId: string | null = null,
  level: number = 0
): Array<T & { level: number; parentId: string | null }> {
  let result: Array<T & { level: number; parentId: string | null }> = [];
  
  items.forEach((item, index) => {
    // Añadir el elemento actual con su nivel y parentId
    const flatItem = {
      ...item,
      level,
      parentId,
      index
    };
    
    result.push(flatItem);
    
    // Procesar hijos recursivamente
    if (item[childrenField] && Array.isArray(item[childrenField])) {
      const children = flattenTree(
        item[childrenField],
        idField,
        childrenField,
        item[idField],
        level + 1
      );
      result = result.concat(children);
    }
  });
  
  return result;
}