// src/services/profileService.ts
import { supabase } from "@/supabase/client";
import type { AppUserProfile } from "@/contexts/AuthContext";

// Definimos un tipo para los datos que se pueden actualizar.
// Es más seguro que permitir actualizar cualquier campo.
type ProfileUpdatePayload = {
  full_name?: string;
  username?: string;
  show_illustrations?: boolean;
};

/**
 * Actualiza el perfil de un usuario en la base de datos.
 * @param userId - El ID del usuario cuyo perfil se va a actualizar.
 * @param updates - Un objeto con los campos a actualizar.
 * @returns El perfil actualizado.
 */
export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdatePayload
): Promise<AppUserProfile> {
  if (!userId) {
    throw new Error("User ID is required to update a profile.");
  }

  console.log(`[ProfileService] Updating profile for user ${userId} with:`, updates);

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select('id, username, full_name, avatar_url, role, show_illustrations') // Devuelve la fila completa y actualizada
    .single();

  if (error) {
    console.error("[ProfileService] Error updating profile:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error("Profile not found or no data returned after update.");
  }

  console.log("[ProfileService] Profile updated successfully:", data);
  return data;
}