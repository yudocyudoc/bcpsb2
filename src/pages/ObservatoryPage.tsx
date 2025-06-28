// src/pages/ObservatoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWeeklyJourney, type MoodEntryWithEmbedding } from '@/services/observatoryService';
import { PhaserGame } from '@/components/observatory/PhaserGame';
import { Loader2, Telescope, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlanetDetailCard, type ReflectionData } from '@/components/observatory/PlanetDetailCard';
import StarsBackground from '@/components/observatory/StarsBackground'; // Asegúrate de que la ruta sea correcta

// --- COMPONENTE DE LAYOUT INTERNO ---
// Este componente se encarga del fondo y de centrar el contenido para los estados de carga, error y vacío.
const ObservatoryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <StarsBackground 
     density={160}
     baseSize={1.2}
     sizeVariation={2}
     twinkleSpeed={4}
     shootingStars={2} // 2-3 estrellas fugaces es suficiente
     className="z-0"
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export function ObservatoryPage() {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<MoodEntryWithEmbedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntryWithEmbedding | null>(null);

  // Extraer loadJourneyData fuera del useEffect para poder reutilizarlo
  const loadJourneyData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('[ObservatoryPage] Loading journey data...');
      
      const data = await getWeeklyJourney(user.id);
      setJourneyData(data);
      
      console.log(`[ObservatoryPage] Loaded ${data.length} entries`);
    } catch (err) {
      console.error('[ObservatoryPage] Error loading journey:', err);
      setError('Hubo un problema al cargar tu viaje emocional. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Efecto para la carga inicial
  useEffect(() => {
    loadJourneyData();
  }, [loadJourneyData]);

  // Nuevo efecto para manejar la reconexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('[ObservatoryPage] Network connection restored');
      if (!journeyData.length) {
        console.log('[ObservatoryPage] Retrying data load...');
        loadJourneyData();
      }
    };

    const handleOffline = () => {
      console.log('[ObservatoryPage] Network connection lost');
      setError('Sin conexión a internet. Reconectando...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [journeyData.length, loadJourneyData]);

  const handlePlanetClick = (entry: MoodEntryWithEmbedding) => {
    console.log('[ObservatoryPage] Planet clicked:', entry.id);
    setSelectedEntry(entry);
  };

  const handleSaveReflection = async (data: ReflectionData) => {
    console.log('[ObservatoryPage] Saving reflection:', data);
    // Aquí es donde llamarías a tu servicio para guardar los datos en la base de datos.
    // Por ejemplo: const { error } = await supabase.from('reflections').insert(data);
    
    // Después de guardar, podrías querer recargar los datos o simplemente cerrar el modal.
    // Por ahora, solo simulamos que se guarda y no hacemos nada más.
    // En un caso real, querrías manejar el estado de carga y los errores aquí también.
    return Promise.resolve();
  };

  // --- RENDERIZADO DE ESTADOS ---

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <ObservatoryLayout>
        <div className="text-center space-y-4 text-slate-300 flex flex-col items-center">
          <div className="relative mb-2">
            <Telescope className="w-16 h-16 text-blue-400/80 animate-pulse" />
            <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-yellow-300/70 animate-ping" />
          </div>
          <h2 className="text-xl font-light">Abriendo la cúpula del observatorio...</h2>
          <p className="text-sm text-slate-400 max-w-md">Preparando tu viaje emocional de los últimos 7 días.</p>
          <Loader2 className="w-6 h-6 animate-spin text-blue-400/80 mt-2" />
        </div>
      </ObservatoryLayout>
    );
  }

  // 2. Estado de Error
  if (error) {
    return (
      <ObservatoryLayout>
        <Alert variant="destructive" className="max-w-md mx-auto bg-red-950/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-red-300">Error de Conexión</AlertTitle>
            <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      </ObservatoryLayout>
    );
  }

  // 3. Estado Vacío (Sin datos)
  if (journeyData.length === 0) {
    return (
      <ObservatoryLayout>
        <Card className="max-w-lg mx-auto bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="relative mb-2">
              <Calendar className="w-16 h-16 mx-auto text-slate-600" />
              <Sparkles className="w-6 h-6 absolute -top-2 -right-4 text-slate-700" />
            </div>
            <h2 className="text-xl font-light text-slate-200">Tu universo emocional está esperando</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Aún no hay planetas para mostrar. Estos aparecerán aquí después de que hagas un registro y pasen al menos 24 horas, para permitir la reflexión con distancia.
            </p>
            <p className="text-xs text-slate-500 pt-4">
              Cada registro se convierte en un planeta único basado en tus emociones.
            </p>
          </CardContent>
        </Card>
      </ObservatoryLayout>
    );
  }

  // 4. Renderizado Principal (Con datos)
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden touch-none">
      {/* Las estrellas ahora viven aquí, para la vista principal */}
      <StarsBackground density={200} twinkleSpeed={12} />

      {/* Contenedor del juego de Phaser */}
      <div className="absolute inset-0">
        <PhaserGame 
          journeyData={journeyData}
          onPlanetClick={handlePlanetClick}
        />
      </div>

      {/* HUD y Overlays */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Card className="bg-slate-900/80 backdrop-blur border-slate-800">
          <CardContent className="p-3 sm:p-4">
            <h1 className="text-base sm:text-lg font-light text-slate-200 flex items-center gap-2">
              <Telescope className="w-5 h-5 text-blue-400" />
              Observatorio Emocional
            </h1>
          </CardContent>
        </Card>
      </div>

      {/* Modal de reflexión (placeholder por ahora) */}
      {selectedEntry && (
        <PlanetDetailCard
          moodEntry={selectedEntry}
          isVisible={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onSaveReflection={handleSaveReflection}
        />
      )}
    </div>
  );
}