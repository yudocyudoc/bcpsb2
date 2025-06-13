// src/components/mood/MoodTrackerStepperForm.tsx
import React, { useState, useCallback, useEffect, useRef } from "react"; // Añadir useRef
import type { FormEvent } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Para generar localId

// --- Servicios Locales y de Sincronización ---
import { saveMoodEntryLocal, getUserMoodEntriesLocal } from '@/lib/idbService'; // Ajusta la ruta
import { syncPendingMoodEntries } from '@/services/syncService'; // Ajusta la ruta

// --- Tipos ---
import type {
  MoodEntry,
  SelectedSubEmotions,
  OtherEmotions,
  EmotionIntensities,
} from '@/types/mood'; 

// --- Configuración de Emociones ---
import { emotionHierarchy, emotionsList } from '@/config/emotionConfig';

// --- Subcomponentes de Pasos ---
import { StepIndicator } from './stepper-parts/StepIndicator';
import { Step1Suceso } from './stepper-parts/Step1Suceso';
import { Step2Emociones } from './stepper-parts/Step2Emociones';
import { Step3Intensidad } from './stepper-parts/Step3Intensidad';
import { Step4Pensamientos } from './stepper-parts/Step4Pensamientos';
import { PreviousEntriesAccordion } from './stepper-parts/PreviousEntriesAccordion';
import { SubmissionSuccessScreen } from './stepper-parts/Step5SubmissionSuccess';

type MoodTrackerStepperFormProps = React.HTMLAttributes<HTMLDivElement>;

