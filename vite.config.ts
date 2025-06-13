// vite.config.ts

import path from 'node:path'
import tailwindcss from "@tailwindcss/vite";
import svgr from 'vite-plugin-svgr';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Opciones de configuración para la Progressive Web App (PWA)
const pwaOptions: Partial<VitePWAOptions> = {
    // 'autoUpdate' recarga la PWA automáticamente cuando hay una nueva versión del Service Worker.
    registerType: 'autoUpdate',
    // Inyecta automáticamente el script de registro del Service Worker.
    injectRegister: 'auto',
    // Opciones para el desarrollo. 'enabled: true' permite probar la PWA en el servidor de desarrollo.
    devOptions: {
        enabled: true,
        type: 'module',
    },
    // El manifiesto de la aplicación web. Define cómo se ve y se comporta la app al ser instalada.
    manifest: {
        name: 'BCP - Bienestar y Crecimiento',
        short_name: 'BCP',
        description: 'Herramientas interactivas para tu bienestar emocional.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
        shortcuts: [
            {
                name: "Nuevo Registro de Ánimo",
                short_name: "Ánimo",
                description: "Registra cómo te sientes ahora",
                url: "/mi-estado-animo?source=pwa_shortcut",
                icons: [{ "src": "/icons/shortcut-animo-96x96.png", "sizes": "96x96", "type": "image/png" }]
            },
            {
                name: "Botiquín Emocional",
                short_name: "Botiquín",
                description: "Accede a herramientas rápidas",
                url: "/botiquin?source=pwa_shortcut",
                icons: [{ "src": "/icons/shortcut-botiquin-96x96.png", "sizes": "96x96", "type": "image/png" }]
            }
        ]
    },
    // Configuración de Workbox, la librería que potencia el Service Worker.
    workbox: {
        // La página a la que se redirige cuando una ruta no se encuentra (esencial para SPAs).
        navigateFallback: '/index.html',
        // Archivos que se guardarán en la caché de forma proactiva (precaching) al instalar el SW.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json}'],
        
        // Estrategias de caché para peticiones en tiempo de ejecución (runtime).
        runtimeCaching: [
            // ESTRATEGIA 1: Fuentes de Google (CacheFirst)
            // Si ya tengo la fuente en caché, la uso. No pregunto a la red. Es muy rápido.
            {
                urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts-cache',
                    expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 año
                    cacheableResponse: { statuses: [0, 200] },
                },
            },

            // ESTRATEGIA 2: Progreso del Usuario (NetworkFirst)
            // Prioridad: datos frescos. Intenta ir a la red primero. Si falla, usa la última versión guardada en caché.
            // Se pone antes de la regla general de contenido para que tenga prioridad.
            {
                urlPattern: ({ url, request }) => 
                    request.method === 'GET' &&
                    url.hostname.includes('audycvtgnqotmftrldjo.supabase.co') &&
                    (url.pathname.includes('/rest/v1/user_story_progress') || 
                     url.pathname.includes('/rest/v1/user_story_visited_passages')),
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-user-progress-cache',
                    expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 días
                    cacheableResponse: { statuses: [0, 200] },
                },
            },

            // ESTRATEGIA 3: Contenido Principal - Técnicas, Historias, etc. (StaleWhileRevalidate)
            // Prioridad: rapidez. Muestra al instante lo que hay en caché (si hay algo).
            // Mientras tanto, va a la red a buscar una versión nueva para la próxima vez.
            {
                urlPattern: ({ url, request }) => 
                    request.method === 'GET' &&
                    url.hostname.includes('audycvtgnqotmftrldjo.supabase.co') &&
                    url.pathname.startsWith('/rest/v1/'),
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'api-content-cache',
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 1 semana
                    cacheableResponse: { statuses: [0, 200] },
                },
            },

            // ESTRATEGIA 4: Mutaciones - Guardar, Actualizar, Borrar (NetworkOnly + Background Sync)
            // Prioridad: integridad de datos. Siempre intenta ir a la red. Si falla, pone la petición en una cola 
            // para reintentarla automáticamente cuando vuelva la conexión.
            {
                urlPattern: ({ url, request }) => 
                    request.method !== 'GET' &&
                    url.hostname.includes('audycvtgnqotmftrldjo.supabase.co') &&
                    url.pathname.startsWith('/rest/v1/'),
                handler: 'NetworkOnly',
                options: {
                    backgroundSync: {
                        name: 'bcp-mutations-queue',
                        options: {
                            maxRetentionTime: 24 * 60, // Reintentar durante 24 horas
                        },
                    },
                },
            },
        ]
    }
};

// Configuración principal de Vite
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        svgr(),
        VitePWA(pwaOptions),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'es2015',
        minify: 'terser',
        cssCodeSplit: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]'
            }
        },
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
});
