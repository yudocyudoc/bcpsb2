// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AuthError } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapSupabaseAuthError(error: AuthError | null): string {
  if (!error) return '';
  
  const genericMessage = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";

  // Mensajes específicos
  if (error.message.toLowerCase().includes('invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (error.message.toLowerCase().includes('user already registered')) {
    return 'Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.';
  }
  if (error.message.toLowerCase().includes('password should be at least 6 characters')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (error.message.toLowerCase().includes('unable to validate email address: invalid format')) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (error.message.toLowerCase().includes('email rate limit exceeded')) {
    return 'Demasiados intentos para este correo. Por favor, inténtalo más tarde.';
  }
  if (error.message.toLowerCase().includes('for security purposes, you can only request this after')) {
    return 'Has solicitado esto recientemente. Por favor, espera un momento antes de intentarlo de nuevo.';
  }
  if (error.message.toLowerCase().includes('user not found')) {
    return 'No se encontró un usuario con este correo electrónico.';
  }


  // Podrías tener un log más detallado en desarrollo
  if (import.meta.env.DEV) {
    console.warn("Supabase Auth Error (original):", error.message);
  }
  
  // Mensaje genérico si no hay un mapeo específico
  return error.message || genericMessage;
}