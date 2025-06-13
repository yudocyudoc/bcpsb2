// src/stores/useFavoritesStore.ts
import { create } from 'zustand';
import {
  getUserFavoriteCategoryIdsSupabase, // Asegúrate que la ruta a favoritesService.ts sea correcta
  addFavoriteCategorySupabase,
  removeFavoriteCategorySupabase,
} from '@/services/favoritesService'; // Ajusta la ruta si es necesario
import { toast } from 'sonner';

export interface FavoritesState { // <--- AÑADIDO 'export' aquí
  favoriteCategoryIds: Set<string>;
  isLoadingFavorites: boolean;
  favoritesError: string | null;
  fetchUserFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, categoryId: string) => Promise<void>;
  clearFavorites: () => void; // Para cuando el usuario hace logout
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteCategoryIds: new Set<string>(),
  isLoadingFavorites: false,
  favoritesError: null,

  fetchUserFavorites: async (userId: string) => {
    if (!userId) {
      set({ favoriteCategoryIds: new Set(), isLoadingFavorites: false, favoritesError: null });
      return;
    }
    set({ isLoadingFavorites: true, favoritesError: null });
    try {
      const ids = await getUserFavoriteCategoryIdsSupabase(userId);
      set({ favoriteCategoryIds: new Set(ids), isLoadingFavorites: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar favoritos.';
      console.error("useFavoritesStore - fetchUserFavorites:", errorMessage);
      set({ favoritesError: errorMessage, isLoadingFavorites: false });
      // No mostramos toast aquí, el componente puede decidirlo si es crítico
    }
  },

  toggleFavorite: async (userId: string, categoryId: string) => {
    if (!userId || !categoryId) return;

    const currentFavorites = new Set(get().favoriteCategoryIds);
    const wasFavorite = currentFavorites.has(categoryId); // Corregido el typo
    
    // Actualización optimista
    if (wasFavorite) {
      currentFavorites.delete(categoryId);
    } else {
      currentFavorites.add(categoryId);
    }
    set({ favoriteCategoryIds: currentFavorites });

    try {
      if (wasFavorite) {
        await removeFavoriteCategorySupabase(userId, categoryId);
        toast.info(`"${categoryId}" eliminada de favoritos.`); // Usar el título de la categoría sería mejor
      } else {
        await addFavoriteCategorySupabase(userId, categoryId);
        toast.success(`"${categoryId}" añadida a favoritos.`);
      }
      // La sincronización fue exitosa, el estado local ya es correcto.
      // Opcional: re-fetch para asegurar consistencia total, pero con optimista puede no ser necesario
      // await get().fetchUserFavorites(userId); // Descomentar si quieres re-fetch siempre
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar favorito.';
      console.error("useFavoritesStore - toggleFavorite:", errorMessage);
      toast.error(errorMessage);
      // Rollback: restaurar el estado anterior si la sincronización falla
      const originalFavorites = new Set(get().favoriteCategoryIds); // Obtener el estado actual (que es el optimista)
      if (wasFavorite) { // Si originalmente era favorito y falló el delete, lo volvemos a añadir
        originalFavorites.add(categoryId); 
      } else { // Si no era favorito y falló el add, lo quitamos
        originalFavorites.delete(categoryId);
      }
      set({ favoriteCategoryIds: originalFavorites, favoritesError: errorMessage });
    }
  },

  clearFavorites: () => {
    set({ favoriteCategoryIds: new Set(), isLoadingFavorites: false, favoritesError: null });
  },
}));