// src/components/mood/stepper-parts/SubmissionSuccessScreen.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Repeat, BarChart3, Lightbulb } from 'lucide-react';
import { Card, CardContent} from '@/components/ui/card';
import type { MoodEntry } from '@/types/mood'; // O '@/types/mood'
import { Link } from 'react-router-dom'; // Si quieres enlazar a otras secciones

interface SubmissionSuccessScreenProps {
  onStartNew: () => void; // Para volver a llenar el formulario
  lastEntry?: MoodEntry | null; // Opcional, para mostrar un mini resumen
  weeklyEntryCount?: number;
}

const motivationalMessages = [
    "¡Cada reflexión es un paso hacia tu bienestar!",
    "¡Sigue así, estás haciendo un gran trabajo!",
    "Reconocer tus emociones es un signo de fortaleza.",
    "Tu autoconocimiento está creciendo con cada registro.",
    "¡Excelente! Has dedicado tiempo para ti."
];

export const SubmissionSuccessScreen: React.FC<SubmissionSuccessScreenProps> = ({
  onStartNew,
 // lastEntry,
  weeklyEntryCount = 0
}) => {
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 animate-fade-in space-y-6">
      <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500" />
      <h2 className="text-2xl sm:text-3xl font-bold">¡Registro Guardado!</h2>
      <p className="text-muted-foreground max-w-md">
        {randomMessage}
      </p>

      {weeklyEntryCount > 0 && (
          <Card className="w-full max-w-sm bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
              <CardContent className="p-4 text-sm">
                  <div className="flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                      <p className="text-green-700 dark:text-green-300">
                          Has realizado <strong>{weeklyEntryCount}</strong> {weeklyEntryCount === 1 ? 'registro' : 'registros'} esta semana.
                      </p>
                  </div>
              </CardContent>
          </Card>
      )}
      
      {/* Opcional: Mini resumen del último registro */}
      {/* {lastEntry && (
        <Card className="w-full max-w-sm text-left">
          <CardHeader className="pb-2"><CardTitle className="text-base">Tu último registro:</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p><strong>Suceso:</strong> {lastEntry.suceso.substring(0,50)}...</p>
            <p><strong>Emociones principales:</strong> {lastEntry.emociones.join(', ')}</p>
          </CardContent>
        </Card>
      )} */}

      <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-xs sm:max-w-none justify-center">
        <Button onClick={onStartNew} size="lg" className="w-full sm:w-auto">
          <Repeat className="mr-2 h-4 w-4" /> Registrar Otro Suceso
        </Button>
        {/* Podrías añadir un enlace a la página de historial o a una lección de mindfulness */}
        <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
          <Link to="/lessons"> {/* O a una página de "Mis Estadísticas" si la tienes */}
            <Lightbulb className="mr-2 h-4 w-4" /> Explorar Lecciones
          </Link>
        </Button>
      </div>
    </div>
  );
};