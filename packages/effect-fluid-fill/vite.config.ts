import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ComposiFXFluidFill',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@composifx/core', '@composifx/renderer-webgl2'],
    },
    sourcemap: true,
  },
});
