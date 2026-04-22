import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning threshold (Three.js is inherently large)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk 1: React core — almost never changes, cached forever
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Chunk 2: Three.js ecosystem — large but changes rarely
          'three-vendor': [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
          ],

          // Chunk 3: Supabase + Paddle — auth/payments
          'backend-vendor': [
            '@supabase/supabase-js',
            '@paddle/paddle-js',
          ],

          // Chunk 4: i18n — translations
          'i18n-vendor': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],

          // Chunk 5: Animation (framer-motion) — only for pages that use it
          'animation-vendor': ['framer-motion'],

          // Chunk 6: Heavy AI/ML libraries — lazy-loaded pages only
          'ai-vendor': [
            '@tensorflow/tfjs',
            '@tensorflow-models/depth-estimation',
            'onnxruntime-web',
            '@imgly/background-removal',
            '@gradio/client',
          ],
        },
      },
    },
  },
  // Prevent Vite from pre-bundling heavy libs (they are split above)
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs',
      '@tensorflow-models/depth-estimation',
      'onnxruntime-web',
      '@imgly/background-removal',
    ],
  },
});
