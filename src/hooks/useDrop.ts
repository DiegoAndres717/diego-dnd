import { useEffect, useRef, useState, useCallback } from 'react';
import { useDndContext } from '../context/DndContext';
import { DropConfig, AdvancedDropConfig, DropResult } from '../types';

/**
 * Hook simplificado para crear zonas de drop
 */
export function useDrop(config: DropConfig) {
  const ref = useRef<HTMLElement>(null);
  const [isOver, setIsOver] = useState(false);
  const { 
    registerDroppable, 
    unregisterDroppable, 
    canDrop, 
    endDrag, 
    dragItem 
  } = useDndContext();

  const isAcceptable = dragItem ? canDrop(dragItem.type, config.accept || '*') : false;

  const fullConfig: AdvancedDropConfig = {
    ...config
  };

  useEffect(() => {
    if (!ref.current || config.disabled) return;

    registerDroppable(config.id, ref.current, fullConfig);

    return () => {
      unregisterDroppable(config.id);
    };
  }, [config.id, config.disabled, fullConfig, registerDroppable, unregisterDroppable]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    if (!isAcceptable || config.disabled || !dragItem) return;

    event.preventDefault();
    event.stopPropagation();

    const result: DropResult = {
      item: {
        id: dragItem.id,
        type: dragItem.type,
        data: dragItem.data
      },
      source: {
        index: dragItem.sourceIndex,
        parent: dragItem.sourceParent
      },
      destination: {
        id: config.id
      }
    };

    if (config.onDrop) {
      config.onDrop(result);
    }

    endDrag(result);
  }, [isAcceptable, config, dragItem, endDrag]);

  const dropProps = {
    onDragOver: (event: React.DragEvent) => {
      if (!isAcceptable || config.disabled) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    onDragEnter: (event: React.DragEvent) => {
      if (!isAcceptable || config.disabled) return;
      event.preventDefault();
      setIsOver(true);
    },
    onDragLeave: (event: React.DragEvent) => {
      if (!isAcceptable || config.disabled) return;
      const relatedTarget = event.relatedTarget as Node;
      if (ref.current?.contains(relatedTarget)) return;
      setIsOver(false);
    },
    onDrop: handleDrop
  };

  return {
    ref,
    dropProps,
    isOver: isOver && isAcceptable,
    canDrop: isAcceptable
  };
}
