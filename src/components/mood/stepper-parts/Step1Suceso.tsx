// src/components/mood/stepper-parts/Step1Suceso.tsx
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge'; // Para los tags
import { ArrowRight } from 'lucide-react';
//import { cn } from '@/lib/utils';

const contextosSugeridos = ["Trabajo", "Hogar", "Estudio", "Social", "Pareja", "Familia", "Transporte", "Ejercicio", "Salud", "Otro"];

interface Step1SucesoProps {
  sucesoText: string;
  onSucesoChange: (value: string) => void;
  selectedContexts: string[]; // NUEVO PROP
  onContextToggle: (context: string) => void; // NUEVO PROP
  onNext: () => void;
}

export const Step1Suceso: React.FC<Step1SucesoProps> = ({
  sucesoText,
  onSucesoChange,
  selectedContexts, // RECIBIR
  onContextToggle,  // RECIBIR
  onNext,
}) => {
  return (
    <div id="step-content-1" className="space-y-6 animate-fade-in"> {/* Aumentar space-y */}
    <h2 className="text-xl sm:text-2xl font-bold mb-2">Paso 1: Describe el Suceso</h2>
    
    {/* Textarea para el suceso */}
        <div className="grid gap-2">
          <Label htmlFor="suceso-text" className="text-sm sm:text-base">
            Escribe qué sucedió o la situación adversa que viviste:
          </Label>
          <Textarea
            id="suceso-text"
            placeholder="Describe el suceso aquí..."
            required
            value={sucesoText}
            onChange={(e) => onSucesoChange(e.target.value)}
            rows={5} // Un poco más de espacio
            className="resize-y min-h-[100px]"
          />
        </div>

         {/* Selección de Contextos */}
         <fieldset className="space-y-2 border-0 p-0 m-0"> {/* Cambiado div a fieldset y reseteado estilos por defecto */}
        <legend className="text-sm sm:text-base font-medium leading-none"> {/* Cambiado Label a legend, aplicando estilos similares */}
           ¿En qué contexto ocurrió? (Opcional, selecciona los que apliquen)
           </legend>
           <div className="flex flex-wrap gap-2">
          {contextosSugeridos.map(contexto => (
            <Badge
              key={contexto}
              variant={selectedContexts.includes(contexto) ? "default" : "secondary"}
              onClick={() => onContextToggle(contexto)}
              className="cursor-pointer px-3 py-1 text-xs sm:text-sm transition-all hover:opacity-80"
              role="checkbox"
              aria-checked={selectedContexts.includes(contexto)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onContextToggle(contexto);}}
            >
              {contexto}
            </Badge>
          ))}
        </div>
        </fieldset>
        
        <Button
          type="button"
          onClick={onNext}
          disabled={!sucesoText.trim()}
          className="w-full sm:w-auto sm:ml-auto mt-2" // Añadir margen superior
        >
          Siguiente <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
    </div>
  );
};