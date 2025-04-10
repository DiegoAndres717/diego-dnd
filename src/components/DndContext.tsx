import React, { createContext, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  DndContextType, 
  DragItem, 
  DragPosition, 
  DropResult,
  KeyboardDragState
} from '../types';

/**
 * Contexto que comparte el estado de drag and drop
 */
export const DndContext = createContext<DndContextType | null>(null);

/**
 * Props para el proveedor de DnD
 */
export interface DndProviderProps {
  children: React.ReactNode;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (result: DropResult | null) => void;
  debugMode?: boolean;
  // Nuevo: mensaje de accesibilidad para inicio de sesión de arrastrar
  ariaStartMessage?: string;
  // Nuevo: mensaje de accesibilidad para fin de sesión
  ariaEndMessage?: string;
  // Nuevo: habilitar navegación por teclado
  enableKeyboardNavigation?: boolean;
}

/**
 * Proveedor principal del sistema de drag and drop
 * Con soporte mejorado para accesibilidad
 */
export const DndProvider: React.FC<DndProviderProps> = ({ 
  children, 
  onDragStart, 
  onDragEnd,
  debugMode = false,
  ariaStartMessage,
  ariaEndMessage,
  enableKeyboardNavigation = true
}) => {
  // Estado del sistema
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  
  // Nuevo: estado para navegación por teclado
  const [keyboardDragState, setKeyboardDragState] = useState<KeyboardDragState>({
    active: false,
    sourceId: null,
    currentDroppableId: null
  });
  
  // Referencias a los elementos del DOM
  const draggableRefs = useRef<Map<string, React.RefObject<HTMLElement>>>(new Map());
  const droppableRefs = useRef<Map<string, React.RefObject<HTMLElement>>>(new Map());
  
  // Nuevo: referencia para anuncios de accesibilidad
  const ariaLiveRef = useRef<HTMLDivElement | null>(null);
  
  // Inicializar la región en vivo para accesibilidad
  useEffect(() => {
    // Crear elemento para anuncios de lectores de pantalla
    const ariaLiveElement = document.createElement('div');
    ariaLiveElement.setAttribute('aria-live', 'assertive');
    ariaLiveElement.setAttribute('aria-atomic', 'true');
    ariaLiveElement.setAttribute('class', 'sr-only diego-dnd-announcer');
    ariaLiveElement.style.position = 'absolute';
    ariaLiveElement.style.width = '1px';
    ariaLiveElement.style.height = '1px';
    ariaLiveElement.style.padding = '0';
    ariaLiveElement.style.overflow = 'hidden';
    ariaLiveElement.style.clip = 'rect(0, 0, 0, 0)';
    ariaLiveElement.style.whiteSpace = 'nowrap';
    ariaLiveElement.style.border = '0';
    
    document.body.appendChild(ariaLiveElement);
    ariaLiveRef.current = ariaLiveElement;
    
    // Limpiar al desmontar
    return () => {
      if (ariaLiveElement && document.body.contains(ariaLiveElement)) {
        document.body.removeChild(ariaLiveElement);
      }
    };
  }, []);
  
  // Función para anunciar mensajes a lectores de pantalla
  const announce = useCallback((message: string) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message;
      
      // Limpiar después de un tiempo para evitar anuncios repetidos
      setTimeout(() => {
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = '';
        }
      }, 3000);
    }
    
    if (debugMode) {
      console.log(`[diego-dnd] ARIA announcement: ${message}`);
    }
  }, [debugMode]);
  
  // Registro de elementos arrastrables
  const registerDraggable = useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    draggableRefs.current.set(id, ref);
    if (debugMode) console.log(`[diego-dnd] Registered draggable: ${id}`);
  }, [debugMode]);
  
  // Registro de zonas de destino
  const registerDroppable = useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    droppableRefs.current.set(id, ref);
    if (debugMode) console.log(`[diego-dnd] Registered droppable: ${id}`);
  }, [debugMode]);
  
  // Eliminar elementos del registro
  const unregisterDraggable = useCallback((id: string) => {
    draggableRefs.current.delete(id);
    if (debugMode) console.log(`[diego-dnd] Unregistered draggable: ${id}`);
  }, [debugMode]);
  
  const unregisterDroppable = useCallback((id: string) => {
    droppableRefs.current.delete(id);
    if (debugMode) console.log(`[diego-dnd] Unregistered droppable: ${id}`);
  }, [debugMode]);
  
  // Iniciar una operación de arrastre
  const startDrag = useCallback((item: DragItem, _event: React.DragEvent<any>) => {
    setIsDragging(true);
    setDraggedItem(item);
    setDragPosition(null);
    
    if (debugMode) console.log(`[diego-dnd] Started dragging: `, item);
    
    // Anunciar para lectores de pantalla
    const message = ariaStartMessage || 
      `Arrastrando elemento ${item.id} de tipo ${item.type}`;
    announce(message);
    
    if (onDragStart) {
      onDragStart(item);
    }
  }, [debugMode, onDragStart, ariaStartMessage, announce]);
  
  // Finalizar una operación de arrastre
  const endDrag = useCallback((result: DropResult | null) => {
    if (debugMode) {
      if (result) {
        console.log(`[diego-dnd] Dropped with result: `, result);
      } else {
        console.log(`[diego-dnd] Drag canceled`);
      }
    }
    
    // Anunciar para lectores de pantalla
    const message = ariaEndMessage || (result 
      ? `Elemento ${result.source.id} colocado en ${result.destination.id}`
      : `Operación de arrastre cancelada`
    );
    announce(message);
    
    if (onDragEnd) {
      onDragEnd(result);
    }
    
    // Limpiar el estado
    setIsDragging(false);
    setDraggedItem(null);
    setDragPosition(null);
    
    // Limpiar estado de navegación por teclado
    setKeyboardDragState({
      active: false,
      sourceId: null,
      currentDroppableId: null
    });
  }, [debugMode, onDragEnd, ariaEndMessage, announce]);
  
  // Resetear el estado (útil para casos en que el navegador pierde eventos)
  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDragPosition(null);
    
    // Limpiar estado de navegación por teclado
    setKeyboardDragState({
      active: false,
      sourceId: null,
      currentDroppableId: null
    });
    
    if (debugMode) console.log(`[diego-dnd] Reset drag state`);
  }, [debugMode]);
  
  // Nuevo: iniciar arrastre por teclado
  const startKeyboardDrag = useCallback((itemId: string) => {
    // Obtener elemento arrastrable
    const draggableRef = draggableRefs.current.get(itemId);
    if (!draggableRef || !draggableRef.current) {
      if (debugMode) console.log(`[diego-dnd] Cannot start keyboard drag: element ${itemId} not found`);
      return;
    }
    
    // Extraer datos del elemento
    const element = draggableRef.current;
    const type = element.getAttribute('data-diego-dnd-type') || '';
    const parentId = element.getAttribute('data-diego-dnd-parent') || undefined;
    const indexAttr = element.getAttribute('data-diego-dnd-index');
    const index = indexAttr ? parseInt(indexAttr, 10) : undefined;
    
    // Crear item de arrastre
    const item: DragItem = {
      id: itemId,
      type,
      parentId,
      index
    };
    
    // Actualizar estado
    setIsDragging(true);
    setDraggedItem(item);
    setKeyboardDragState({
      active: true,
      sourceId: itemId,
      currentDroppableId: null
    });
    
    // Anunciar para lectores de pantalla
    announce(`Seleccionado elemento ${itemId} para arrastrar. Use las teclas de flecha para navegar y Espacio para soltar.`);
    
    if (onDragStart) {
      onDragStart(item);
    }
    
    if (debugMode) console.log(`[diego-dnd] Started keyboard drag: `, item);
  }, [debugMode, onDragStart, announce]);
  
  // Nuevo: mover el foco a la siguiente zona droppable
  const moveToNextDroppable = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!keyboardDragState.active || !draggedItem) return;
    
    // Obtener todas las zonas droppable disponibles
    const droppables = Array.from(droppableRefs.current.entries())
      .filter(([_, ref]) => ref.current !== null)
      .map(([id, ref]) => ({
        id,
        rect: ref.current!.getBoundingClientRect()
      }));
    
    if (droppables.length === 0) return;
    
    // Si no hay una zona actual, seleccionar la primera
    if (!keyboardDragState.currentDroppableId) {
      const firstDroppable = droppables[0];
      setKeyboardDragState({
        ...keyboardDragState,
        currentDroppableId: firstDroppable.id
      });
      
      // Anunciar para lectores de pantalla
      announce(`Movido a zona ${firstDroppable.id}`);
      return;
    }
    
    // Obtener la zona actual
    const currentIndex = droppables.findIndex(d => d.id === keyboardDragState.currentDroppableId);
    if (currentIndex === -1) return;
    
    const currentDroppable = droppables[currentIndex];
    
    // Encontrar la siguiente zona basada en la dirección
    let nextDroppable;
    
    switch (direction) {
      case 'up':
        // Buscar la zona más cercana hacia arriba
        nextDroppable = droppables
          .filter(d => d.rect.bottom < currentDroppable.rect.top)
          .sort((a, b) => b.rect.bottom - a.rect.bottom)[0];
        break;
        
      case 'down':
        // Buscar la zona más cercana hacia abajo
        nextDroppable = droppables
          .filter(d => d.rect.top > currentDroppable.rect.bottom)
          .sort((a, b) => a.rect.top - b.rect.top)[0];
        break;
        
      case 'left':
        // Buscar la zona más cercana hacia la izquierda
        nextDroppable = droppables
          .filter(d => d.rect.right < currentDroppable.rect.left)
          .sort((a, b) => b.rect.right - a.rect.right)[0];
        break;
        
      case 'right':
        // Buscar la zona más cercana hacia la derecha
        nextDroppable = droppables
          .filter(d => d.rect.left > currentDroppable.rect.right)
          .sort((a, b) => a.rect.left - b.rect.left)[0];
        break;
    }
    
    // Si encontramos una zona válida, actualizar estado
    if (nextDroppable) {
      setKeyboardDragState({
        ...keyboardDragState,
        currentDroppableId: nextDroppable.id
      });
      
      // Anunciar para lectores de pantalla
      announce(`Movido a zona ${nextDroppable.id}`);
      
      if (debugMode) {
        console.log(`[diego-dnd] Moved keyboard focus to droppable: ${nextDroppable.id}`);
      }
    } else {
      // Si no hay zona en esa dirección, anunciarlo
      announce(`No hay zonas disponibles en dirección ${direction}`);
    }
  }, [keyboardDragState, draggedItem, announce, debugMode]);
  
  // Nuevo: completar el drop por teclado
  const completeKeyboardDrop = useCallback(() => {
    if (!keyboardDragState.active || !draggedItem || !keyboardDragState.currentDroppableId) {
      return;
    }
    
    // Crear resultado del drop
    const result: DropResult = {
      source: {
        id: draggedItem.id,
        type: draggedItem.type,
        parentId: draggedItem.parentId,
        index: draggedItem.index
      },
      destination: {
        id: keyboardDragState.currentDroppableId,
        type: draggedItem.type, // Se podría mejorar obteniendo el tipo real de la zona
        parentId: undefined,    // Se podría mejorar obteniendo el parentId real
        position: 'inside'      // Por defecto colocar dentro
      },
      item: draggedItem
    };
    
    // Finalizar operación
    endDrag(result);
    
    if (debugMode) {
      console.log(`[diego-dnd] Completed keyboard drop: `, result);
    }
  }, [keyboardDragState, draggedItem, endDrag, debugMode]);
  
  // Escuchar eventos de teclado para navegación
  useEffect(() => {
    if (!enableKeyboardNavigation || !keyboardDragState.active) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si hay un drag activo por teclado
      if (!keyboardDragState.active) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveToNextDroppable('up');
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          moveToNextDroppable('down');
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          moveToNextDroppable('left');
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          moveToNextDroppable('right');
          break;
          
        case ' ': // Espacio
        case 'Enter':
          e.preventDefault();
          completeKeyboardDrop();
          break;
          
        case 'Escape':
          e.preventDefault();
          resetDragState();
          announce('Operación de arrastre cancelada');
          break;
      }
    };
    
    // Añadir listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Limpiar al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enableKeyboardNavigation, 
    keyboardDragState, 
    moveToNextDroppable, 
    completeKeyboardDrop, 
    resetDragState,
    announce
  ]);
  
  // Valor del contexto
  const contextValue = useMemo<DndContextType>(() => ({
    isDragging,
    draggedItem,
    dragPosition,
    keyboardDragState,
    registerDraggable,
    registerDroppable,
    unregisterDraggable,
    unregisterDroppable,
    startDrag,
    endDrag,
    resetDragState,
    startKeyboardDrag,
    moveToNextDroppable,
    completeKeyboardDrop,
    announce
  }), [
    isDragging, 
    draggedItem, 
    dragPosition, 
    keyboardDragState,
    registerDraggable, 
    registerDroppable, 
    unregisterDraggable, 
    unregisterDroppable, 
    startDrag, 
    endDrag,
    resetDragState,
    startKeyboardDrag,
    moveToNextDroppable,
    completeKeyboardDrop,
    announce
  ]);
  
  return (
    <DndContext.Provider value={contextValue}>
      {children}
    </DndContext.Provider>
  );
};