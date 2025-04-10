import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDndContext } from '../hooks/useDndContext';

export interface DragPreviewProps {
  /** Función para renderizar el componente de vista previa */
  children: (item: any, type: string) => React.ReactNode;
  /** Clase CSS para el contenedor de la vista previa */
  className?: string;
  /** Estilo inline para el contenedor */
  style?: React.CSSProperties;
  /** Desplazamiento X desde el cursor */
  offsetX?: number;
  /** Desplazamiento Y desde el cursor */
  offsetY?: number;
  /** Escala de la vista previa (1 = tamaño original) */
  scale?: number;
}

/**
 * Componente que muestra una vista previa personalizada durante el arrastre
 */
export const DragPreview: React.FC<DragPreviewProps> = ({
  children,
  className = 'diego-dnd-preview',
  style = {},
  offsetX = 15,
  offsetY = 15,
  scale = 0.8
}) => {
  // Obtener estado del sistema DnD
  const { isDragging, draggedItem } = useDndContext();
  
  // Estado para la posición del mouse
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Seguir al cursor durante el arrastre
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX + offsetX,
        y: e.clientY + offsetY
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, offsetX, offsetY]);
  
  // Si no hay elemento siendo arrastrado, no renderizar nada
  if (!isDragging || !draggedItem) {
    return null;
  }
  
  // Estilos combinados para la vista previa
  const previewStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: 'top left',
    ...style
  };
  
  // Crear portal para renderizar fuera del flujo normal del DOM
  return createPortal(
    <div className={className} style={previewStyle}>
      {children(draggedItem.data || draggedItem, draggedItem.type)}
    </div>,
    document.body
  );
};