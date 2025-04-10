import { useState } from 'react';
import {
  DndProvider,
  Draggable,
  Droppable,
  DragPreview,
  DropResult
} from '../src';
import '../src/diego-dnd.css';

// Definir tipos para nuestros elementos
interface TreeItem {
  id: string;
  content: string;
  type: 'folder' | 'file';
  children?: TreeItem[];
  color?: string;
}

// Datos iniciales - estructura de archivos anidada
const initialItems: TreeItem[] = [
  {
    id: 'folder-1',
    content: 'Documentos',
    type: 'folder',
    color: '#e3f2fd',
    children: [
      {
        id: 'file-1',
        content: 'Reporte.docx',
        type: 'file',
        color: '#bbdefb'
      },
      {
        id: 'file-2',
        content: 'Presupuesto.xlsx',
        type: 'file',
        color: '#90caf9'
      },
      {
        id: 'folder-2',
        content: 'Proyectos',
        type: 'folder',
        color: '#e3f2fd',
        children: [
          {
            id: 'file-3',
            content: 'Proyecto1.pdf',
            type: 'file',
            color: '#bbdefb'
          }
        ]
      }
    ]
  },
  {
    id: 'folder-3',
    content: 'Imágenes',
    type: 'folder',
    color: '#e8f5e9',
    children: [
      {
        id: 'file-4',
        content: 'Vacaciones.jpg',
        type: 'file',
        color: '#c8e6c9'
      },
      {
        id: 'file-5',
        content: 'Familia.png',
        type: 'file',
        color: '#a5d6a7'
      }
    ]
  }
];

