const fs = require("fs");
const path = require("path");

// Directorio donde están los archivos d.ts generados
const typesDir = path.resolve(__dirname, "../dist");

// Comprobar si existe el archivo index.d.ts en la raíz de dist
const indexDtsPath = path.join(typesDir, "index.d.ts");

if (fs.existsSync(indexDtsPath)) {
  console.log("✅ El archivo index.d.ts ya existe.");
} else {
  console.log(
    "⚠️ No se encontró index.d.ts. Verificando si existe en src/index.ts..."
  );

  // Comprobar si existe el archivo de tipos generado para index.ts
  if (fs.existsSync(path.join(typesDir, "index.d.ts"))) {
    console.log("✅ Archivo index.d.ts encontrado en la compilación.");
  } else {
    console.error("❌ No se encontró archivo de tipos para index.ts");
    console.log("Generando un archivo de tipos básico...");

    // Contenido básico de index.d.ts que reexporta todos los tipos
    const content = `// Componentes principales
export { DndProvider } from './components/DndContext';
export { Draggable } from './components/Draggable';
export { Droppable } from './components/Droppable';
export { DragPreview } from './components/DragPreview';

// Hooks
export { useDrag } from './hooks/useDrag';
export { useDrop } from './hooks/useDrop';
export { useDndContext } from './hooks/useDndContext';

// Utilidades
export { getDropPosition, findClosestElement, applyDropHighlight } from './utils/positionHelpers';

// Tipos
export type {
  DragItemType,
  DragItem,
  DragPosition,
  DropPosition,
  DropResult,
  DndContextType,
  DragOptions,
  DropOptions,
  DndNode
} from './types';

// Versión
export const VERSION: string;`;

    // Escribir el archivo
    fs.writeFileSync(indexDtsPath, content);
    console.log(`✅ Archivo index.d.ts creado en ${indexDtsPath}`);
  }
}
