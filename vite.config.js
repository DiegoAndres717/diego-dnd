import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // El punto de entrada principal de la biblioteca
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiegoDnd',
      // Generar los formatos adecuados
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      // Asegúrese de externalizar las dependencias que no deberían estar 
      // en el bundle para evitar duplicados cuando un consumidor instale la biblioteca
      external: ['react', 'react-dom'],
      output: {
        // Proporcionar variables globales para los paquetes externos
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    // Asegurarse de que la carpeta dist esté limpia antes de construir
    emptyOutDir: false, // Cambiado a false para no eliminar los archivos .d.ts generados por tsc
    outDir: 'dist',
    sourcemap: true
  }
});