// Componente para representar un archivo o carpeta
const TreeNode: React.FC<{
  item: TreeItem;
  parentId?: string;
  index: number;
  level: number;
  onDrop: (result: DropResult) => void;
}> = ({ item, parentId, index, level, onDrop }) => {
  // Estado para controlar si la carpeta está expandida
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <Draggable
        id={item.id}
        type={item.type}
        parentId={parentId}
        index={index}
        data={item}
        className="tree-node"
        style={{
          backgroundColor: item.color || '#fff',
          padding: '8px 12px',
          margin: '5px 0',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab'
        }}
      >
        {/* Icono según el tipo */}
        <span style={{ marginRight: '8px' }}>
          {item.type === 'folder' ? '📁' : '📄'}
        </span>
        
        {/* Contenido */}
        <span>{item.content}</span>
        
        {/* Botón expandir/contraer para carpetas */}
        {item.type === 'folder' && item.children && item.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {expanded ? '▼' : '►'}
          </button>
        )}
      </Draggable>
      
      {/* Si es una carpeta, crear un Droppable para sus hijos */}
      {item.type === 'folder' && (
        <Droppable
          id={`droppable-${item.id}`}
          type={['file', 'folder']}
          parentId={item.id}
          style={{
            display: expanded ? 'block' : 'none',
            padding: '4px 0',
            transition: 'all 0.2s ease'
          }}
          onDrop={(draggedItem, position) => {
            // Crear un resultado personalizado
            const result: DropResult = {
              source: {
                id: draggedItem.id,
                type: draggedItem.type,
                parentId: draggedItem.parentId,
                index: draggedItem.index
              },
              destination: {
                id: item.id,
                type: 'folder',
                parentId: parentId,
                position
              },
              item: draggedItem
            };
            onDrop(result);
            return result;
          }}
        >
          {/* Renderizar hijos recursivamente si existen */}
          {item.children && item.children.length > 0 ? (
            item.children.map((child, childIndex) => (
              <TreeNode
                key={child.id}
                item={child}
                parentId={item.id}
                index={childIndex}
                level={level + 1}
                onDrop={onDrop}
              />
            ))
          ) : (
            <div className="empty-folder">
              Carpeta vacía - Arrastra archivos aquí
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};

// Componente principal
const NestedDndExample: React.FC = () => {
  // Estado para manejar los items
  const [items, setItems] = useState<TreeItem[]>(initialItems);
  
  // Función auxiliar para encontrar y actualizar elementos en estructura anidada
  const findItemById = (items: TreeItem[], id: string): TreeItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  // Función auxiliar para eliminar un elemento por ID
  const removeItemById = (items: TreeItem[], id: string): TreeItem[] => {
    return items.filter(item => {
      if (item.id === id) {
        return false;
      }
      if (item.children) {
        item.children = removeItemById(item.children, id);
      }
      return true;
    });
  };
  
  // Función auxiliar para añadir un elemento a un padre específico
  const addItemToParent = (
    items: TreeItem[],
    parentId: string,
    newItem: TreeItem,
    position: 'before' | 'after' | 'inside',
    targetId?: string
  ): TreeItem[] => {
    return items.map(item => {
      // Si este es el elemento padre
      if (item.id === parentId) {
        console.log(`Añadiendo a padre ${parentId} en posición ${position}`);
        if (!item.children) {
          item.children = [];
        }
        
        // Añadir según la posición
        if (position === 'inside') {
          item.children.push(newItem);
          console.log(`Añadido ${newItem.id} dentro de ${parentId}`);
        } else if (targetId && (position === 'before' || position === 'after')) {
          const targetIndex = item.children.findIndex(child => child.id === targetId);
          if (targetIndex !== -1) {
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            item.children.splice(insertIndex, 0, newItem);
            console.log(`Añadido ${newItem.id} ${position} de ${targetId}`);
          } else {
            item.children.push(newItem);
            console.log(`Target no encontrado, añadido al final de ${parentId}`);
          }
        }
        return item;
      }
      
      // Procesar recursivamente
      if (item.children) {
        item.children = addItemToParent(item.children, parentId, newItem, position, targetId);
      }
      
      return item;
    });
  };
  
  // Manejar el evento de soltar
  const handleDrop = (result: DropResult) => {
    console.log('Drop result completo:', result);
    
    // Extraer información
    const { source, destination, item } = result;
    const draggedItem = item.data as TreeItem;
    
    if (!destination) {
      console.log('No hay destino, cancelando');
      return;
    }
    
    // Imprimir la información para depuración
    console.log('Origen:', source);
    console.log('Destino:', destination);
    console.log('Item:', draggedItem);
    
    // Prevenir el drop de un elemento en sí mismo
    if (source.id === destination.id) {
      console.log('Intentando soltar en sí mismo, cancelando');
      return;
    }
    
    // Prevenir el drop de un padre en uno de sus descendientes (evitar ciclos)
    let isNested = false;
    const checkNesting = (items: TreeItem[], targetId: string, itemToFind: string): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          if (item.children) {
            if (item.children.some(child => child.id === itemToFind)) {
              return true;
            }
            for (const child of item.children) {
              if (checkNesting([child], child.id, itemToFind)) {
                return true;
              }
            }
          }
        } else if (item.children) {
          if (checkNesting(item.children, targetId, itemToFind)) {
            return true;
          }
        }
      }
      return false;
    };
    
    if (draggedItem.type === 'folder' && checkNesting([draggedItem], draggedItem.id, destination.id)) {
      console.log('Intentando soltar un padre en su descendiente, cancelando');
      return;
    }
    
    // Crear una copia profunda de los items para evitar mutaciones no deseadas
    let newItems = JSON.parse(JSON.stringify(items)) as TreeItem[];
    
    // Eliminar el elemento de su posición original
    newItems = removeItemById(newItems, draggedItem.id);
    
    // Si el destino es una carpeta y queremos poner el item dentro
    if (destination.position === 'inside') {
      console.log(`Añadiendo ${draggedItem.id} DENTRO de ${destination.id}`);
      
      // Si estamos soltando en la raíz
      if (destination.id === 'root') {
        newItems.push(draggedItem);
      } else {
        // Buscar la carpeta destino y añadir el item a sus hijos
        newItems = addItemToParent(
          newItems,
          destination.id,
          draggedItem,
          'inside'
        );
      }
    } else {
      // Si estamos soltando antes o después de un elemento a nivel raíz
      if (!destination.parentId) {
        const destIndex = newItems.findIndex(item => item.id === destination.id);
        if (destIndex !== -1) {
          const insertIndex = destination.position === 'before' ? destIndex : destIndex + 1;
          console.log(`Añadiendo ${draggedItem.id} a nivel raíz, ${destination.position} de ${destination.id}, índice: ${insertIndex}`);
          newItems.splice(insertIndex, 0, draggedItem);
        } else {
          console.log(`Destino no encontrado a nivel raíz, añadiendo al final`);
          newItems.push(draggedItem);
        }
      } else {
        // Si estamos soltando antes o después de un elemento dentro de una carpeta
        console.log(`Añadiendo ${draggedItem.id} ${destination.position} de ${destination.id} dentro de ${destination.parentId}`);
        newItems = addItemToParent(
          newItems,
          destination.parentId,
          draggedItem,
          destination.position,
          destination.id
        );
      }
    }
    
    // Actualizar el estado
    console.log('Nuevos items:', JSON.stringify(newItems, null, 2));
    setItems(newItems);
  };
  
  return (
    <div className="nested-dnd-example" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '20px' }}>Explorador de Archivos</h2>
      
      <DndProvider 
        onDragStart={(item) => console.log('Drag started:', item)}
        onDragEnd={(result) => console.log('Drag ended:', result)}
        debugMode={true}
      >
        <div style={{ 
          width: '400px', 
          margin: '0 auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9f9f9'
        }}>
          <Droppable
            id="root-droppable"
            type={['file', 'folder']}
            dropOverClass="diego-dnd-over"
            dropBeforeClass="diego-dnd-position-before"
            dropAfterClass="diego-dnd-position-after"
            dropInsideClass="diego-dnd-position-inside"
            highlightOnDragOver={true}
            onDrop={(draggedItem, position) => {
              // Si es dentro de la raíz, crear un resultado personalizado
              const result: DropResult = {
                source: {
                  id: draggedItem.id,
                  type: draggedItem.type,
                  parentId: draggedItem.parentId,
                  index: draggedItem.index
                },
                destination: {
                  id: 'root',
                  type: 'root',
                  position
                },
                item: draggedItem
              };
              handleDrop(result);
              return result;
            }}
            style={{
              position: 'relative',
              minHeight: items.length ? 'auto' : '100px'
            }}
          >
            {items.map((item, index) => (
              <TreeNode
                key={item.id}
                item={item}
                index={index}
                level={0}
                onDrop={handleDrop}
              />
            ))}
          </Droppable>
        </div>
        
        {/* Vista previa durante el arrastre */}
        <DragPreview>
          {(item) => {
            const treeItem = item as TreeItem;
            return (
              <div 
                style={{
                  padding: '8px 12px',
                  backgroundColor: treeItem.color || '#fff',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  width: '200px'
                }}
              >
                <span style={{ marginRight: '8px' }}>
                  {treeItem.type === 'folder' ? '📁' : '📄'}
                </span>
                {treeItem.content}
              </div>
            );
          }}
        </DragPreview>
      </DndProvider>
    </div>
  );
};

export default NestedDndExample;