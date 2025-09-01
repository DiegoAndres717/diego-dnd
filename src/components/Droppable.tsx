import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDndContext } from '../context/DndContext';
import { DropConfig, AdvancedDropConfig, DropResult } from '../types';

interface DroppableProps extends React.HTMLAttributes<HTMLDivElement> {
  config: DropConfig;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

/**
 * Componente Droppable básico
 */
export const Droppable: React.FC<DroppableProps> = ({
  config,
  children,
  className = '',
  activeClassName = 'diego-dnd-active',
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);
  const { registerDroppable, unregisterDroppable, canDrop, endDrag, dragItem } = useDndContext();

  const isAcceptable = dragItem ? canDrop(dragItem.type, config.accept || '*') : false;

  // Configuración extendida
  const fullConfig: AdvancedDropConfig = {
    ...config,
  };

  // Registro del elemento
  useEffect(() => {
    if (!elementRef.current || fullConfig.disabled) return;

    registerDroppable(config.id, elementRef.current, fullConfig);

    return () => {
      unregisterDroppable(config.id);
    };
  }, [config.id, fullConfig, registerDroppable, unregisterDroppable]);

  // Manejadores de eventos de drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!isAcceptable || fullConfig.disabled) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [isAcceptable, fullConfig.disabled]);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    if (!isAcceptable || fullConfig.disabled) return;

    event.preventDefault();
    setIsOver(true);

    if (fullConfig.onDragEnter && dragItem) {
      fullConfig.onDragEnter(dragItem);
    }
  }, [isAcceptable, fullConfig, dragItem]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!isAcceptable || fullConfig.disabled) return;

    // Solo salir si realmente dejamos el elemento
    const relatedTarget = event.relatedTarget as Node;
    if (elementRef.current?.contains(relatedTarget)) return;

    setIsOver(false);

    if (fullConfig.onDragLeave && dragItem) {
      fullConfig.onDragLeave(dragItem);
    }
  }, [isAcceptable, fullConfig, dragItem]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    if (!isAcceptable || fullConfig.disabled || !dragItem) return;

    event.preventDefault();
    event.stopPropagation();

    setIsOver(false);

    // Crear resultado
    const result: DropResult = {
      item: {
        id: dragItem.id,
        type: dragItem.type,
        data: dragItem.data,
      },
      source: {
        index: dragItem.sourceIndex,
        parent: dragItem.sourceParent,
      },
      destination: {
        id: config.id,
      },
    };

    // Callback del usuario
    if (config.onDrop) {
      config.onDrop(result);
    }

    // Finalizar en el contexto
    endDrag(result);
  }, [isAcceptable, fullConfig.disabled, dragItem, config, endDrag]);

  // Clases CSS
  const classes = [
    'diego-dnd-droppable',
    className,
    isOver && isAcceptable ? activeClassName : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={elementRef}
      className={classes}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-diego-dnd-id={config.id}
      data-diego-dnd-accept={Array.isArray(config.accept) ? config.accept.join(' ') : config.accept}
      {...props}
    >
      {children}
    </div>
  );
};