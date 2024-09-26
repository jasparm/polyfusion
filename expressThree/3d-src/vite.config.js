/** @type {import('vite').UserConfig} */
export default {
    // config options
    build: {
        outDir: "../dist/3d",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
              }
        }
    }
    
  }