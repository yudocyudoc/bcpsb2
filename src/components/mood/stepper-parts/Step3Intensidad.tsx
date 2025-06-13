// src/components/mood/stepper-parts/Step3Intensidad.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Slidermob from '@/components/ui/slidermob';
import type { SelectedSubEmotions, OtherEmotions, EmotionIntensities } from '@/types/mood'; // O '@/types/mood'
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Step3IntensidadProps {
  selectedEmotions: string[];
  selectedSubEmotions: SelectedSubEmotions;
  otherEmotions: OtherEmotions;
  emotionIntensities: EmotionIntensities;
  onIntensityChange: (emotion: string, value: number) => void;
  onPrev: () => void;
  onNext: () => void;
}



export const Step3Intensidad: React.FC<Step3IntensidadProps> = ({
  selectedEmotions,
  selectedSubEmotions,
  otherEmotions,
  emotionIntensities,
  onIntensityChange,
  onPrev,
  onNext,
}) => {
  
  
  // Crear una lista única de todas las emociones que necesitan un slider
  const allUniqueEmotionsForSliders: string[] = [];
  selectedEmotions.forEach(mainEmotion => {
      // Añadir emoción principal
      allUniqueEmotionsForSliders.push(mainEmotion);
      // Añadir sub-emociones
      if (selectedSubEmotions[mainEmotion]) {
          selectedSubEmotions[mainEmotion].forEach(sub => {
              if (!allUniqueEmotionsForSliders.includes(sub)) {
                  allUniqueEmotionsForSliders.push(sub);
              }
          });
      }
      // Añadir "Otra(s)" personalizada si existe Y si la emoción principal es "Otra(s)"
      if (mainEmotion === "Otra(s)" && otherEmotions[mainEmotion]?.trim()) {
          const customName = otherEmotions[mainEmotion].trim();
          if (!allUniqueEmotionsForSliders.includes(customName)) {
              allUniqueEmotionsForSliders.push(customName);
          }
          // Opcional: quitar "Otra(s)" genérico si ya tenemos el nombre personalizado
          const genericOtherIndex = allUniqueEmotionsForSliders.indexOf("Otra(s)");
          if (genericOtherIndex > -1 && customName !== "Otra(s)") {
              allUniqueEmotionsForSliders.splice(genericOtherIndex, 1);
          }
      }
  });


  if (allUniqueEmotionsForSliders.length === 0) {
    return (
      <div className="animate-fade-in text-center p-6">
        <p className="text-muted-foreground">No hay emociones seleccionadas para calificar.</p>
        <Button type="button" variant="outline" onClick={onPrev} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Emociones
        </Button>
      </div>
    );
  }

  return (
    <div id="step-content-3" className="space-y-4 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Paso 3: Nivel de Intensidad</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Califica cada sentimiento en una escala del 0% (nada) al 100% (extremadamente).
      </p>

      <div className="grid gap-6 md:gap-8"> {/* Más espacio vertical */}
        {allUniqueEmotionsForSliders.map(emotionKey => {
          const intensity = emotionIntensities[emotionKey] ?? 50;
          return (
            <div key={`intensity-group-${emotionKey}`} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-4 gap-y-1">
                <Label htmlFor={`intensity-${emotionKey}`} className="font-medium text-sm sm:text-base shrink-0">
                  {emotionKey}:
                </Label>
                <span className="text-primary font-semibold text-sm sm:text-base w-12 text-right shrink-0">{intensity}%</span>
              </div>
              <Slidermob
                id={`intensity-${emotionKey}`}
                value={intensity}
                min={0} max={100} step={1}
                onValueChange={(value) => onIntensityChange(emotionKey, value)}
                className="w-full" // Slider toma todo el ancho disponible
                aria-label={`Intensidad de ${emotionKey}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-4 sm:pt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Siguiente <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};