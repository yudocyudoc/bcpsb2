// src/components/mood/stepper-parts/StepIndicator.tsx
import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onGoToStep: (step: number) => void;
  stepLabels: string[]; // Los usaremos para el tooltip
  isStepAccessible?: (stepIndex: number) => boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  onGoToStep,
  stepLabels,
  isStepAccessible,
}) => {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center justify-center px-4 sm:px-6 py-1 space-x-2 sm:space-x-4 mb-6 sm:mb-8"> {/* Añadido py-1 para espacio vertical extra */}
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => {
          const accessible = isStepAccessible ? isStepAccessible(index) : true;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    role="tab"
                    aria-selected={isActive}
                    id={`step-indicator-${step}`}
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Añadido relative
                      isActive
                      ? "bg-primary border-primary text-primary-foreground scale-115 shadow-lg z-10" // Paso actual, scale a 115, añadido z-10
                      : isCompleted // Asegurarse que los otros estados no tengan z-index conflictivo si no es necesario
                      ? "bg-green-500 border-green-500 text-white hover:bg-green-600" // Completado
                        : accessible
                        ? "bg-muted border-border hover:border-primary/50" // Pendiente accesible
                        : "bg-muted border-border text-muted-foreground opacity-60 cursor-not-allowed", // Pendiente no accesible
                      accessible && !isActive ? "cursor-pointer" : ""
                    )}
                    onClick={() => accessible && onGoToStep(step)}
                    disabled={!accessible}
                  >
                    {isCompleted && !isActive ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <span className="text-xs sm:text-sm font-medium">{step}</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stepLabels[index] || `Paso ${step}`}</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Línea conectora (excepto para el último) */}
              {index < totalSteps - 1 && (
                <div className={cn(
                    "flex-1 h-0.5", // O h-1
                    (isCompleted || isActive) ? "bg-primary" : "bg-border" // La línea se colorea si el paso actual o anterior está activo/completo
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </TooltipProvider>
  );
};