import { useCallback } from 'react';
import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
import { SortableListProps, DropResult } from '../types';

/**
 * Lista reordenable de alto nivel - caso de uso más común
 */
export function SortableList<T = unknown>({
  items,
  onReorder,
  renderItem,
  direction = 'vertical',
  disabled = false,
  className = '',
  itemClassName = '',
  dragClassName = 'diego-dnd-dragging',
  placeholder
}: SortableListProps<T>) {

  const handleDrop = useCallback((result: DropResult) => {
    const { item, destination } = result;
    
    // Encontrar índices
    const sourceIndex = items.findIndex(i => i.id === item.id);
    const destinationIndex = items.findIndex(i => i.id === destination.id);
    
    if (sourceIndex === -1 || destinationIndex === -1) return;

    // Crear nuevo array reordenado
    const newItems = [...items];
    const [moved] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, moved);

    onReorder(newItems);
  }, [items, onReorder]);

  if (disabled || items.length === 0) {
    return (
      <div className={`diego-dnd-sortable-list ${className}`}>
        {items.length === 0 && placeholder}
        {items.map((item, index) => (
          <div key={item.id} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`diego-dnd-sortable-list diego-dnd-sortable-${direction} ${className}`}
      data-direction={direction}
    >
      {items.map((item, index) => (
        <Droppable
          key={item.id}
          config={{
            id: item.id,
            accept: 'sortable-item',
            onDrop: handleDrop
          }}
        >
          <Draggable
            config={{
              id: item.id,
              type: 'sortable-item',
              data: item
            }}
            className={itemClassName}
            dragClassName={dragClassName}
          >
            {renderItem(item, index)}
          </Draggable>
        </Droppable>
      ))}
    </div>
  );
}
