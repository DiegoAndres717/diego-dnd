# 📁 Carpetas Anidadas - Explorador de Archivos

Un explorador de archivos completo con estructura anidada, drag & drop entre carpetas y gestión de archivos.

![Nested Folders Demo](../assets/gifs/nested-folders.gif)

## ✨ Características

- 🗂️ Estructura de carpetas anidadas (árbol)
- 📁 Crear/renombrar/eliminar carpetas
- 📄 Mover archivos entre carpetas
- 🔍 Expandir/colapsar carpetas
- 🎯 Drag & drop multinivel
- 📊 Contador de elementos
- 🔗 Breadcrumbs de navegación
- ⌨️ Navegación por teclado

## 🚀 Código Completo

```tsx
// FolderExplorer.tsx
import React, { useState, useCallback } from 'react';
import { DndProvider, Draggable, Droppable } from 'diego-dnd';
import './FolderExplorer.css';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  size?: number;
  extension?: string;
  createdAt: Date;
  children?: FileItem[];
}

// Estructura inicial de archivos
const INITIAL_FILES: FileItem[] = [
  {
    id: 'root',
    name: 'Mi Explorador',
    type: 'folder',
    createdAt: new Date('2024-01-01'),
    children: [
      {
        id: 'documents',
        name: 'Documentos',
        type: 'folder',
        parentId: 'root',
        createdAt: new Date('2024-01-02'),
        children: [
          {
            id: 'doc1',
            name: 'Proyecto.pdf',
            type: 'file',
            parentId: 'documents',
            size: 2048000,
            extension: 'pdf',
            createdAt: new Date('2024-01-05')
          },
          {
            id: 'doc2',
            name: 'Presentación.pptx',
            type: 'file',
            parentId: 'documents',
            size: 5120000,
            extension: 'pptx',
            createdAt: new Date('2024-01-06')
          },
          {
            id: 'work',
            name: 'Trabajo',
            type: 'folder',
            parentId: 'documents',
            createdAt: new Date('2024-01-03'),
            children: [
              {
                id: 'work1',
                name: 'Informe.docx',
                type: 'file',
                parentId: 'work',
                size: 1024000,
                extension: 'docx',
                createdAt: new Date('2024-01-10')
              }
            ]
          }
        ]
      },
      {
        id: 'images',
        name: 'Imágenes',
        type: 'folder',
        parentId: 'root',
        createdAt: new Date('2024-01-04'),
        children: [
          {
            id: 'img1',
            name: 'Foto1.jpg',
            type: 'file',
            parentId: 'images',
            size: 3072000,
            extension: 'jpg',
            createdAt: new Date('2024-01-12')
          },
          {
            id: 'img2',
            name: 'Logo.png',
            type: 'file',
            parentId: 'images',
            size: 512000,
            extension: 'png',
            createdAt: new Date('2024-01-13')
          }
        ]
      },
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        parentId: 'root',
        size: 2048,
        extension: 'md',
        createdAt: new Date('2024-01-01')
      }
    ]
  }
];

export function FolderExplorer() {
  const [fileStructure, setFileStructure] = useState<FileItem[]>(INITIAL_FILES);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'documents', 'images'])
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(['root']);
  const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder'; parentId: string } | null>(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);

  // Encontrar un item por ID en la estructura anidada
  const findItemById = useCallback((items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Obtener path completo de un item
  const getItemPath = useCallback((itemId: string): string[] => {
    const path: string[] = [];
    let currentId = itemId;
    
    while (currentId) {
      const item = findItemById(fileStructure, currentId);
      if (item) {
        path.unshift(item.id);
        currentId = item.parentId || '';
      } else {
        break;
      }
    }
    
    return path;
  }, [fileStructure, findItemById]);

  // Toggle expandir/colapsar carpeta
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Manejar drop de elementos
  const handleItemDrop = useCallback((result: any) => {
    const { item, destination } = result;
    
    if (!destination) return;

    const itemData = item.data as FileItem;
    const targetId = destination.id;
    
    // No se puede mover a sí mismo o a sus hijos
    if (itemData.id === targetId) return;
    
    // Verificar si el target es una carpeta
    const targetItem = findItemById(fileStructure, targetId);
    if (!targetItem || targetItem.type !== 'folder') return;

    // Verificar que no sea un movimiento circular (mover carpeta a su propio hijo)
    if (itemData.type === 'folder') {
      const targetPath = getItemPath(targetId);
      if (targetPath.includes(itemData.id)) {
        alert('No puedes mover una carpeta dentro de sí misma');
        return;
      }
    }

    // Actualizar estructura
    setFileStructure(prev => {
      const updateStructure = (items: FileItem[]): FileItem[] => {
        return items.map(currentItem => {
          // Remover item del lugar actual
          if (currentItem.children) {
            currentItem.children = currentItem.children.filter(child => child.id !== itemData.id);
          }
          
          // Añadir item al nuevo destino
          if (currentItem.id === targetId) {
            const movedItem = { ...itemData, parentId: targetId };
            return {
              ...currentItem,
              children: [...(currentItem.children || []), movedItem]
            };
          }
          
          // Recursión para carpetas anidadas
          if (currentItem.children) {
            return {
              ...currentItem,
              children: updateStructure(currentItem.children)
            };
          }
          
          return currentItem;
        });
      };
      
      return updateStructure(prev);
    });

    // Expandir carpeta de destino automáticamente
    setExpandedFolders(prev => new Set([...prev, targetId]));
  }, [fileStructure, findItemById, getItemPath]);

  // Crear nuevo item
  const createItem = (name: string, type: 'file' | 'folder', parentId: string) => {
    if (!name.trim()) return;

    const newItem: FileItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      parentId,
      createdAt: new Date(),
      ...(type === 'file' && {
        size: Math.floor(Math.random() * 1000000) + 1000,
        extension: name.split('.').pop() || 'txt'
      }),
      ...(type === 'folder' && { children: [] })
    };

    setFileStructure(prev => {
      const addToStructure = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToStructure(item.children)
            };
          }
          return item;
        });
      };
      
      return addToStructure(prev);
    });

    setIsCreating(null);
  };

  // Renombrar item
  const renameItem = (itemId: string, newName: string) => {
    if (!newName.trim()) return;

    setFileStructure(prev => {
      const updateStructure = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, name: newName.trim() };
          }
          if (item.children) {
            return {
              ...item,
              children: updateStructure(item.children)
            };
          }
          return item;
        });
      };
      
      return updateStructure(prev);
    });

    setRenamingItem(null);
  };

  // Eliminar item
  const deleteItem = (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    setFileStructure(prev => {
      const removeFromStructure = (items: FileItem[]): FileItem[] => {
        return items
          .filter(item => item.id !== itemId)
          .map(item => ({
            ...item,
            children: item.children ? removeFromStructure(item.children) : undefined
          }));
      };
      
      return removeFromStructure(prev);
    });

    if (selectedItem === itemId) {
      setSelectedItem(null);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return expandedFolders.has(item.id) ? '📂' : '📁';
    }
    
    switch (item.extension?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'ppt':
      case 'pptx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '🗜️';
      case 'js':
      case 'ts':
      case 'html':
      case 'css': return '💻';
      case 'md': return '📋';
      default: return '📄';
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Contar elementos en una carpeta
  const countItems = (item: FileItem): { files: number; folders: number } => {
    if (item.type === 'file') return { files: 1, folders: 0 };
    
    let files = 0;
    let folders = 1;
    
    item.children?.forEach(child => {
      const counts = countItems(child);
      files += counts.files;
      folders += counts.folders;
    });
    
    return { files, folders: folders - 1 }; // -1 para no contar la carpeta actual
  };

  // Renderizar breadcrumbs
  const renderBreadcrumbs = () => {
    const pathItems = currentPath.map(id => findItemById(fileStructure, id)).filter(Boolean);
    
    return (
      <div className="breadcrumbs">
        {pathItems.map((item, index) => (
          <React.Fragment key={item!.id}>
            <button
              className="breadcrumb-item"
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
            >
              {getFileIcon(item!)} {item!.name}
            </button>
            {index < pathItems.length - 1 && (
              <span className="breadcrumb-separator">›</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const currentFolder = findItemById(fileStructure, currentPath[currentPath.length - 1]);
  const stats = currentFolder ? countItems(currentFolder) : { files: 0, folders: 0 };

  return (
    <DndProvider onDragEnd={handleItemDrop}>
      <div className="folder-explorer">
        {/* Header */}
        <header className="explorer-header">
          <h1>📁 Explorador de Archivos</h1>
          
          {/* Estadísticas */}
          <div className="explorer-stats">
            <span className="stat">
              📁 Carpetas: <strong>{stats.folders}</strong>
            </span>
            <span className="stat">
              📄 Archivos: <strong>{stats.files}</strong>
            </span>
            <span className="stat">
              📦 Total: <strong>{stats.files + stats.folders}</strong>
            </span>
          </div>
          
          {/* Breadcrumbs */}
          {renderBreadcrumbs()}
        </header>

        <div className="explorer-content">
          {/* Sidebar con árbol */}
          <aside className="explorer-sidebar">
            <div className="sidebar-header">
              <h3>🗂️ Estructura</h3>
            </div>
            
            <div className="file-tree">
              {fileStructure.map(item => (
                <FileTreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  expandedFolders={expandedFolders}
                  selectedItem={selectedItem}
                  onToggleFolder={toggleFolder}
                  onSelectItem={setSelectedItem}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="explorer-main">
            <div className="main-header">
              <div className="current-folder">
                <h2>
                  {getFileIcon(currentFolder!)} {currentFolder?.name}
                </h2>
              </div>
              
              <div className="main-actions">
                <button
                  onClick={() => setIsCreating({ type: 'folder', parentId: currentPath[currentPath.length - 1] })}
                  className="action-btn"
                  title="Nueva carpeta"
                >
                  📁➕ Carpeta
                </button>
                <button
                  onClick={() => setIsCreating({ type: 'file', parentId: currentPath[currentPath.length - 1] })}
                  className="action-btn"
                  title="Nuevo archivo"
                >
                  📄➕ Archivo
                </button>
              </div>
            </div>

            {/* Formulario de creación */}
            {isCreating && (
              <CreateItemForm
                type={isCreating.type}
                onConfirm={(name) => createItem(name, isCreating.type, isCreating.parentId)}
                onCancel={() => setIsCreating(null)}
              />
            )}

            {/* Lista de elementos */}
            <Droppable
              config={{
                id: currentPath[currentPath.length - 1],
                accept: ['file', 'folder'],
                onDrop: handleItemDrop
              }}
              className="items-grid"
            >
              {currentFolder?.children?.length === 0 ? (
                <div className="empty-folder">
                  <span className="empty-icon">📭</span>
                  <p>Carpeta vacía</p>
                  <small>Arrastra elementos aquí o crea nuevos</small>
                </div>
              ) : (
                currentFolder?.children?.map(item => (
                  <FileGridItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem === item.id}
                    isRenaming={renamingItem === item.id}
                    onSelect={() => setSelectedItem(item.id)}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        setCurrentPath([...currentPath, item.id]);
                        setExpandedFolders(prev => new Set([...prev, item.id]));
                      }
                    }}
                    onRename={(newName) => renameItem(item.id, newName)}
                    onStartRename={() => setRenamingItem(item.id)}
                    onCancelRename={() => setRenamingItem(null)}
                    onDelete={() => deleteItem(item.id)}
                    getFileIcon={getFileIcon}
                    formatFileSize={formatFileSize}
                  />
                ))
              )}
            </Droppable>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

// Componente para item del árbol
interface FileTreeItemProps {
  item: FileItem;
  level: number;
  expandedFolders: Set<string>;
  selectedItem: string | null;
  onToggleFolder: (id: string) => void;
  onSelectItem: (id: string) => void;
  getFileIcon: (item: FileItem) => string;
}

function FileTreeItem({
  item,
  level,
  expandedFolders,
  selectedItem,
  onToggleFolder,
  onSelectItem,
  getFileIcon
}: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedItem === item.id;

  return (
    <div className="tree-item">
      <div
        className={`tree-item-content ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelectItem(item.id)}
      >
        {item.type === 'folder' && (
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(item.id);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        <span className="tree-icon">{getFileIcon(item)}</span>
        <span className="tree-name">{item.name}</span>
        
        {item.children && (
          <span className="tree-count">({item.children.length})</span>
        )}
      </div>

      {item.type === 'folder' && isExpanded && item.children && (
        <div className="tree-children">
          {item.children.map(child => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedItem={selectedItem}
              onToggleFolder={onToggleFolder}
              onSelectItem={onSelectItem}
              getFileIcon={getFileIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para item de la grilla
interface FileGridItemProps {
  item: FileItem;
  isSelected: boolean;
  isRenaming: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onRename: (newName: string) => void;
  onStartRename: () => void;
  onCancelRename: () => void;
  onDelete: () => void;
  getFileIcon: (item: FileItem) => string;
  formatFileSize: (bytes: number) => string;
}

function FileGridItem({
  item,
  isSelected,
  isRenaming,
  onSelect,
  onDoubleClick,
  onRename,
  onStartRename,
  onCancelRename,
  onDelete,
  getFileIcon,
  formatFileSize
}: FileGridItemProps) {
  const [renameValue, setRenameValue] = useState(item.name);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim() && renameValue !== item.name) {
      onRename(renameValue);
    } else {
      onCancelRename();
    }
  };

  if (isRenaming) {
    return (
      <div className="grid-item renaming">
        <div className="item-icon">
          {getFileIcon(item)}
        </div>
        <form onSubmit={handleRename} className="rename-form">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setRenameValue(item.name);
                onCancelRename();
              }
            }}
            className="rename-input"
            autoFocus
            onFocus={(e) => {
              // Seleccionar nombre sin extensión
              const lastDot = e.target.value.lastIndexOf('.');
              if (lastDot > 0) {
                e.target.setSelectionRange(0, lastDot);
              } else {
                e.target.select();
              }
            }}
          />
        </form>
      </div>
    );
  }

  return (
    <Draggable
      config={{
        id: item.id,
        type: item.type,
        data: item
      }}
    >
      <div
        className={`grid-item ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onSelect();
        }}
      >
        <div className="item-icon">
          {getFileIcon(item)}
        </div>
        
        <div className="item-info">
          <div className="item-name" title={item.name}>
            {item.name}
          </div>
          
          <div className="item-details">
            {item.type === 'file' && item.size && (
              <span className="item-size">{formatFileSize(item.size)}</span>
            )}
            {item.type === 'folder' && item.children && (
              <span className="item-count">
                {item.children.length} elemento{item.children.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="item-date">
              {item.createdAt.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        </div>

        <div className="item-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartRename();
            }}
            className="action-btn small"
            title="Renombrar"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="action-btn small delete"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    </Draggable>
  );
}

// Formulario para crear elementos
interface CreateItemFormProps {
  type: 'file' | 'folder';
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function CreateItemForm({ type, onConfirm, onCancel }: CreateItemFormProps) {
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name);
    }
  };

  const placeholder = type === 'folder' 
    ? 'Nombre de la carpeta...' 
    : 'Nombre del archivo...';

  const defaultName = type === 'folder' 
    ? 'Nueva carpeta' 
    : 'Nuevo archivo.txt';

  return (
    <div className="create-form">
      <h4>🆕 Crear {type === 'folder' ? 'Carpeta' : 'Archivo'}</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="create-input"
          autoFocus
          onFocus={(e) => {
            if (!name) {
              setName(defaultName);
              setTimeout(() => {
                const lastDot = defaultName.lastIndexOf('.');
                if (lastDot > 0 && type === 'file') {
                  e.target.setSelectionRange(0, lastDot);
                } else {
                  e.target.select();
                }
              }, 0);
            }
          }}
        />
        <div className="form-actions">
          <button type="submit" className="confirm-btn">
            ✅ Crear
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
```
