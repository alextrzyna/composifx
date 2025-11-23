import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ComposiFX',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
    minify: false, // For development; enable in production
  },
});
