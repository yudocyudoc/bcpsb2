// src/services/favoritesService.ts
import { supabase } from '@/supabase/client';
//import type { Database } from '@/supabase/database.types';

/**
 * Obtiene los IDs de las categorías favoritas de un usuario desde Supabase.
 */
export async function getUserFavoriteCategoryIdsSupabase(userId: string): Promise<string[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_favorite_categories') // Ahora este nombre de tabla debería ser reconocido
    .select('category_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorite categories:', error);
    // En una app real, podrías querer lanzar el error o manejarlo más específicamente
    return []; 
  }
  return data ? data.map(fav => fav.category_id) : [];
}

/**
 * Añade una categoría a los favoritos de un usuario en Supabase.
 */
export async function addFavoriteCategorySupabase(userId: string, categoryId: string): Promise<void> {
  if (!userId || !categoryId) {
    throw new Error('User ID and Category ID are required to add a favorite.');
  }

  const { error } = await supabase
    .from('user_favorite_categories') // Ahora este nombre de tabla debería ser reconocido
    .insert({ user_id: userId, category_id: categoryId });

  if (error) {
    console.error('Error adding favorite category:', error);
    // Podría ser un error de duplicado si la PK compuesta ya existe, 
    // lo cual está bien y no necesariamente un error fatal para la UX optimista.
    // Sin embargo, otros errores sí deberían lanzarse.
    if (error.code !== '23505') { // 23505 es unique_violation
        throw error;
    } else {
        console.warn(`Favorite category ${categoryId} for user ${userId} likely already exists.`);
    }
  }
}

/**
 * Elimina una categoría de los favoritos de un usuario en Supabase.
 */
export async function removeFavoriteCategorySupabase(userId: string, categoryId: string): Promise<void> {
  if (!userId || !categoryId) {
    throw new Error('User ID and Category ID are required to remove a favorite.');
  }

  const { error } = await supabase
    .from('user_favorite_categories') // Ahora este nombre de tabla debería ser reconocido
    .delete()
    .eq('user_id', userId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error removing favorite category:', error);
    throw error;
  }
}