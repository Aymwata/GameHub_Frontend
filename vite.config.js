import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Permite que Vite procese los componentes JSX de React.
export default defineConfig({ plugins: [react()] });
