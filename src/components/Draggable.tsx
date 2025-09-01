import React, { useEffect, useRef } from 'react';
import { useDndContext } from '../context/DndContext';
import { DragConfig, AdvancedDragConfig } from '../types';

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
  config: DragConfig;
  children: React.ReactNode;
  className?: string;
  dragClassName?: string;
  disabled?: boolean;
}

/**
 * Componente Draggable básico
 */
export const Draggable: React.FC<DraggableProps> = ({
  config,
  children,
  className = '',
  dragClassName = 'diego-dnd-dragging',
  disabled = false,
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { registerDraggable, unregisterDraggable, startDrag, isDragging, dragItem } = useDndContext();

  const isBeingDragged = isDragging && dragItem?.id === config.id;

  // Configuración extendida
  const fullConfig: AdvancedDragConfig = {
    ...config,
    disabled: disabled || config.disabled,
  };

  // Registro del elemento
  useEffect(() => {
    if (!elementRef.current || fullConfig.disabled) return;

    registerDraggable(config.id, elementRef.current, fullConfig);

    return () => {
      unregisterDraggable(config.id);
    };
  }, [config.id, fullConfig, registerDraggable, unregisterDraggable]);

  // Manejador de drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (fullConfig.disabled) {
      event.preventDefault();
      return;
    }

    startDrag(fullConfig, event);
  };

  // Clases CSS
  const classes = [
    'diego-dnd-draggable',
    className,
    isBeingDragged ? dragClassName : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={elementRef}
      className={classes}
      draggable={!fullConfig.disabled}
      onDragStart={handleDragStart}
      data-diego-dnd-id={config.id}
      data-diego-dnd-type={config.type}
      {...props}
    >
      {children}
    </div>
  );
};
