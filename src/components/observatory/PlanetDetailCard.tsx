// src/components/observatory/PlanetDetailCard.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Telescope, Star, Heart, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

interface PlanetDetailCardProps {
  moodEntry: MoodEntryWithEmbedding;
  isVisible: boolean;
  onClose: () => void;
  onSaveReflection: (data: ReflectionData) => Promise<void>;
}

export interface ReflectionData {
  mood_entry_id: string;
  reflection_text: string;
  planet_name: string;
  rating: number;
}

// Generar nombre procedimental del planeta
const generatePlanetName = (moodEntry: MoodEntryWithEmbedding, userNickname: string = "XX"): string => {
  const embedding = moodEntry.embedding;
  const hash = embedding.slice(0, 3).reduce((acc, val) => acc + Math.abs(val * 1000), 0);
  const suffix = Math.floor(hash % 999).toString().padStart(3, '0');
  
  // Tomar algunas letras del nickname (privacidad)
  const letters = userNickname.slice(0, 2).toUpperCase().padEnd(2, 'X');
  return `${letters}-${suffix}`;
};

// Calcular intensidad emocional desde embedding
const calculateIntensity = (embedding: number[]): number => {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return Math.min(Math.max(magnitude * 10, 1), 10);
};

// Extraer verbos/acciones del texto
const extractActions = (text: string): string[] => {
  if (!text) return [];
  
  const commonVerbs = [
    'hacer', 'decir', 'tener', 'estar', 'ser', 'ir', 'ver', 'dar', 'saber', 'querer',
    'llegar', 'pasar', 'poner', 'parecer', 'quedar', 'creer', 'hablar', 'llevar', 'dejar',
    'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir', 'volver', 'tomar', 'sentir',
    'trabajar', 'escribir', 'perder', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const actions = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return commonVerbs.some(verb => cleanWord.includes(verb));
  });
  
  return [...new Set(actions)].slice(0, 4);
};

// Extraer pensamientos principales
const extractMainThoughts = (thoughts: string): string[] => {
  if (!thoughts) return [];
  
  const sentences = thoughts.split(/[.;]/).map(s => s.trim()).filter(s => s.length > 10);
  return sentences.slice(0, 3);
};

// Preguntas contemplativas (rotar)
const contemplativeQuestions = [
  "¿Qué necesitaba esa versión de ti en ese momento?",
  "¿Qué sabiduría surge al observar esto desde la distancia?",
  "¿Qué comprensión o compasión emerge al contemplar esta experiencia?",
  "¿Qué le ofrecerías a esa persona que estaba navegando esa experiencia?"
];

const getContemplativeQuestion = (entryId: string): string => {
  const index = entryId.length % contemplativeQuestions.length;
  return contemplativeQuestions[index];
};

export const PlanetDetailCard: React.FC<PlanetDetailCardProps> = ({
  moodEntry,
  isVisible,
  onClose,
  onSaveReflection
}) => {
  const [reflection, setReflection] = useState('');
  const [planetName, setPlanetName] = useState('');
  const [rating, setRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Datos calculados del planeta
  const procedimalName = generatePlanetName(moodEntry, "FA"); // TODO: usar nickname real del usuario
  const intensity = calculateIntensity(moodEntry.embedding);
  const actions = extractActions(`${moodEntry.suceso} ${moodEntry.pensamientos_automaticos || ''}`);
  const mainThoughts = extractMainThoughts(moodEntry.pensamientos_automaticos || '');
  const contemplativeQuestion = getContemplativeQuestion(moodEntry.id);

  // Formatear fecha
  const dayOfWeek = new Date(moodEntry.created_at).toLocaleDateString('es-ES', { 
    weekday: 'long' 
  });

  useEffect(() => {
    if (isVisible) {
      setPlanetName('');
      setReflection('');
      setRating(0);
      setShowSuccess(false);
    }
  }, [isVisible]);

  const handleSave = async () => {
    if (!reflection.trim() || !planetName.trim()) return;
    
    setIsSaving(true);
    try {
      await onSaveReflection({
        mood_entry_id: moodEntry.id,
        reflection_text: reflection,
        planet_name: planetName,
        rating: rating
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 text-white border-slate-700/50">
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Telescope className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-100">
                  Bitácora del Planeta {procedimalName}
                </CardTitle>
                <p className="text-slate-400 text-sm capitalize">
                  Registro del {dayOfWeek}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Intensidad emocional */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Intensidad del Sistema
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-slate-700/50 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${intensity * 10}%` }}
                />
              </div>
              <span className="text-slate-300 font-medium">
                {intensity.toFixed(1)}/10
              </span>
            </div>
          </div>

          <Separator className="bg-slate-600/50" />

          {/* Datos objetivos del registro */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Composición del Sistema Planetario
            </h3>
            
            {/* Emociones */}
            <div className="mb-4">
              <h4 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                Emociones sentidas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {moodEntry.emociones_principales?.map((emotion, index) => (
                  <Badge key={index} variant="secondary" className="bg-pink-500/20 text-pink-200 border-pink-500/30">
                    {emotion}
                  </Badge>
                )) || <span className="text-slate-500">No registradas</span>}
              </div>
            </div>

            {/* Pensamientos principales */}
            {mainThoughts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-slate-300 font-medium mb-2">Pensamientos en órbita:</h4>
                <ul className="space-y-1">
                  {mainThoughts.map((thought, index) => (
                    <li key={index} className="text-slate-300 text-sm bg-slate-800/50 p-2 rounded border-l-2 border-blue-400/50">
                      "{thought}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Acciones identificadas */}
            {actions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-slate-300 font-medium mb-2">Acciones identificadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action, index) => (
                    <Badge key={index} variant="outline" className="border-slate-500 text-slate-300">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-slate-600/50" />

          {/* Pregunta contemplativa */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">
              🌌 Observación Contemplativa
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4">
              <p className="text-slate-200 italic text-center">
                "{contemplativeQuestion}"
              </p>
              <p className="text-slate-400 text-xs mt-3 text-center">
                Desde este observatorio, con la claridad que da la distancia...
              </p>
            </div>

            {/* Campo de reflexión */}
            <Textarea
              placeholder="Escribe tu reflexión contemplativa aquí..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px] bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Nombrar el planeta */}
          <div>
            <h4 className="text-slate-300 font-medium mb-2">¿Qué nombre le pondrías a este planeta/momento?</h4>
            <input
              type="text"
              placeholder={`Sugerencia: ${procedimalName}`}
              value={planetName}
              onChange={(e) => setPlanetName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:outline-none"
            />
          </div>

          {/* Sistema de calificación */}
          <div>
            <h4 className="text-slate-300 font-medium mb-3">
              ¿Qué tan útil fue esta reflexión para ti?
            </h4>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-slate-600'
                  } hover:text-yellow-300`}
                >
                  <Star className="h-6 w-6" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="text-slate-400 text-sm ml-3">
                {rating === 0 ? 'Sin calificar' : 
                 rating <= 2 ? 'Poco útil' :
                 rating <= 4 ? 'Útil' : 'Muy útil'}
              </span>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {showSuccess && (
            <Alert className="bg-green-900/50 border-green-500/50">
              <AlertDescription className="text-green-200">
                🌟 Reflexión guardada. Tu viaje contemplativo ha sido honrado.
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
              disabled={isSaving}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!reflection.trim() || !planetName.trim() || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Reflexión
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};