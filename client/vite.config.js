import {resolve } from 'path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
console.log("hello")
export default defineConfig({
    root,
    build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(root, 'index.html'),
                twoD: resolve(root, '2D', 'index.html'),
                threeD: resolve(root, "3D", "index.html")
            }
        }
    }
})