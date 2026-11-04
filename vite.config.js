import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { photoUrl } from './src/data/photos.js';

/* Ersetzt {{photo:<key>:<breite>}} in den HTML-Seiten durch die Foto-URL aus dem Manifest. */
const photoPlaceholders = () => ({
  name: 'giftly-photo-placeholders',
  transformIndexHtml: html =>
    html.replace(/\{\{photo:([\w:-]+?):(\d+)\}\}/g, (_, key, w) => photoUrl(key, +w) ?? ''),
});

export default defineConfig({
  base: './',
  plugins: [photoPlaceholders()],
  build: {
    rollupOptions: {
      input: { landing: resolve(__dirname, 'index.html'), app: resolve(__dirname, 'app/index.html') },
    },
  },
});
