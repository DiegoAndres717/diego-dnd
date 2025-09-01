import { useEffect, useRef } from 'react';
import { useDndContext } from '../context/DndContext';
import { DragConfig, AdvancedDragConfig } from '../types';

/**
 * Hook simplificado para hacer elementos arrastrables
 */
export function useDrag(config: DragConfig) {
  const ref = useRef<HTMLElement>(null);
  const { registerDraggable, unregisterDraggable, startDrag, isDragging, dragItem } = useDndContext();

  const isActive = isDragging && dragItem?.id === config.id;
  
  const fullConfig: AdvancedDragConfig = {
    ...config
  };

  useEffect(() => {
    if (!ref.current || config.disabled) return;

    registerDraggable(config.id, ref.current, fullConfig);

    return () => {
      unregisterDraggable(config.id);
    };
  }, [config.id, config.disabled, fullConfig, registerDraggable, unregisterDraggable]);

  const dragProps = {
    draggable: !config.disabled,
    onDragStart: (event: React.DragEvent) => {
      if (config.disabled) {
        event.preventDefault();
        return;
      }
      startDrag(fullConfig, event);
    }
  };

  return {
    ref,
    dragProps,
    isDragging: isActive
  };
}