import React, { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import { useDrag } from '../hooks/useDrag';
import { DragOptions } from '../types';
import { useDndContext } from '../hooks/useDndContext';

export interface DraggableProps<T = any> extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDragStart' | 'onDragEnd'> {
  /** ID único del elemento arrastrable */
  id: string;
  /** Tipo de elemento (usado para limitar compatibilidad) */
  type: string;
  /** ID del elemento padre (para estructuras anidadas) */
  parentId?: string;
  /** Posición en el array de elementos (para ordenamiento) */
  index?: number;
  /** Datos adicionales que se transportarán durante el arrastre */
  data?: T;
  /** Si el elemento está deshabilitado para arrastre */
  disabled?: boolean;
  /** Clase CSS aplicada cuando el elemento está siendo arrastrado */
  dragActiveClass?: string;
  /** Callback al iniciar el arrastre */
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  /** Callback al finalizar el arrastre */
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
  /** Elemento hijo a renderizar */
  children: React.ReactNode;
  /** Texto alternativo para lectores de pantalla */
  ariaLabel?: string;
  /** Mensaje de arrastre para lectores de pantalla */
  ariaDragLabel?: string;
}

/**
 * Componente que hace que sus hijos sean arrastrables
 * Con soporte mejorado para accesibilidad
 */
export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(
  <T extends unknown>(
    { 
      id, 
      type, 
      parentId, 
      index, 
      data, 
      disabled = false,
      dragActiveClass = 'diego-dnd-dragging', 
      className,
      onDragStart, 
      onDragEnd, 
      children,
      style,
      ariaLabel,
      ariaDragLabel,
      ...props 
    }: DraggableProps<T>, 
    externalRef: React.ForwardedRef<HTMLDivElement>
  ) => {
    // Estado para accesibilidad
    const [isGrabbed, setIsGrabbed] = useState(false);
    const liveRegionRef = useRef<HTMLDivElement>(null);
    
    // Opciones para el hook useDrag
    const dragOptions: DragOptions<T, HTMLDivElement> = {
      id,
      type,
      parentId,
      index,
      data,
      disabled,
      onDragStart: (event) => {
        setIsGrabbed(true);
        if (onDragStart) onDragStart(event);
        
        // Anunciar para lectores de pantalla
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = ariaDragLabel || `Arrastrando elemento ${ariaLabel || id}`;
        }
      },
      onDragEnd: (event) => {
        setIsGrabbed(false);
        if (onDragEnd) onDragEnd(event);
        
        // Anunciar fin de arrastre
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }
    };
    
    // Usar el hook para obtener props de arrastre y estado
    const { ref, draggableProps, isDragging } = useDrag<HTMLDivElement, T>(dragOptions);
    
    // Acceder al contexto para comprobar si este elemento está siendo arrastrado
    const { draggedItem } = useDndContext();
    const isCurrentDragging = isDragging && draggedItem?.id === id;
    
    // Combinar clases CSS
    const combinedClassName = useMemo(() => {
      const classes = ['diego-dnd-draggable'];
      
      if (className) {
        classes.push(className);
      }
      
      if (isCurrentDragging && dragActiveClass) {
        classes.push(dragActiveClass);
      }
      
      return classes.join(' ');
    }, [className, isCurrentDragging, dragActiveClass]);
    
    // Combinar ref externo con el interno
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
    
    // Obtener estilo combinado
    const combinedStyle = useMemo(() => {
      return {
        ...style,
        // Si está siendo arrastrado, mantener visibilidad a menos que se use clases CSS
        ...(isCurrentDragging && !dragActiveClass ? { opacity: 0.5 } : {})
      };
    }, [style, isCurrentDragging, dragActiveClass]);
    
    // Soporte para teclado
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      // Iniciar arrastre con Espacio o Enter
      if ((event.key === ' ' || event.key === 'Enter') && !isGrabbed) {
        event.preventDefault();
        setIsGrabbed(true);
        
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = ariaDragLabel || 
            `Elemento ${ariaLabel || id} seleccionado para arrastre. Use flechas para mover y Espacio para soltar.`;
        }
        
        // Notificar al contexto de DnD para iniciar modo de arrastre por teclado
        // Esto requeriría implementación adicional en DndContext
      }
      
      // Soltar elemento con Espacio o Enter
      if ((event.key === ' ' || event.key === 'Enter') && isGrabbed) {
        event.preventDefault();
        setIsGrabbed(false);
        
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `Elemento ${ariaLabel || id} soltado`;
        }
        
        // Aquí iría la implementación para completar el drop por teclado
      }
      
      // Mover elemento con teclas de flecha cuando está seleccionado
      if (isGrabbed && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        
        // Aquí iría la implementación para mover el elemento seleccionado
      }
    };
    
    // Notificar disponibilidad de arrastre al montar
    useEffect(() => {
      if (liveRegionRef.current && !disabled) {
        liveRegionRef.current.textContent = `Elemento ${ariaLabel || id} disponible para arrastrar`;
        
        // Limpiar después de 2 segundos para no molestar con anuncios constantes
        const timeout = setTimeout(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = '';
          }
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    }, [id, ariaLabel, disabled]);
    
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
          style={combinedStyle}
          data-diego-dnd-id={id}
          data-diego-dnd-type={type}
          data-diego-dnd-parent={parentId}
          data-diego-dnd-index={index}
          data-diego-dnd-dragging={isCurrentDragging ? 'true' : undefined}
          
          /* Atributos ARIA para accesibilidad */
          role="button"
          tabIndex={disabled ? undefined : 0}
          aria-grabbed={isGrabbed}
          aria-disabled={disabled}
          aria-roledescription="elemento arrastrable"
          aria-label={ariaLabel || `Elemento arrastrable ${id}`}
          aria-describedby={`desc-${id}`}
          
          /* Eventos para soporte de teclado */
          onKeyDown={handleKeyDown}
          
          {...props}
          {...draggableProps}
        >
          {children}
          
          {/* Descripción oculta para lectores de pantalla */}
          <span id={`desc-${id}`} style={{ display: 'none' }}>
            {disabled 
              ? 'Este elemento no se puede arrastrar' 
              : 'Puede arrastrar este elemento o usar Espacio o Enter para seleccionarlo y las flechas para moverlo'
            }
          </span>
        </div>
      </>
    );
  }
);

Draggable.displayName = 'Draggable';