import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDndContext } from '../context/DndContext';

interface DragPreviewProps {
  children: (item: any, type: string) => React.ReactNode;
  offset?: { x: number; y: number };
  className?: string;
}

/**
 * Vista previa personalizada durante el arrastre
 */
export const DragPreview: React.FC<DragPreviewProps> = ({
  children,
  offset = { x: 15, y: 15 },
  className = 'diego-dnd-preview'
}) => {
  const { isDragging, dragItem, dragPosition } = useDndContext();
  const [portalRoot] = useState(() => {
    const div = document.createElement('div');
    div.className = 'diego-dnd-preview-portal';
    return div;
  });

  useEffect(() => {
    if (isDragging) {
      document.body.appendChild(portalRoot);
    }

    return () => {
      if (document.body.contains(portalRoot)) {
        document.body.removeChild(portalRoot);
      }
    };
  }, [isDragging, portalRoot]);

  if (!isDragging || !dragItem || !dragPosition) {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    transform: `translate(${dragPosition.x + offset.x}px, ${dragPosition.y + offset.y}px)`,
    pointerEvents: 'none',
    zIndex: 9999
  };

  return createPortal(
    <div className={className} style={style}>
      {children(dragItem.data, dragItem.type)}
    </div>,
    portalRoot
  );
};