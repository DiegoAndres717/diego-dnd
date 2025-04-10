const fs = require('fs');
const path = require('path');

// Ruta del archivo CSS fuente
const sourceFile = path.resolve(__dirname, '../src/diego-dnd.css');
// Ruta del destino
const destFile = path.resolve(__dirname, '../dist/diego-dnd.css');

// Asegurarse de que el directorio de destino existe
const destDir = path.dirname(destFile);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copiar el archivo
try {
  fs.copyFileSync(sourceFile, destFile);
  console.log(`✅ CSS copiado exitosamente a ${destFile}`);
} catch (error) {
  console.error(`❌ Error al copiar CSS: ${error.message}`);
  process.exit(1);
}