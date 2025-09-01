# 📁 File Uploader - Zona de Carga de Archivos

Una zona de drop moderna y elegante para subir archivos con preview, progreso y validación.

![File Uploader Demo](../assets/gifs/file-uploader.gif)

## ✨ Características

- 📎 Drag & drop de archivos
- 👀 Preview de imágenes
- 📊 Barra de progreso de carga
- ✅ Validación de tipos y tamaño
- 🗑️ Eliminar archivos
- 📱 Responsive y accesible
- 💾 Múltiples archivos

## 🚀 Código Completo

```tsx
// FileUploader.tsx
import React, { useState, useCallback } from 'react';
import { DndProvider, DragDropArea } from 'diego-dnd';
import './FileUploader.css';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export function FileUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Simular carga de archivo
  const simulateUpload = useCallback((fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.floor(progress) }
            : f
        ));
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Tipo de archivo no soportado: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    if (uploadedFiles.length >= MAX_FILES) {
      return `Máximo ${MAX_FILES} archivos permitidos`;
    }
    return null;
  };

  // Crear preview para imágenes
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  // Manejar archivos soltados
  const handleFilesDrop = async (droppedItems: any[]) => {
    // En un caso real, droppedItems serían archivos del navegador
    // Para el demo, simularemos archivos
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < Math.min(droppedItems.length, MAX_FILES - uploadedFiles.length); i++) {
      const mockFile = {
        name: `documento-${Date.now()}-${i}.pdf`,
        type: 'application/pdf',
        size: Math.floor(Math.random() * 1000000) + 100000,
        lastModified: Date.now()
      } as File;

      const error = validateFile(mockFile);
      if (error) {
        console.error(error);
        continue;
      }

      const preview = await createPreview(mockFile);
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file: mockFile,
        preview,
        status: 'uploading',
        progress: 0
      };

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Iniciar simulación de carga para cada archivo
      newFiles.forEach(file => {
        simulateUpload(file.id);
      });
    }
  };

  // Eliminar archivo
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type === 'text/plain') return '📃';
    return '📎';
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const stats = {
    total: uploadedFiles.length,
    completed: uploadedFiles.filter(f => f.status === 'completed').length,
    uploading: uploadedFiles.filter(f => f.status === 'uploading').length,
    errors: uploadedFiles.filter(f => f.status === 'error').length
  };

  return (
    <DndProvider>
      <div className="file-uploader">
        <header className="uploader-header">
          <h1>📁 Subir Archivos</h1>
          <p>Arrastra archivos aquí o haz clic para seleccionar</p>
          
          {/* Estadísticas */}
          <div className="upload-stats">
            <span className="stat">
              📊 Total: <strong>{stats.total}</strong>
            </span>
            <span className="stat">
              ⬆️ Subiendo: <strong>{stats.uploading}</strong>
            </span>
            <span className="stat">
              ✅ Completados: <strong>{stats.completed}</strong>
            </span>
            {stats.errors > 0 && (
              <span className="stat error">
                ❌ Errores: <strong>{stats.errors}</strong>
              </span>
            )}
          </div>
        </header>

        {/* Zona de drop */}
        <DragDropArea
          accept={['file', 'document', 'image']}
          onDrop={handleFilesDrop}
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          multiple={true}
          disabled={uploadedFiles.length >= MAX_FILES}
        >
          <div className="upload-content">
            {uploadedFiles.length === 0 ? (
              <>
                <div className="upload-icon">☁️</div>
                <h3>Arrastra archivos aquí</h3>
                <p>o haz clic para seleccionar</p>
                <div className="supported-formats">
                  <small>
                    Soporta: JPG, PNG, PDF, DOC, TXT<br/>
                    Máximo: {MAX_FILE_SIZE / 1024 / 1024}MB por archivo
                  </small>
                </div>
              </>
            ) : (
              <>
                <div className="upload-summary">
                  <span className="upload-icon">📂</span>
                  <span>{uploadedFiles.length} de {MAX_FILES} archivos</span>
                </div>
                {uploadedFiles.length < MAX_FILES && (
                  <p><small>Arrastra más archivos o haz clic</small></p>
                )}
              </>
            )}
          </div>
        </DragDropArea>

        {/* Lista de archivos */}
        {uploadedFiles.length > 0 && (
          <div className="files-list">
            <h3>📋 Archivos Subidos</h3>
            
            {uploadedFiles.map(uploadedFile => (
              <FileItem
                key={uploadedFile.id}
                uploadedFile={uploadedFile}
                onRemove={() => removeFile(uploadedFile.id)}
              />
            ))}

            {/* Acciones globales */}
            <div className="global-actions">
              <button 
                className="clear-all-btn"
                onClick={() => setUploadedFiles([])}
                disabled={uploadedFiles.length === 0}
              >
                🗑️ Limpiar Todo
              </button>
              <button 
                className="upload-more-btn"
                disabled={uploadedFiles.length >= MAX_FILES}
              >
                ➕ Subir Más
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

// Componente para archivo individual
interface FileItemProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
}

function FileItem({ uploadedFile, onRemove }: FileItemProps) {
  const { file, preview, status, progress } = uploadedFile;

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading': return '⬆️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📎';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading': return `Subiendo... ${progress}%`;
      case 'completed': return 'Completado';
      case 'error': return 'Error al subir';
      default: return 'Pendiente';
    }
  };

  return (
    <div className={`file-item ${status}`}>
      {/* Preview o icono */}
      <div className="file-preview">
        {preview ? (
          <img src={preview} alt={file.name} className="preview-image" />
        ) : (
          <div className="file-icon">
            {getFileIcon(file)}
          </div>
        )}
      </div>

      {/* Info del archivo */}
      <div className="file-info">
        <div className="file-name" title={file.name}>
          {file.name}
        </div>
        <div className="file-details">
          <span className="file-size">{formatFileSize(file.size)}</span>
          <span className="file-status">
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>
        
        {/* Barra de progreso */}
        {status === 'uploading' && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Botón eliminar */}
      <button
        onClick={onRemove}
        className="remove-btn"
        title="Eliminar archivo"
        disabled={status === 'uploading'}
      >
        🗑️
      </button>
    </div>
  );
}

function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) return '🖼️';
  if (file.type === 'application/pdf') return '📄';
  if (file.type.includes('word')) return '📝';
  if (file.type === 'text/plain') return '📃';
  return '📎';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
```

