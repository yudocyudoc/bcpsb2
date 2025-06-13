// src/components/mood/stepper-parts/PreviousEntriesAccordion.tsx
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { MoodEntry } from '@/types/mood'; // Tu tipo MoodEntry actualizado
import { CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviousEntriesAccordionProps {
  entries: MoodEntry[];
  isLoading: boolean;
  // Las siguientes props son para paginación, que simplificamos por ahora
  // Si las necesitas más adelante, las podemos reintroducir con la lógica de IDB
  onLoadMore?: () => Promise<void>; 
  hasMore?: boolean;              
  isLoadingMore?: boolean;        
}

const LoadingEntrySkeleton: React.FC = () => (
  <div className="border rounded-lg bg-card shadow-sm overflow-hidden p-4 space-y-2">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-3 w-5/6 mt-2" />
    <Skeleton className="h-3 w-4/6" />
  </div>
);

export const PreviousEntriesAccordion: React.FC<PreviousEntriesAccordionProps> = ({
  entries,
  isLoading,
  onLoadMore, // Puede ser undefined si no se usa
  hasMore,     // Puede ser undefined
  isLoadingMore, // Puede ser undefined
}) => {
  if (isLoading) {
    return (
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Registros anteriores</h2>
        <div className="space-y-3">
          <LoadingEntrySkeleton />
          <LoadingEntrySkeleton />
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Registros anteriores</h2>
        <p className="text-muted-foreground italic">Aún no tienes registros guardados.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Registros anteriores</h2>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {entries.map((entry) => (
          // Usar localId que siempre existirá y es único para la key de React
          <AccordionItem key={entry.localId} value={entry.localId} className="border rounded-lg bg-card shadow-sm overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-left hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">
                  {entry.suceso || <span className="italic text-muted-foreground">Suceso no descrito</span>}
                </p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5 opacity-80" />
                  {/* Usar createdAtClient (timestamp numérico) o createdAtServer (string ISO) */}
                  {entry.createdAtServer 
                    ? new Date(entry.createdAtServer).toLocaleString('es-ES', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : entry.createdAtClient 
                      ? new Date(entry.createdAtClient).toLocaleString('es-ES', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : 'Fecha inválida'}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0 text-sm">
              <div className="space-y-2 mt-2 border-t border-border/60 pt-3">
                {entry.suceso && entry.suceso.length > 80 && (
                    <p className="mb-2"><strong>Suceso:</strong> {entry.suceso}</p>
                )}
                 {entry.selectedContexts && entry.selectedContexts.length > 0 && (
                  <p><strong>Contextos:</strong> <span className="text-muted-foreground">{entry.selectedContexts.join(', ')}</span></p>
                )}
                <div>
                  <strong>Emociones e Intensidad:</strong>
                  {/* Usar 'emocionesPrincipales' de la interfaz MoodEntry */}
                  {entry.emocionesPrincipales && entry.emocionesPrincipales.length > 0 ? (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-muted-foreground">
                      {/* Tipar 'emotion' explícitamente como string si TypeScript no lo infiere bien del map */}
                      {entry.emocionesPrincipales.map((emotion: string) => {
                        // Usar 'otrasEmocionesCustom'
                        const emotionDisplayName = (emotion === "Otra(s)" && entry.otrasEmocionesCustom && entry.otrasEmocionesCustom[emotion]?.trim()) 
                                                    ? entry.otrasEmocionesCustom[emotion].trim() 
                                                    : emotion;
                        const intensityKey = emotionDisplayName;
                        return (
                          // Usar localId para la key interna del <li>
                          <li key={`prev-${entry.localId}-emo-${emotion}`}>
                            {emotionDisplayName} - <span className="font-medium text-foreground">{entry.intensidades && entry.intensidades[intensityKey] !== undefined ? `${entry.intensidades[intensityKey]}%` : 'N/A'}</span>
                            
                            {/* Usar 'subEmociones' */}
                            {emotion !== "Otra(s)" && entry.subEmociones && entry.subEmociones[emotion]?.length > 0 && (
                              <ul className="list-circle pl-5 text-xs">
                                {entry.subEmociones[emotion].map((sub: string) => (
                                  // Usar localId para la key interna del <li>
                                  <li key={`prev-${entry.localId}-sub-${sub}`}>{sub} - {entry.intensidades && entry.intensidades[sub] !== undefined ? `${entry.intensidades[sub]}%` : 'N/A'}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="italic text-muted-foreground text-xs">Sin emociones principales registradas.</p>
                  )}
                </div>
                {/* Usar 'pensamientosAutomaticos' y 'creenciasSubyacentes' */}
                {entry.pensamientosAutomaticos && <p><strong>Pensamientos:</strong> <span className="text-muted-foreground">{entry.pensamientosAutomaticos}</span></p>}
                {entry.creenciasSubyacentes && <p><strong>Creencias:</strong> <span className="text-muted-foreground">{entry.creenciasSubyacentes}</span></p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* El botón "Cargar más" solo se muestra si onLoadMore y hasMore son provistos y true */}
      {onLoadMore && hasMore && (
        <div className="mt-6 text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore || false} // isLoadingMore puede ser undefined
            variant="outline"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más registros"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};