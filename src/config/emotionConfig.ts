// src/config/emotionConfig.ts

// Interfaz para la jerarquía de emociones (si una emoción principal tiene sub-emociones)
export interface EmotionHierarchy {
  [parentEmotion: string]: string[]; // ej: "Triste": ["Melancólico", "Desanimado"]
}

// Lista de emociones principales que se mostrarán como botones/opciones primarias
export const emotionsList: string[] = [
  "Triste",
  "Enojo", // O "Enojado/a"
  "Miedo", // O "Asustado/a"
  "Ansiedad", // O "Ansioso/a"
  "Vergüenza",
  "Culpa",
  "Alegría", // O "Feliz"
  "Interés", // O "Interesado/a"
  "Sorpresa",
  "Amor", // O "Amoroso/a"
  "Otra(s)" // Para emociones no listadas
];

// Jerarquía de sub-emociones (opcional, puedes expandir esto)
// Las claves deben coincidir con los strings en `emotionsList`
export const emotionHierarchy: EmotionHierarchy = {
  "Triste": ["Melancólico/a", "Desanimado/a", "Decepcionado/a", "Solitario/a"],
  "Enojo": ["Irritado/a", "Frustrado/a", "Resentido/a"],
  "Miedo": ["Nervioso/a", "Preocupado/a", "Inseguro/a"],
  "Ansiedad": ["Inquieto/a", "Tenso/a", "Agitado/a"],
  "Vergüenza": ["Avergonzado/a", "Humillado/a"],
  "Culpa": ["Arrepentido/a"],
  "Alegría": ["Contento/a", "Optimista", "Agradecido/a", "Aliviado/a"],
  "Interés": ["Curioso/a", "Entusiasmado/a"],
  "Sorpresa": ["Asombrado/a", "Confundido/a"],
  "Amor": ["Cariñoso/a", "Compasivo/a"],
  "Otra(s)": [] // "Otra(s)" no tiene sub-emociones predefinidas, se escriben
};

// (Opcional) Podrías añadir colores o iconos asociados a cada emoción principal aquí si lo deseas
// export interface EmotionDetails {
//   name: string;
//   colorClass?: string; // ej: 'bg-blue-100 text-blue-700'
//   icon?: React.ElementType;
// }
// export const emotionDetailsList: EmotionDetails[] = [
//   { name: "Triste", colorClass: "bg-blue-100" },
//   // ...
// ];