export function MoodTrackerStepperForm({ className, ...props }: MoodTrackerStepperFormProps) {
// En MoodTrackerStepperForm.tsx
    const { user, isLoading: authLoading } = useAuth(); // 'profile' eliminado si no se usa
    const formWrapperRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => { /* ... tu función scrollToTop ... */ }, []);

  // --- ESTADO PRINCIPAL (sin cambios en su definición inicial) ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sucesoText, setSucesoText] = useState<string>("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedSubEmotions, setSelectedSubEmotions] = useState<SelectedSubEmotions>({});
  const [otherEmotions, setOtherEmotions] = useState<OtherEmotions>({});
  const [emotionIntensities, setEmotionIntensities] = useState<EmotionIntensities>({});
  const [pensamientosText, setPensamientosText] = useState<string>("");
  const [creenciasText, setCreenciasText] = useState<string>("");
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState<boolean>(false); // Para el estado de guardado local + intento de sync  
  const [previousEntries, setPreviousEntries] = useState<MoodEntry[]>([]);  
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(true);

  // Ya no necesitamos lastVisibleEntry, hasMoreEntries, isLoadingMoreEntries para el fetch simple de IDB
  // La paginación de IDB la simplificamos en idbService.ts por ahora.

  type FormStatus = 'filling' | 'submitted' | 'error';
  const [formStatus, setFormStatus] = useState<FormStatus>('filling');
  const [lastSubmissionData, setLastSubmissionData] = useState<MoodEntry | null>(null); // Para la pantalla de éxito
  // weeklyEntryCount se podría calcular leyendo de IDB y filtrando por fecha si es necesario en la pantalla de éxito

  // --- Carga de Registros Previos desde IndexedDB ---
  const loadUserEntriesFromLocal = useCallback(async () => {
    if (user && !authLoading) {
      setIsLoadingEntries(true);
      try {
        const entriesData = await getUserMoodEntriesLocal(user.id, 5); // Cargar las últimas 5, por ejemplo
        setPreviousEntries(entriesData);
        // console.log("MoodTracker: Loaded local entries:", entriesData);
      } catch (error) {
        console.error("MoodTracker: Error loading entries from IndexedDB:", error);
        toast.error("Error al cargar registros locales.");
      } finally {
        setIsLoadingEntries(false);
      }
    } else if (!authLoading && !user) {
      setPreviousEntries([]);
      setIsLoadingEntries(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadUserEntriesFromLocal();
  }, [loadUserEntriesFromLocal]);


  // --- Handlers (handleNextStep, handlePrevStep, isStepAccessible, goToStep, context/emotion handlers sin cambios significativos) ---

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && sucesoText.trim() === "") {
      toast.error("Describe el suceso antes de continuar.");
      return;
    }
    if (currentStep === 2 && selectedEmotions.length === 0) {
      toast.error("Selecciona al menos una emoción.");
      return;
    }
    let nextStepResult = currentStep; // Para el log
    if (currentStep === 2) {
      const allEmotionsToRateSet = new Set<string>();
      selectedEmotions.forEach((emotion) => {
        allEmotionsToRateSet.add(emotion);
        if (selectedSubEmotions[emotion]) {
            selectedSubEmotions[emotion].forEach(sub => allEmotionsToRateSet.add(sub));
        }
        if (emotion === "Otra(s)" && otherEmotions[emotion]?.trim()) {
            allEmotionsToRateSet.add(otherEmotions[emotion].trim());
        }
      });
      const newIntensities = { ...emotionIntensities };
      allEmotionsToRateSet.forEach(emotionKey => {
          if (!(emotionKey in newIntensities)) newIntensities[emotionKey] = 50;
      });
      setEmotionIntensities(newIntensities);
    }
    setCurrentStep((prev) => {
      nextStepResult = Math.min(prev + 1, 4); // Total de 4 pasos antes del resumen/guardado
      if (nextStepResult !== prev) scrollToTop();
      return nextStepResult;
    });
  }, [currentStep, sucesoText, selectedEmotions, selectedSubEmotions, otherEmotions, emotionIntensities, scrollToTop]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = Math.max(prev - 1, 1);
      if (newStep !== prev) scrollToTop();
      return newStep;
    });
  }, [scrollToTop]); 
  
  const isStepAccessible = useCallback((stepIndexToCheck: number) : boolean => {
    const targetStep = stepIndexToCheck + 1;
    if (targetStep <= currentStep) return true;
    if (targetStep === 2 && !sucesoText.trim()) return false;
    if (targetStep === 3 && (selectedEmotions.length === 0 || !sucesoText.trim())) return false;
    if (targetStep === 4 && (selectedEmotions.length === 0 || !sucesoText.trim())) return false;
    return true;
  }, [currentStep, sucesoText, selectedEmotions]);

  const goToStep = useCallback((step: number) => {
    if (isStepAccessible(step - 1) && step !== currentStep) {
        if (currentStep === 2 && step === 3) {
             const allEmotionsToRateSet = new Set<string>();
             selectedEmotions.forEach((emotion) => {
                allEmotionsToRateSet.add(emotion);
                if (selectedSubEmotions[emotion]) {
                    selectedSubEmotions[emotion].forEach(sub => allEmotionsToRateSet.add(sub));
                }
                if (emotion === "Otra(s)" && otherEmotions[emotion]?.trim()) {
                    allEmotionsToRateSet.add(otherEmotions[emotion].trim());
                }
             });
             const newIntensities = { ...emotionIntensities };
             allEmotionsToRateSet.forEach(emotionKey => {
                 if (!(emotionKey in newIntensities)) newIntensities[emotionKey] = 50;
             });
             setEmotionIntensities(newIntensities);
        }
        scrollToTop();
        setCurrentStep(step);
      } else {
        if (step !== currentStep) toast.error("Completa los pasos anteriores primero.");
    }
  }, [currentStep, sucesoText, selectedEmotions, selectedSubEmotions, otherEmotions, emotionIntensities, isStepAccessible, scrollToTop]);

  const handleContextToggle = useCallback((context: string) => {
    setSelectedContexts((prev) =>
      prev.includes(context) ? prev.filter((c) => c !== context) : [...prev, context]
    );
  }, []);

  const handleEmotionSelect = useCallback((emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
    if (!selectedSubEmotions[emotion]) {
      setSelectedSubEmotions((prev) => ({ ...prev, [emotion]: [] }));
    }
  }, [selectedSubEmotions]); // Asegúrate que selectedSubEmotions esté en las dependencias

  const handleSubEmotionSelect = useCallback((parentEmotion: string, subEmotion: string) => {
    setSelectedSubEmotions((prev) => ({
      ...prev,
      [parentEmotion]: prev[parentEmotion]?.includes(subEmotion)
        ? prev[parentEmotion].filter((e) => e !== subEmotion)
        : [...(prev[parentEmotion] || []), subEmotion],
    }));
  }, []);

  const handleCustomEmotionChange = useCallback((parentEmotion: string, customEmotion: string) => {
    setOtherEmotions((prev) => ({ ...prev, [parentEmotion]: customEmotion }));
  }, []);

  const handleClearAllEmotions = useCallback(() => {
    setSelectedEmotions([]);
    setSelectedSubEmotions({});
    setOtherEmotions({});
  }, []);

  const handleIntensityChange = useCallback((emotionKey: string, value: number) => {
    setEmotionIntensities((prev) => ({ ...prev, [emotionKey]: value }));
  }, []);

  const resetForm = () => {
    setSucesoText(""); setSelectedEmotions([]); setSelectedSubEmotions({});
    setOtherEmotions({}); setEmotionIntensities({}); setPensamientosText("");
    setCreenciasText(""); setSelectedContexts([]); setCurrentStep(1);
    // No mostramos toast aquí, se puede mostrar después de un envío exitoso si se reinicia.
  };

  const handleStartNewEntry = useCallback(() => {
    resetForm();
    setLastSubmissionData(null);
    setFormStatus('filling');
    scrollToTop(); // Asegurar que el nuevo formulario esté visible desde arriba
  }, [resetForm, scrollToTop]);

  // --- handleSubmit Modificado para Offline-First ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para guardar tus registros.");
      return;
    }
    if (pensamientosText.trim() === "" && creenciasText.trim() === "") {
        toast.info("Considera añadir tus pensamientos o creencias para un registro más completo.", { duration: 4000 });
    }

    setIsSaving(true);
    const clientTimestamp = Date.now();
    const newLocalId = uuidv4(); // Generar ID único para IndexedDB

    const newMoodEntry: MoodEntry = {
      localId: newLocalId,
      serverId: null, // Aún no sincronizado
      userId: user.id,
      suceso: sucesoText,
      selectedContexts: selectedContexts,
      emocionesPrincipales: selectedEmotions, // Renombré en el tipo MoodEntry
      subEmociones: selectedSubEmotions,
      otrasEmocionesCustom: otherEmotions,    // Renombré en el tipo MoodEntry
      intensidades: emotionIntensities,
      pensamientosAutomaticos: pensamientosText, // Renombré en el tipo MoodEntry
      creenciasSubyacentes: creenciasText,    // Renombré en el tipo MoodEntry
      createdAtClient: clientTimestamp,
      createdAtServer: null,
      syncStatus: 'pending',
      // No es necesario lastSyncAttempt ni syncError al crear
    };

    try {
      await saveMoodEntryLocal(newMoodEntry); // Guardar en IndexedDB
      toast.success("Registro guardado localmente.");
      
      // Actualizar UI localmente
      setPreviousEntries(prev => [newMoodEntry, ...prev].sort((a,b) => b.createdAtClient - a.createdAtClient).slice(0,5)); // Mantener las 5 más recientes
      setLastSubmissionData(newMoodEntry); // Para la pantalla de éxito
      
      // Disparar sincronización en segundo plano (no esperar el resultado aquí para no bloquear UI)
      syncPendingMoodEntries().then(({ successCount, errorCount }) => {
        if (successCount > 0) {
          // Opcional: podrías querer recargar las entradas locales para reflejar el serverId y syncStatus 'synced'
          // o que el syncService emita un evento para que el store/componente se actualice.
          // Por ahora, la UI ya se actualizó con la entrada local.
          // console.log(`Background sync: ${successCount} entries synced.`);
          loadUserEntriesFromLocal(); // Recargar para obtener el serverId y estado synced
        }
        if (errorCount > 0) {
          // console.log(`Background sync: ${errorCount} entries failed to sync.`);
          // El usuario ya fue notificado por el syncService, o podrías notificar de nuevo.
        }
      }).catch(syncError => {
        console.error("Error during background sync trigger:", syncError);
        // No necesariamente un toast aquí, ya que syncPendingMoodEntries maneja sus propios toasts.
      });
      
      setFormStatus('submitted'); // Mostrar pantalla de éxito
      resetForm(); // Limpiar el formulario para la próxima entrada
      scrollToTop();

    } catch (error) {
      console.error("MoodTracker: Error saving entry locally:", error);
      toast.error("Error al guardar el registro localmente.");
      setFormStatus('error'); // Opcional: un estado de error para el formulario
    } finally {
      setIsSaving(false);
    }
  };  

  // --- Renderizado (RenderStepContent, etc. sin cambios en su lógica interna) ---
  const renderStepContent = (): React.ReactNode => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Suceso
            sucesoText={sucesoText}
            onSucesoChange={setSucesoText}
            selectedContexts={selectedContexts}
            onContextToggle={handleContextToggle}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <Step2Emociones
            emotionsList={emotionsList}
            emotionHierarchy={emotionHierarchy}
            selectedEmotions={selectedEmotions}
            onEmotionSelect={handleEmotionSelect}
            selectedSubEmotions={selectedSubEmotions}
            onSubEmotionSelect={handleSubEmotionSelect}
            otherEmotions={otherEmotions}
            onCustomEmotionChange={handleCustomEmotionChange}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onClearAll={handleClearAllEmotions}
          />
        );
      case 3:
        return (
          <Step3Intensidad
            selectedEmotions={selectedEmotions}
            selectedSubEmotions={selectedSubEmotions}
            otherEmotions={otherEmotions}
            emotionIntensities={emotionIntensities}
            onIntensityChange={handleIntensityChange}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        );
      case 4:
        const formDataSummary = {
          sucesoText,
          selectedContexts, // Esta propiedad no está en FormDataSummary, pero Step4Pensamientos no la usa directamente desde aquí
          selectedEmotions: selectedEmotions,     // Corregido: Nombre de propiedad
          selectedSubEmotions: selectedSubEmotions, // Corregido: Nombre de propiedad
          otherEmotions: otherEmotions,         // Corregido: Nombre de propiedad
          emotionIntensities: emotionIntensities, // Corregido: Nombre de propiedad
          pensamientosText: pensamientosText,     // Corregido: Nombre de propiedad
          creenciasText: creenciasText,         // Corregido: Nombre de propiedad
        };
        return (
          <Step4Pensamientos 
            pensamientosText={pensamientosText} onPensamientosChange={setPensamientosText} 
            creenciasText={creenciasText} onCreenciasChange={setCreenciasText} // Corregido: setCreenciasText
            formDataSummary={formDataSummary} isSaving={isSaving} onPrev={handlePrevStep} />
        );
      default:
        return null;
    }

  
  };
    if (authLoading) { /* ... */ }
  if (!user) { /* ... */ }
  if (formStatus === 'submitted') {
    // Podrías calcular weeklyEntryCount leyendo de previousEntries (que vienen de IDB)
    // y filtrando por fecha si necesitas mostrarlo en SubmissionSuccessScreen
    // const calculateWeeklyCount = () => { /* ... */ return 0; };
    return <SubmissionSuccessScreen onStartNew={handleStartNewEntry} lastEntry={lastSubmissionData} /* weeklyEntryCount={calculateWeeklyCount()} */ />;
  }

  return (
    <div ref={formWrapperRef} className={cn("flex flex-col gap-6 sm:gap-8", className)} {...props}> {/* Quitado overflow-y-auto si el scroll es de <main> */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        onGoToStep={goToStep}
        stepLabels={["Suceso", "Emociones", "Intensidad", "Reflexión"]} // Etiquetas más cortas
        isStepAccessible={isStepAccessible}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="step-content-wrapper p-4 sm:p-6 border rounded-lg bg-card shadow min-h-[280px] sm:min-h-[320px]">
          {renderStepContent()}
        </div>
        </form>      
        <PreviousEntriesAccordion
        entries={previousEntries}
        isLoading={isLoadingEntries}
        onLoadMore={async () => Promise.resolve()}
        hasMore={false}
        isLoadingMore={false}
      />
    </div>
  );
}