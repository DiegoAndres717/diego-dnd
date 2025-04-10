import { useEffect, useRef, useCallback } from 'react';
import { useDndContext } from './useDndContext';
import { DragOptions, DragItem } from '../types';

/**
 * Hook para hacer elementos arrastrables
 * @param options Opciones de configuración para el elemento arrastrable
 * @returns Props y ref para aplicar al elemento
 */
export function useDrag<T extends HTMLElement = HTMLDivElement, DataType = any>(
  options: DragOptions<DataType, T>
) {
  const {
    id,
    type,
    parentId,
    index,
    data,
    disabled = false,
    onDragStart,
    onDragEnd
  } = options;
  
  // Referencia al elemento DOM
  const ref = useRef<T>(null);
  
  // Acceder al contexto
  const { 
    registerDraggable, 
    unregisterDraggable, 
    startDrag,
    resetDragState,
    isDragging
  } = useDndContext();
  
  // Registrar el elemento cuando se monta
  useEffect(() => {
    if (!disabled && ref.current) {
      registerDraggable(id, ref as React.RefObject<HTMLElement>);
    }
    
    return () => {
      unregisterDraggable(id);
    };
  }, [id, disabled, registerDraggable, unregisterDraggable]);
  
  // Manejador para evento de inicio de arrastre
  const handleDragStart = useCallback((event: React.DragEvent<T>) => {
    if (disabled) return;
    
    event.stopPropagation();
    
    // Crear objeto con información del elemento arrastrado
    const item: DragItem<DataType> = {
      id,
      type,
      parentId,
      index,
      data
    };
    
    // Configurar dataTransfer para compatibilidad con el API nativo
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.setData('application/diego-dnd', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
    
    // Si hay un elemento semitransparente durante el arrastre (ghost), ajustar su opacidad
    if (ref.current) {
      // Opcional: se podría crear una imagen personalizada para el arrastre
    }
    
    // Notificar al contexto sobre el inicio del arrastre
    startDrag(item, event);
    
    // Callback opcional para el usuario
    if (onDragStart) {
      onDragStart(event);
    }
  }, [id, type, parentId, index, data, disabled, startDrag, onDragStart]);
  
  // Manejador para evento de fin de arrastre
  const handleDragEnd = useCallback((event: React.DragEvent<T>) => {
    // La lógica de finalizar el arrastre ocurre principalmente en el Droppable o el contexto
    
    // Callback opcional para el usuario
    if (onDragEnd) {
      onDragEnd(event);
    }
    
    // Si por alguna razón el navegador perdió eventos, resetear el estado
    if (isDragging) {
      setTimeout(() => {
        resetDragState();
      }, 100);
    }
  }, [onDragEnd, isDragging, resetDragState]);
  
  return {
    ref,
    draggableProps: {
      draggable: !disabled,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    },
    isDragging
  };
}