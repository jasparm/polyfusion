import {resolve } from 'path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
    root,
    build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                
                twoD: "./src/2D/index.html",
                threeD: "./src/3D/3d.html",
                // fafa: resolve(root, 'index.html')
            }
        }
    }
})