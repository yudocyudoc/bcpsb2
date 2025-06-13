// src/components/mood/stepper-parts/Step2Emociones.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { EmotionButton } from './EmotionButton'; // Importar EmotionButton
import type { SelectedSubEmotions, OtherEmotions } from '@/types/mood';
import type { EmotionHierarchy } from '@/config/emotionConfig'; // Corrected import path
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface Step2EmocionesProps {
  emotionsList: string[];
  emotionHierarchy: EmotionHierarchy;
  selectedEmotions: string[];
  onEmotionSelect: (emotion: string) => void;
  selectedSubEmotions: SelectedSubEmotions;
  onSubEmotionSelect: (parentEmotion: string, subEmotion: string) => void;
  otherEmotions: OtherEmotions;
  onCustomEmotionChange: (parentEmotion: string, customEmotion: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClearAll: () => void;
}

export const Step2Emociones: React.FC<Step2EmocionesProps> = ({
  emotionsList,
  emotionHierarchy,
  selectedEmotions,
  onEmotionSelect,
  selectedSubEmotions,
  onSubEmotionSelect,
  otherEmotions,
  onCustomEmotionChange,
  onPrev,
  onNext,
  onClearAll,
}) => {
  return (
    <div id="step-content-2" className="space-y-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Paso 2: Identifica tus Emociones</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Selecciona la palabra o palabras que describen las emociones que sentías.
      </p>

      {/* Emociones Principales */}
      <fieldset className="mb-6 border-0 p-0 m-0"> {/* Contenedor cambiado a fieldset */}
        <legend className="text-base font-semibold mb-3 block leading-none"> {/* Label cambiada a legend */}
          Emociones Principales:
        </legend>
        <div className="flex flex-wrap gap-2">
          {emotionsList.map((emotion) => (
            <EmotionButton
              key={emotion}
              emotionName={emotion}
              isSelected={selectedEmotions.includes(emotion)}
              onClick={() => onEmotionSelect(emotion)}
            />
          ))}
        </div>
        </fieldset>

      {/* Sección de Sub-emociones / "Otra(s)" */}
      {selectedEmotions.length > 0 && (
       <fieldset className="space-y-4 border-0 p-0 m-0"> {/* Contenedor cambiado a fieldset */}
       <legend className="text-base font-semibold mb-1 block leading-none"> {/* Label cambiada a legend */}
         Emociones Específicas (Opcional):
       </legend>
       {selectedEmotions.map((selectedEmotion) => (
         <fieldset key={selectedEmotion} className="p-4 border rounded-lg bg-card shadow-sm m-0"> {/* Cada grupo de sub-emociones es un fieldset */}
           <legend className="font-medium mb-3 text-primary leading-none">{selectedEmotion}</legend> {/* El nombre de la emoción principal es la legend */}
           <div className="flex flex-wrap gap-2">
                {emotionHierarchy[selectedEmotion]?.length > 0 ? (
                  emotionHierarchy[selectedEmotion].map((subEmotion) => (
                    <EmotionButton
                      key={subEmotion} // Key is fine here
                      emotionName={subEmotion}
                      isSelected={selectedSubEmotions[selectedEmotion]?.includes(subEmotion)}
                      onClick={() => onSubEmotionSelect(selectedEmotion, subEmotion)}
                      size="sm"
                    />
                  ))
                ) : (
                  <div className="w-full">
                    {selectedEmotion === "Otra(s)" ? (
                      <Input
                      id={`other-emotion-input-${selectedEmotion}`} // ID para el input
                        type="text"
                        placeholder="Especifica otra emoción..."
                        className="max-w-xs h-9 text-sm"
                        value={otherEmotions[selectedEmotion] || ""}
                        onChange={(e) => onCustomEmotionChange(selectedEmotion, e.target.value)}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No hay sub-emociones predefinidas para "{selectedEmotion}".</p>
                    )}
                  </div>
                )}
              </div>
              </fieldset>
          ))}
        </fieldset>
      )}

      {/* Botones de Navegación Paso 2 */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" onClick={onPrev} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        <Button type="button" onClick={onNext} disabled={selectedEmotions.length === 0}>
          Siguiente <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        {selectedEmotions.length > 0 && (
          <Button type="button" variant="ghost" onClick={onClearAll} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <RotateCcw className="mr-2 h-4 w-4" /> Limpiar Selección
          </Button>
        )}
      </div>
    </div>
  );
};