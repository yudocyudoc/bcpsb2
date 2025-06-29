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
  "Triste": ["Melancólica", "Desanimada", "Decepcionada", "Solitaria"],
  "Enojo": ["Irritada", "Frustrada", "Resentida"],
  "Miedo": ["Nerviosa", "Preocupada", "Insegura"],
  "Ansiedad": ["Inquieta", "Tensa", "Agitada"],
  "Vergüenza": ["Avergonzada", "Humillada"],
  "Culpa": ["Arrepentida"],
  "Alegría": ["Contenta", "Optimista", "Agradecida", "Aliviada"],
  "Interés": ["Curiosa", "Entusiasmada"],
  "Sorpresa": ["Asombrada", "Confundida"],
  "Amor": ["Cariñosa", "Compasiva"],
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