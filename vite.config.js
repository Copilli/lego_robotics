import { defineConfig } from 'vite';
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/lego_robotics/' : '/',
  build: {rollupOptions: {output: {manualChunks: {editor:['codemirror','@codemirror/lang-javascript','@codemirror/theme-one-dark']}}}},
}));
