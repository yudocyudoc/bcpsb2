// src/pages/ObservatoryTestPage.tsx
import { PhaserGame } from "@/components/observatory/PhaserGame";

export function ObservatoryTestPage() {
  return (
    // Este div es la clave. Es un contenedor posicionado absolutamente
    // que ocupa todo el espacio de su padre relativo (el <main> del DashboardLayout).
    // El padding (p-4) crea un margen interior para que el juego no pegue a los bordes.
    <div className="absolute inset-0 p-4">
        <PhaserGame />
    </div>
  );
}