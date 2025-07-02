// src/config/durationConfig.ts

export const DURATION_OPTIONS = [
    { value: 'unos_minutos', label: 'Unos minutos' },
    { value: 'una_hora', label: 'Una hora' },
    { value: 'varias_horas', label: 'Varias horas' },
    { value: 'mayor_parte_dia', label: 'La mayor parte del día' }
  ] as const;
  
  export const DEFAULT_DURATION = 'varias_horas';
  
  // Tipo derivado de las opciones
  export type DurationValue = typeof DURATION_OPTIONS[number]['value'];
  
  // Función helper para obtener el label de un valor
  export function getDurationLabel(value: string | null | undefined): string {
    if (!value) return '';
    const option = DURATION_OPTIONS.find(opt => opt.value === value);
    return option?.label || '';
  }
  
  // Función helper para validar si un valor es válido
  export function isValidDuration(value: string): value is DurationValue {
    return DURATION_OPTIONS.some(opt => opt.value === value);
  }