import React, { forwardRef, useMemo, useRef } from 'react';
import { useDrop } from '../hooks/useDrop';
import { DragItem, DropPosition, DropResult } from '../types';

export interface DroppableProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop' | 'onDragOver' | 'onDragEnter' | 'onDragLeave'> {
  /** ID único de la zona de destino */
  id: string;
  /** Tipo(s) de elemento que esta zona puede recibir */
  type: string | string[];
  /** ID del elemento padre (para estructuras anidadas) */
  parentId?: string;
  /** Si está deshabilitado para recibir elementos */
  disabled?: boolean;
  /** Clase CSS cuando un elemento está sobre la zona */
  dropOverClass?: string;
  /** Clase CSS para posición 'before' */
  dropBeforeClass?: string;
  /** Clase CSS para posición 'after' */
  dropAfterClass?: string;
  /** Clase CSS para posición 'inside' */
  dropInsideClass?: string;
  /** Orientación del contenedor ('vertical' u 'horizontal') */
  orientation?: 'vertical' | 'horizontal';
  /** Si solo acepta ciertos tipos de elementos */
  acceptTypes?: string[];
  /** Si captura el evento (evita propagación) */
  isGreedy?: boolean;
  /** Si muestra resaltado visual al arrastrar sobre él */
  highlightOnDragOver?: boolean;
  /** Callback cuando un elemento entra en la zona */
  onDragEnter?: (item: DragItem) => void;
  /** Callback cuando un elemento sale de la zona */
  onDragLeave?: (item: DragItem) => void;
  /** Callback durante el arrastre sobre la zona */
  onDragOver?: (item: DragItem, position: DropPosition) => void;
  /** Callback cuando se suelta un elemento en la zona */
  onDrop?: (item: DragItem, position: DropPosition) => DropResult | null;
  /** Hijos a renderizar */
  children: React.ReactNode;
  /** Texto descriptivo para lectores de pantalla */
  ariaLabel?: string;
  /** Mensaje cuando un elemento entra en la zona */
  ariaDroppableLabel?: string;
}

/**
 * Componente que crea una zona donde se pueden soltar elementos
 * Con soporte mejorado para accesibilidad
 */
export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(
  ({ 
    id, 
    type, 
    parentId, 
    disabled = false,
    dropOverClass = 'diego-dnd-over',
    dropBeforeClass = 'diego-dnd-position-before',
    dropAfterClass = 'diego-dnd-position-after',
    dropInsideClass = 'diego-dnd-position-inside',
    orientation = 'vertical',
    acceptTypes, 
    isGreedy, 
    highlightOnDragOver = true,
    className,
    style,
    onDragEnter, 
    onDragLeave, 
    onDragOver, 
    onDrop, 
    children,
    ariaLabel,
    ariaDroppableLabel,
    ...props 
  }, externalRef) => {
    // Referencia para anuncios a lectores de pantalla
    const liveRegionRef = useRef<HTMLDivElement>(null);
    
    // Función extendida para onDragEnter que incluye anuncios de accesibilidad
    const handleDragEnter = (item: DragItem) => {
      if (onDragEnter) {
        onDragEnter(item);
      }
      
      // Anunciar para lectores de pantalla
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = ariaDroppableLabel || 
          `Elemento ${item.id} entró en zona de destino ${ariaLabel || id}`;
      }
    };
    
    // Función extendida para onDragLeave que incluye anuncios de accesibilidad
    const handleDragLeave = (item: DragItem) => {
      if (onDragLeave) {
        onDragLeave(item);
      }
      
      // Anunciar para lectores de pantalla
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Elemento ${item.id} salió de zona de destino ${ariaLabel || id}`;
      }
    };
    
    // Función extendida para onDrop que incluye anuncios de accesibilidad
    const handleDrop = (item: DragItem, position: DropPosition) => {
      let result = null;
      
      if (onDrop) {
        result = onDrop(item, position);
      }
      
      // Anunciar para lectores de pantalla
      if (liveRegionRef.current) {
        const positionText = position === 'before' 
          ? 'antes' 
          : position === 'after' 
            ? 'después' 
            : 'dentro';
            
        liveRegionRef.current.textContent = `Elemento ${item.id} colocado ${positionText} de ${ariaLabel || id}`;
      }
      
      return result;
    };
    
    // Usar el hook useDrop
    const { ref, droppableProps, dropState } = useDrop({
      id,
      type,
      parentId,
      acceptTypes,
      isGreedy,
      disabled,
      highlightOnDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver,
      onDrop: handleDrop
    });
    
    // Combinar la ref interna con la externa
    const setRefs = (element: HTMLDivElement) => {
      // Manejar la ref interna
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
      
      // Manejar la ref externa
      if (typeof externalRef === 'function') {
        externalRef(element);
      } else if (externalRef) {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }
    };
    
    // Construir clases CSS en base al estado
    const combinedClassName = useMemo(() => {
      const classes = ['diego-dnd-droppable'];
      
      if (className) {
        classes.push(className);
      }
      
      // Añadir clase si hay un elemento sobre la zona
      if (dropState.isOver && dropOverClass) {
        classes.push(dropOverClass);
      }
      
      // Añadir clase según la posición
      if (dropState.isOver && dropState.dropPosition) {
        switch (dropState.dropPosition) {
          case 'before':
            classes.push(dropBeforeClass);
            break;
          case 'after':
            classes.push(dropAfterClass);
            break;
          case 'inside':
            classes.push(dropInsideClass);
            break;
        }
      }
      
      return classes.join(' ');
    }, [
      className, 
      dropState.isOver, 
      dropState.dropPosition, 
      dropOverClass, 
      dropBeforeClass, 
      dropAfterClass, 
      dropInsideClass
    ]);
    
    // Determinar el efecto de drop para anunciar en atributo ARIA
    const getDropEffect = () => {
      if (disabled) return 'none';
      
      // Se podría personalizar según el tipo de operación
      return 'move';
    };
    
    return (
      <>
        {/* Región en vivo para anuncios del lector de pantalla */}
        <div 
          ref={liveRegionRef}
          aria-live="assertive" 
          className="sr-only"
          style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
        />
        
        <div
          ref={setRefs}
          className={combinedClassName}
          style={style}
          data-diego-dnd-id={id}
          data-diego-dnd-type={Array.isArray(type) ? type.join(' ') : type}
          data-diego-dnd-parent={parentId}
          data-diego-dnd-orientation={orientation}
          data-diego-dnd-over={dropState.isOver ? 'true' : undefined}
          data-diego-dnd-position={dropState.dropPosition || undefined}
          
          /* Atributos ARIA para accesibilidad */
          role="region"
          aria-dropeffect={getDropEffect()}
          aria-disabled={disabled}
          aria-roledescription="zona para soltar"
          aria-label={ariaLabel || `Zona de destino ${id}`}
          aria-describedby={`drop-desc-${id}`}
          
          {...props}
          {...droppableProps}
        >
          {children}
          
          {/* Descripción oculta para lectores de pantalla */}
          <span id={`drop-desc-${id}`} style={{ display: 'none' }}>
            {disabled 
              ? 'Esta zona no puede recibir elementos' 
              : `Zona donde puede soltar elementos de tipo ${Array.isArray(type) ? type.join(', ') : type}`
            }
          </span>
        </div>
      </>
    );
  }
);

Droppable.displayName = 'Droppable';