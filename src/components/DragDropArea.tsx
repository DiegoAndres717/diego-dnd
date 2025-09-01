import React, { useState } from 'react';
import { Droppable } from './Droppable';
import { DragDropAreaProps, DropResult } from '../types';

/**
 * Área simple para soltar elementos
 */
export const DragDropArea: React.FC<DragDropAreaProps> = ({
  accept,
  onDrop,
  children,
  className = '',
  activeClassName = 'diego-dnd-drop-active',
  disabled = false,
  multiple = true
}) => {
  const [droppedItems, setDroppedItems] = useState<any[]>([]);

  const handleDrop = (result: DropResult) => {
    const newItem = result.item;
    
    if (multiple) {
      const updated = [...droppedItems, newItem];
      setDroppedItems(updated);
      onDrop(updated);
    } else {
      setDroppedItems([newItem]);
      onDrop([newItem]);
    }
  };

  const isEmpty = !children && droppedItems.length === 0;

  return (
    <Droppable
      config={{
        id: 'drop-area',
        accept,
        onDrop: handleDrop,
        disabled
      }}
      className={`diego-dnd-drop-area ${className} ${isEmpty ? 'diego-dnd-empty' : ''}`}
      activeClassName={activeClassName}
    >
      {children || (
        <div className="diego-dnd-drop-content">
          {isEmpty ? 'Arrastra elementos aquí' : `${droppedItems.length} elemento(s)`}
        </div>
      )}
    </Droppable>
  );
};