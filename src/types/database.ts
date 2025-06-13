// src/types/database.ts (o donde prefieras)
export interface Profile {
    id: string; // Coincide con auth.users.id
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    role?: string | null; // La columna que quieres mostrar
    updated_at?: string | null;
    // created_at no es necesario usualmente en el frontend
  }