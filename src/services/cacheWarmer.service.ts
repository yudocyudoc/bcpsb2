// src/services/cacheWarmer.service.ts
import { getCachedAllStories } from './interactiveStoriesService';
import { getCachedAllTechniques } from './botiquinService';

let hasCacheBeenWarmed = false;

export const warmUpCache = async () => {
    if (hasCacheBeenWarmed || !navigator.onLine) {
        console.log('[Cache Warmer] Skipping: cache already warmed or app is offline.');
        return;
    }

    console.log('[Cache Warmer] Starting...');
    hasCacheBeenWarmed = true;

    try {
        // Al llamar a estas funciones, se poblará la caché si está vacía.
        await Promise.all([
            getCachedAllTechniques(),
            getCachedAllStories()
        ]);
        console.log('[Cache Warmer] Cache warming calls completed.');
    } catch (error) {
        console.error('[Cache Warmer] FAILED:', error);
        hasCacheBeenWarmed = false;
    }
};