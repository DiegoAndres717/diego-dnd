import React, { createContext, useCallback, useRef, useState, useEffect } from 'react';
import { DndContextValue, DragContext, DropResult, AdvancedDragConfig, AdvancedDropConfig } from '../types';

const DndContext = createContext<DndContextValue | null>(null);

interface DndProviderProps {
  children: React.ReactNode;
  onDragStart?: (item: DragContext) => void;
  onDragEnd?: (result: DropResult | null) => void;
  announceMessages?: boolean;
}

/**
 * Provider principal - gestión centralizada y simplificada
 */
export const DndProvider: React.FC<DndProviderProps> = ({
  children,
  onDragStart,
  onDragEnd,
  announceMessages = true,
}) => {
  // Estado centralizado
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragContext | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Registros centralizados
  const draggables = useRef<Map<string, { element: HTMLElement; config: AdvancedDragConfig }>>(new Map());
  const droppables = useRef<Map<string, { element: HTMLElement; config: AdvancedDropConfig }>>(new Map());
  
  // Única región live para accesibilidad
  const announcer = useRef<HTMLDivElement | null>(null);

  // Configurar announcer
  useEffect(() => {
    if (!announceMessages) return;

    const div = document.createElement('div');
    div.setAttribute('aria-live', 'assertive');
    div.setAttribute('aria-atomic', 'true');
    div.className = 'sr-only diego-dnd-announcer';
    div.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(div);
    announcer.current = div;

    return () => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    };
  }, [announceMessages]);

  // Anunciar mensajes
  const announce = useCallback((message: string) => {
    if (!announcer.current || !announceMessages) return;
    
    announcer.current.textContent = message;
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
      if (announcer.current) {
        announcer.current.textContent = '';
      }
    }, 3000);
  }, [announceMessages]);

  // Verificar si un tipo puede ser soltado
  const canDrop = useCallback((dragType: string, dropAccept: string | string[]): boolean => {
    if (typeof dropAccept === 'string') {
      return dropAccept === '*' || dropAccept === dragType;
    }
    return dropAccept.includes('*') || dropAccept.includes(dragType);
  }, []);

  // Registrar draggable
  const registerDraggable = useCallback((id: string, element: HTMLElement, config: AdvancedDragConfig) => {
    draggables.current.set(id, { element, config });
  }, []);

  // Registrar droppable
  const registerDroppable = useCallback((id: string, element: HTMLElement, config: AdvancedDropConfig) => {
    droppables.current.set(id, { element, config });
  }, []);

  // Desregistrar elementos
  const unregisterDraggable = useCallback((id: string) => {
    draggables.current.delete(id);
  }, []);

  const unregisterDroppable = useCallback((id: string) => {
    droppables.current.delete(id);
  }, []);

  // Iniciar arrastre
  const startDrag = useCallback((config: AdvancedDragConfig, event: React.DragEvent) => {
    const item: DragContext = {
      id: config.id,
      type: config.type,
      data: config.data,
      sourceIndex: config.sourceIndex,
      sourceParent: config.sourceParent,
    };

    setIsDragging(true);
    setDragItem(item);

    // Configurar dataTransfer
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', config.id);
    event.dataTransfer.setData('application/diego-dnd', JSON.stringify(item));

    // Seguir posición del mouse
    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    // Limpiar listener cuando termine el drag
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };

    setTimeout(() => {
      document.addEventListener('dragend', cleanup, { once: true });
    }, 0);

    // Callbacks y anuncios
    if (config.onDragStart) {
      config.onDragStart(item);
    }
    if (onDragStart) {
      onDragStart(item);
    }

    const message = config.dragInstruction || `Arrastrando ${config.ariaLabel || config.id}`;
    announce(message);
  }, [announce, onDragStart]);

  // Finalizar arrastre
  const endDrag = useCallback((result: DropResult | null) => {
    if (!dragItem) return;

    // Callbacks
    const draggableConfig = draggables.current.get(dragItem.id)?.config;
    if (draggableConfig?.onDragEnd) {
      draggableConfig.onDragEnd(result);
    }
    if (onDragEnd) {
      onDragEnd(result);
    }

    // Anuncio
    const message = result
      ? `Elemento colocado en ${result.destination.id}`
      : 'Arrastre cancelado';
    announce(message);

    // Limpiar estado
    setIsDragging(false);
    setDragItem(null);
    setDragPosition(null);
  }, [dragItem, announce, onDragEnd]);

  const contextValue: DndContextValue = {
    isDragging,
    dragItem,
    dragPosition,
    registerDraggable,
    registerDroppable,
    unregisterDraggable,
    unregisterDroppable,
    startDrag,
    endDrag,
    canDrop,
    announce,
  };

  return (
    <DndContext.Provider value={contextValue}>
      {children}
    </DndContext.Provider>
  );
};

// Hook para usar el contexto
export const useDndContext = (): DndContextValue => {
  const context = React.useContext(DndContext);
  if (!context) {
    throw new Error('useDndContext debe usarse dentro de DndProvider');
  }
  return context;
};