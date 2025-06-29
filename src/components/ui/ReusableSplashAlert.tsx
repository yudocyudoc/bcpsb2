// src/components/ui/ReusableSplashAlert.tsx

import React from 'react';
import type { ReactNode } from 'react';
import type { SVGProps } from 'react';
import { Button } from "@/components/ui/button";
import { X as IconX } from "lucide-react"; // Renombrar X para evitar conflicto
import { cn } from "@/lib/utils";

interface ReusableSplashAlertProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  description: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  imageClassName?: string;
  actionButtonText?: string;
  onAction?: () => void;
  IconComponent?: React.ComponentType<SVGProps<SVGSVGElement>>; // Icono en lugar de imagen
  alertClassName?: string;
}

export const ReusableSplashAlert: React.FC<ReusableSplashAlertProps> = ({
  isOpen,
  onDismiss,
  title,
  description,
  imageUrl,
  imageAlt = "Ilustración",
  imageClassName,
  actionButtonText,
  onAction,
  alertClassName,
  IconComponent,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onDismiss(); // Por defecto, la acción también descarta el alert
  };

  return (
    // Contenedor principal del Splash/Onboarding
    <div
      className={cn(
        "mb-6 sm:mb-8 relative p-4 md:p-6 rounded-lg shadow-lg overflow-hidden",
        "border border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/40 dark:via-sky-900/40 dark:to-indigo-900/40",
        "max-w-2xl w-full mx-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", // Animación de entrada
        alertClassName // Clases personalizadas
      )}
      role="alertdialog" // Para accesibilidad, ya que es un mensaje importante
      aria-labelledby="splash-alert-title"
      aria-describedby="splash-alert-description"
    >
      {/* Botón de Cierre 'X' */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="absolute top-2 right-2 h-8 w-8 p-0 text-blue-600 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:bg-blue-800/50 rounded-full z-10"
        aria-label="Cerrar mensaje"
      >
        <IconX className="h-5 w-5" />
      </Button>

      {/* Layout interno: Flex vertical por defecto, cambia a horizontal en desktop (md:) */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
        
        {/* Columna de Texto */}
        <div className="w-full md:flex-1 order-2 md:order-1 text-center md:text-left"> {/* Texto primero en móvil (order-2), luego imagen */}
          <h2 id="splash-alert-title" className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-200 mb-2">
            {title}
          </h2>
          <div id="splash-alert-description" className="text-sm sm:text-base text-blue-600 dark:text-blue-300 leading-relaxed">
            {description}
          </div>

          {actionButtonText && onAction && (
            <Button
              onClick={handleAction}
              className="mt-4 md:mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm sm:text-base"
            >
              {actionButtonText}
            </Button>
          )}
        </div>

        {/* Columna de Imagen o Icono */}
        {(imageUrl || IconComponent) && (
          <div className="w-full md:w-auto flex justify-center order-1 md:order-2 md:flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className={cn(
                  "object-contain",
                  // Tamaños responsivos, más grande en móvil cuando está arriba
                  "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48", 
                  imageClassName
                )}
              />
            ) : IconComponent ? (
              <IconComponent className={cn(
                  "text-blue-500 dark:text-blue-400", 
                  "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
                  imageClassName
                  )} 
                  aria-hidden="true"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};