import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2021'], // Support for BigInt and modern JS
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2021',
      define: {
        global: 'globalThis', // ✅ Polyfill global
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true, // ✅ Polyfill Buffer
        }),
      ],
    },
  },
});
