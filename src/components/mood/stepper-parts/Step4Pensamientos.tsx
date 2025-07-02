// src/components/mood/stepper-parts/Step4Pensamientos.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectedSubEmotions, OtherEmotions, EmotionIntensities } from '@/types/mood';
import { ArrowLeft, Save } from 'lucide-react';

import { getDurationLabel } from '@/config/durationConfig';


interface FormDataSummary {
  sucesoText: string;
  selectedEmotions: string[];
  selectedSubEmotions: SelectedSubEmotions;
  otherEmotions: OtherEmotions;
  emotionIntensities: EmotionIntensities;
  duracion: string;
  showIndividualDurations: boolean;
  individualDurations: Record<string, string>;
  pensamientosText: string; // Incluir pensamientos y creencias en el resumen
  creenciasText: string;
}

interface Step4PensamientosProps {
  pensamientosText: string;
  onPensamientosChange: (value: string) => void;
  creenciasText: string;
  onCreenciasChange: (value: string) => void;
  formDataSummary: FormDataSummary; // Recibe todos los datos para el resumen
  isSaving: boolean;
  onPrev: () => void;
  // El onSubmit se maneja en el <form> principal en MoodTrackerStepperForm
}

export const Step4Pensamientos: React.FC<Step4PensamientosProps> = ({
  pensamientosText,
  onPensamientosChange,
  creenciasText,
  onCreenciasChange,
  formDataSummary,
  isSaving,
  onPrev,
}) => {
  const {
    sucesoText,
    selectedEmotions,
    selectedSubEmotions,
    otherEmotions,
    emotionIntensities,
    showIndividualDurations,
    individualDurations,
    // pensamientosText y creenciasText ya los tenemos como props directos
  } = formDataSummary;

  return (
    <div id="step-content-4" className="space-y-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Paso 4: Reflexiona y Guarda</h2>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="pensamientos-text" className="text-sm sm:text-base">
            Escribe los pensamientos automáticos que tuviste durante el suceso:
          </Label>
          <Textarea
            id="pensamientos-text"
            placeholder="¿Qué pasaba por tu mente en ese momento?"
            value={pensamientosText}
            onChange={(e) => onPensamientosChange(e.target.value)}
            rows={4}
            className="resize-y min-h-[100px]"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="creencias-text" className="text-sm sm:text-base">
            ¿Qué creencias subyacentes podrían estar relacionadas con esos pensamientos?
          </Label>
          <Textarea
            id="creencias-text"
            placeholder="Ej: 'No soy suficiente', 'Siempre me pasa lo mismo', 'El mundo es peligroso'..."
            value={creenciasText}
            onChange={(e) => onCreenciasChange(e.target.value)}
            rows={4}
            className="resize-y min-h-[100px]"
          />
        </div>

        {/* Resumen Final */}
        <Card className="mt-2 bg-muted/30">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base sm:text-lg">Resumen de tu Registro:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm pb-4">

            <p>
              <strong>Suceso:</strong> {sucesoText || <span className="italic text-muted-foreground">No descrito</span>}
            </p>
            {formDataSummary.duracion && (
              <p>
                <strong>Duración:</strong> <span className="text-muted-foreground">{getDurationLabel(formDataSummary.duracion)}</span>
              </p>
            )}
            <div>
              <strong>Emociones e Intensidad:</strong>

              {selectedEmotions.length > 0 ? (
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-0.5">
                  {selectedEmotions.map(emotion => {
                    // Determinar el nombre final de la emoción para mostrar
                    const emotionDisplayName = (emotion === "Otra(s)" && otherEmotions[emotion]?.trim())
                      ? otherEmotions[emotion].trim()
                      : emotion;
                    const intensityKey = emotionDisplayName; // Usar el nombre final para buscar intensidad

                    return (
                      <li key={`summary-${emotion}`}>
                        {emotionDisplayName} - <span className="font-medium text-foreground">{emotionIntensities[intensityKey] ?? 50}%</span>
                        {/* Mostrar duración individual si existe */}
                        {showIndividualDurations && individualDurations[emotionDisplayName] && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({getDurationLabel(individualDurations[emotionDisplayName])})
                          </span>
                        )}

                        {/* Sub-emociones (solo si la emoción principal NO es "Otra(s)" o si "Otra(s)" tiene sub-emociones predefinidas) */}
                        {emotion !== "Otra(s)" && selectedSubEmotions[emotion]?.length > 0 && (
                          <ul className="list-circle pl-5 text-xs">
                            {selectedSubEmotions[emotion].map(subEmotion => (
                              <li key={`summary-sub-${subEmotion}`}>
                                {subEmotion} - <span className="font-medium text-foreground">{emotionIntensities[subEmotion] ?? 50}%</span>
                                {/* Agregar duración individual para sub-emoción */}
                                {showIndividualDurations && individualDurations[subEmotion] && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({getDurationLabel(individualDurations[subEmotion])})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="italic text-muted-foreground">No se seleccionaron emociones.</p>
              )}
            </div>
            {pensamientosText && <p><strong>Pensamientos:</strong> <span className="text-muted-foreground">{pensamientosText}</span></p>}
            {creenciasText && <p><strong>Creencias:</strong> <span className="text-muted-foreground">{creenciasText}</span></p>}
          </CardContent>
        </Card>

        {/* Botones de Navegación Paso 4 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onPrev} disabled={isSaving}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <Button type="submit" disabled={isSaving} className="min-w-[150px]"> {/* El form principal maneja el onSubmit */}
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar Estado de Ánimo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};