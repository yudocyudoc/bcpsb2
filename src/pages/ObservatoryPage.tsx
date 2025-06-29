// src/pages/ObservatoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWeeklyJourney, type MoodEntryWithEmbedding } from '@/services/observatoryService';
import { ObservatoryCanvas } from '@/components/observatory/ObservatoryCanvas';
import { Loader2, Telescope, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlanetDetailCard, type ReflectionData } from '@/components/observatory/PlanetDetailCard';
import StarsBackground from '@/components/observatory/StarsBackground';

// Componente de layout interno (mismo que antes)
const ObservatoryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <StarsBackground 
        density={160}
        baseSize={1.2}
        sizeVariation={2}
        twinkleSpeed={4}
        shootingStars={2}
        className="z-0"
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

// Componente principal 
export function ObservatoryPage() {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<MoodEntryWithEmbedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntryWithEmbedding | null>(null);

  // Lógica de carga
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

  useEffect(() => {
    loadJourneyData();
  }, [loadJourneyData]);

  // Handlers
  const handlePlanetClick = useCallback((entry: MoodEntryWithEmbedding) => {
    console.log('[ObservatoryPage] Planet clicked:', entry.id);
    setSelectedEntry(entry);
  }, []);

  const handleSaveReflection = useCallback(async (reflectionData: ReflectionData) => {
    console.log('[ObservatoryPage] Saving reflection:', reflectionData);
    // Implementar guardado de reflexión
    setSelectedEntry(null);
  }, []);

  // Estados de carga, error y vacío
  if (isLoading) {
    return (
      <ObservatoryLayout>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-400 text-sm">Explorando tu universo emocional...</p>
        </div>
      </ObservatoryLayout>
    );
  }

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
              Aún no hay pulsos para mostrar. Estos aparecerán aquí después de que hagas un registro y pasen al menos 24 horas, para permitir la reflexión con distancia.
            </p>
            <p className="text-xs text-slate-500 pt-4">
              Cada registro se convierte en un pulso emocional único basado en tus emociones.
            </p>
          </CardContent>
        </Card>
      </ObservatoryLayout>
    );
  }

  // Renderizado principal con R3F Canvas
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden touch-none">
      {/* R3F Canvas reemplaza PhaserGame */}
      <div className="absolute inset-0">
        <ObservatoryCanvas 
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

      {/* Modal de reflexión */}
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