## 🎨 Estilos CSS

```css
/* FileUploader.css */
.file-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.uploader-header {
  text-align: center;
  margin-bottom: 32px;
}

.uploader-header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: #2d3748;
}

.uploader-header p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.upload-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat {
  font-size: 14px;
  color: #718096;
}

.stat.error {
  color: #e53e3e;
}

/* Zona de upload */
.upload-zone {
  border: 3px dashed #cbd5e0;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  background: #f7fafc;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 32px;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.upload-zone.diego-dnd-drop-active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
}

.upload-zone:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-content .upload-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  display: block;
}

.upload-content h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #2d3748;
}

.upload-content p {
  color: #718096;
  margin-bottom: 16px;
}

.supported-formats {
  color: #a0aec0;
  font-size: 12px;
}

.upload-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.2rem;
  color: #4a5568;
}

/* Lista de archivos */
.files-list h3 {
  color: #2d3748;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.file-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.file-item.completed {
  border-color: #48bb78;
  background: #f0fff4;
}

.file-item.error {
  border-color: #e53e3e;
  background: #fed7d7;
}

/* Preview */
.file-preview {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 24px;
}

/* Info del archivo */
.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.file-size {
  color: #718096;
}

.file-status {
  color: #4a5568;
}

/* Barra de progreso */
.progress-bar {
  width: 100%;
  height: 4px;
  background: #edf2f7;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* Botón eliminar */
.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: #fed7d7;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Acciones globales */
.global-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.clear-all-btn,
.upload-more-btn {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  border-color: #e53e3e;
  color: #e53e3e;
}

.upload-more-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.clear-all-btn:disabled,
.upload-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .file-uploader {
    padding: 16px;
  }

  .upload-zone {
    padding: 32px 16px;
  }

  .upload-stats {
    flex-direction: column;
    gap: 8px;
  }

  .file-item {
    padding: 12px;
  }

  .file-details {
    flex-direction: column;
    gap: 4px;
  }

  .global-actions {
    flex-direction: column;
  }
}
```

## 🎯 Características Técnicas

### 1. Validación de Archivos
```tsx
const validateFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Tipo no soportado: ${file.type}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Archivo muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
};
```

### 2. Preview de Imágenes
```tsx
const createPreview = (file: File): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};
```

### 3. Simulación de Progreso
```tsx
const simulateUpload = (fileId: string) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    
    if (progress >= 100) {
      clearInterval(interval);
      // Marcar como completado
    } else {
      // Actualizar progreso
    }
  }, 200);
};
```

## 🚀 Integraciones Reales

### Con Backend (Express + Multer)
```tsx
const handleRealFileUpload = async (files: FileList) => {
  const formData = new FormData();
  
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading:', error);
  }
};
```

### Con Servicios de Cloud
```tsx
// AWS S3
import AWS from 'aws-sdk';

const uploadToS3 = async (file: File) => {
  const s3 = new AWS.S3();
  
  const params = {
    Bucket: 'your-bucket',
    Key: `uploads/${Date.now()}-${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  return s3.upload(params).promise();
};
```

## 📱 Demo en Vivo

- [CodeSandbox](https://codesandbox.io/s/diego-dnd-file-uploader) - Prueba el código
- [GitHub](https://github.com/DiegoAndres717/diego-dnd/tree/main/examples/file-uploader) - Código completo

---

**Siguiente:** [📋 Kanban Board](04-kanban-board.md) - Tablero estilo Trello