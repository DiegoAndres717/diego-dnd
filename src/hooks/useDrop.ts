import { useEffect, useRef, useCallback, useState } from 'react';
import { useDndContext } from './useDndContext';
import { DropOptions, DropPosition } from '../types';
import { getDropPosition } from '../utils/positionHelpers';

/**
 * Hook para crear zonas donde se pueden soltar elementos
 * @param options Opciones de configuración para la zona
 * @returns Props y ref para aplicar al elemento
 */
export function useDrop<T extends HTMLElement = HTMLDivElement>(options: DropOptions) {
  const {
    id,
    type,
    acceptTypes,
    parentId,
    isGreedy = false,
    disabled = false,
    highlightOnDragOver = true,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
  } = options;
  
  // Referencia al elemento DOM
  const ref = useRef<T>(null);
  
  // Estado para controlar resaltados
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [isOver, setIsOver] = useState(false);
  
  // Acceder al contexto
  const { 
    registerDroppable, 
    unregisterDroppable, 
    isDragging, 
    draggedItem, 
    endDrag 
  } = useDndContext();
  
  // Registrar el elemento cuando se monta
  useEffect(() => {
    if (!disabled && ref.current) {
      registerDroppable(id, ref as React.RefObject<HTMLElement>);
    }
    
    return () => {
      unregisterDroppable(id);
    };
  }, [id, disabled, registerDroppable, unregisterDroppable]);
  
  // Verificar si el tipo del elemento es aceptado por esta zona
  const isAcceptable = useCallback(() => {
    if (!draggedItem || disabled) return false;
    
    // Si no hay tipos aceptados, aceptar todos
    if (!acceptTypes || acceptTypes.length === 0) return true;
    
    return acceptTypes.includes(draggedItem.type);
  }, [draggedItem, disabled, acceptTypes]);
  
  // Manejador para evento dragOver
  const handleDragOver = useCallback((event: React.DragEvent<T>) => {
    if (!isDragging || !isAcceptable()) return;
    
    event.preventDefault();
    
    if (isGreedy) {
      event.stopPropagation();
    }
    
    // Calcular posición relativa (antes, después, dentro)
    if (ref.current) {
      const position = getDropPosition(event, ref.current);
      setDropPosition(position);
      
      // Callback opcional para el usuario
      if (onDragOver && draggedItem) {
        onDragOver(draggedItem, position);
      }
    }
  }, [isDragging, isAcceptable, isGreedy, onDragOver, draggedItem]);
  
  // Manejador para evento dragEnter
  const handleDragEnter = useCallback((event: React.DragEvent<T>) => {
    if (!isDragging || !isAcceptable()) return;
    
    event.preventDefault();
    
    if (isGreedy) {
      event.stopPropagation();
    }
    
    setIsOver(true);
    
    // Callback opcional para el usuario
    if (onDragEnter && draggedItem) {
      onDragEnter(draggedItem);
    }
  }, [isDragging, isAcceptable, isGreedy, onDragEnter, draggedItem]);
  
  // Manejador para evento dragLeave
  const handleDragLeave = useCallback((event: React.DragEvent<T>) => {
    if (!isDragging || !isAcceptable()) return;
    
    // Asegurarse de que realmente estamos saliendo del elemento
    const relatedTarget = event.relatedTarget as Node;
    if (ref.current?.contains(relatedTarget)) return;
    
    setIsOver(false);
    setDropPosition(null);
    
    // Callback opcional para el usuario
    if (onDragLeave && draggedItem) {
      onDragLeave(draggedItem);
    }
  }, [isDragging, isAcceptable, onDragLeave, draggedItem]);
  
  // Manejador para evento drop
  const handleDrop = useCallback((event: React.DragEvent<T>) => {
    if (!isDragging || !isAcceptable()) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsOver(false);
    
    // Calcular posición final del drop
    const position = ref.current ? getDropPosition(event, ref.current) : 'inside';
    
    let result = null;
    
    // Callback para el usuario que puede proporcionar el resultado
    if (onDrop && draggedItem) {
      result = onDrop(draggedItem, position);
    }
    
    // Si no hay resultado personalizado, crear uno predeterminado
    if (!result && draggedItem) {
      result = {
        source: {
          id: draggedItem.id,
          type: draggedItem.type,
          parentId: draggedItem.parentId,
          index: draggedItem.index
        },
        destination: {
          id,
          type: Array.isArray(type) ? type[0] : type,
          parentId,
          position
        },
        item: draggedItem
      };
    }
    
    // Notificar al contexto sobre el drop
    endDrag(result);
    
    // Limpiar estado local
    setDropPosition(null);
  }, [
    isDragging, 
    isAcceptable, 
    onDrop, 
    draggedItem, 
    id, 
    type, 
    parentId, 
    endDrag
  ]);
  
  // Clases CSS calculadas en base al estado
  const getDropClasses = useCallback(() => {
    if (!highlightOnDragOver || !isOver || !dropPosition) return {};
    
    return {
      'diego-dnd-droppable': true,
      'diego-dnd-droppable-over': isOver,
      [`diego-dnd-droppable-position-${dropPosition}`]: !!dropPosition
    };
  }, [highlightOnDragOver, isOver, dropPosition]);
  
  return {
    ref,
    droppableProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    },
    dropState: {
      isOver,
      dropPosition
    },
    dropClasses: getDropClasses()
  };
}