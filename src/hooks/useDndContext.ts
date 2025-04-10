import { useContext } from 'react';
import { DndContext } from '../components/DndContext';
import { DndContextType } from '../types';

/**
 * Hook para acceder al contexto de DnD desde cualquier componente
 * @returns Contexto con todas las funciones y estado de DnD
 */
export const useDndContext = (): DndContextType => {
  const context = useContext(DndContext);
  
  if (!context) {
    throw new Error('useDndContext debe usarse dentro de un DndProvider');
  }
  
  return context;
};