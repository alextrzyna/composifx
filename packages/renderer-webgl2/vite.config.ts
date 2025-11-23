import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ComposiFXRendererWebGL2',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@composifx/core'],
      output: {
        globals: {
          '@composifx/core': 'ComposiFXCore',
        },
      },
    },
    sourcemap: true,
    target: 'esnext',
  },
});
