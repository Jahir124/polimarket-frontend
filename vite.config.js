import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ Asegura que los assets se sirvan desde la raíz
  build: {
    sourcemap: false, // ✅ Desactiva sourcemaps en producción (opcional)
    outDir: 'dist', // ✅ Carpeta de salida
    assetsDir: 'assets', // ✅ Carpeta para archivos estáticos
  },
})
