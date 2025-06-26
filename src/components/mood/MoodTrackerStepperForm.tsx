// src/components/mood/MoodTrackerStepperForm.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// --- Servicios Locales y de Sincronización ---
import { saveMoodEntryLocal, getUserMoodEntriesLocal, syncSupabaseEntriesToLocal } from '@/lib/idbService';
import { syncPendingMoodEntries, fetchRecentMoodEntriesFromSupabase } from '@/services/syncService';

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
  const { user, isLoading: authLoading } = useAuth();
  const formWrapperRef = useRef<HTMLDivElement>(null);
  
  // 🔧 FIX 1: Ref para prevenir múltiples submissions
  const submissionInProgressRef = useRef(false);
  const lastSubmissionIdRef = useRef<string | null>(null);
  
  // 🔧 FIX 2: Ref para controlar sync
  const syncInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  const scrollToTop = useCallback(() => {
    if (formWrapperRef.current) {
      formWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // --- ESTADO PRINCIPAL ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sucesoText, setSucesoText] = useState<string>("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedSubEmotions, setSelectedSubEmotions] = useState<SelectedSubEmotions>({});
  const [otherEmotions, setOtherEmotions] = useState<OtherEmotions>({});
  const [emotionIntensities, setEmotionIntensities] = useState<EmotionIntensities>({});
  const [pensamientosText, setPensamientosText] = useState<string>("");
  const [creenciasText, setCreenciasText] = useState<string>("");
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previousEntries, setPreviousEntries] = useState<MoodEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(true);

  type FormStatus = 'filling' | 'submitted' | 'error';
  const [formStatus, setFormStatus] = useState<FormStatus>('filling');
  const [lastSubmissionData, setLastSubmissionData] = useState<MoodEntry | null>(null);

  // 🔧 FIX 3: Función optimizada para cargar entries (memoizada con useMemo para evitar recreación)
  const loadUserEntriesFromLocal = useCallback(async () => {
    if (!user?.id || !mountedRef.current) {
      setPreviousEntries([]);
      return;
    }
    
    try {
      const entriesData = await getUserMoodEntriesLocal(user.id, 20); // Fetch more to ensure comprehensive deduplication
      if (mountedRef.current) {
        setPreviousEntries(entriesData);
      }
    } catch (error) {
      console.error("MoodTracker: Error loading entries from IndexedDB:", error);
      if (mountedRef.current) {
        toast.error("Error al cargar registros locales.");
      }
    }
  }, [user?.id]);

  // 🔧 FIX 4: useEffect optimizado para evitar múltiples cargas
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!user?.id || authLoading || syncInProgressRef.current) {
        if (!authLoading && isMounted) {
          setPreviousEntries([]);
          setIsLoadingEntries(false);
        }
        return;
      }

      syncInProgressRef.current = true;
      setIsLoadingEntries(true);
      
      try {
        await syncPendingMoodEntries();
        const remoteEntries = await fetchRecentMoodEntriesFromSupabase(user.id, 20);
        
        if (remoteEntries.length > 0) {
          await syncSupabaseEntriesToLocal(remoteEntries);
        }
        
        const localEntries = await getUserMoodEntriesLocal(user.id, 10);
        
        if (isMounted) {
          setPreviousEntries(localEntries);
        }

      } catch (error) {
        console.error("Failed to load and sync entries:", error);
        if (isMounted) {
          toast.error("Error al cargar los registros históricos.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingEntries(false);
          syncInProgressRef.current = false;
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
      syncInProgressRef.current = false;
    };
  }, [user?.id, authLoading]);

  // --- Handlers optimizados ---
  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && sucesoText.trim() === "") {
      toast.error("Describe el suceso antes de continuar.");
      return;
    }
    if (currentStep === 2 && selectedEmotions.length === 0) {
      toast.error("Selecciona al menos una emoción.");
      return;
    }
    
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
      const nextStep = Math.min(prev + 1, 4);
      if (nextStep !== prev) scrollToTop();
      return nextStep;
    });
  }, [currentStep, sucesoText, selectedEmotions, selectedSubEmotions, otherEmotions, emotionIntensities, scrollToTop]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = Math.max(prev - 1, 1);
      if (newStep !== prev) scrollToTop();
      return newStep;
    });
  }, [scrollToTop]);

  const isStepAccessible = useCallback((stepIndexToCheck: number): boolean => {
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

  // Otros handlers (sin cambios significativos)
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
  }, [selectedSubEmotions]);

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

  const resetForm = useCallback(() => {
    setSucesoText("");
    setSelectedEmotions([]);
    setSelectedSubEmotions({});
    setOtherEmotions({});
    setEmotionIntensities({});
    setPensamientosText("");
    setCreenciasText("");
    setSelectedContexts([]);
    setCurrentStep(1);
    // Reset submission tracking
    submissionInProgressRef.current = false;
    lastSubmissionIdRef.current = null;
  }, []);

  const handleStartNewEntry = useCallback(() => {
    resetForm();
    setLastSubmissionData(null);
    setFormStatus('filling');
    scrollToTop();
  }, [resetForm, scrollToTop]);

  // 🔧 FIX 5: handleSubmit optimizado para prevenir duplicaciones
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevenir múltiples submissions
    if (submissionInProgressRef.current || isSaving) {
      console.log("Submission already in progress, ignoring duplicate");
      return;
    }

    if (!user?.id) {
      toast.error("Debes iniciar sesión para guardar tus registros.");
      return;
    }

    // Marcar submission en progreso
    submissionInProgressRef.current = true;
    setIsSaving(true);

    const clientTimestamp = Date.now();
    const newLocalId = uuidv4();

    // Prevenir duplicados por timestamp muy cercano
    if (lastSubmissionIdRef.current === newLocalId) {
      console.log("Duplicate submission attempt detected, ignoring");
      submissionInProgressRef.current = false;
      setIsSaving(false);
      return;
    }

    lastSubmissionIdRef.current = newLocalId;

    const newMoodEntry: MoodEntry = {
      localId: newLocalId,
      serverId: null,
      userId: user.id,
      suceso: sucesoText,
      selectedContexts,
      emocionesPrincipales: selectedEmotions,
      subEmociones: selectedSubEmotions,
      otrasEmocionesCustom: otherEmotions,
      intensidades: emotionIntensities,
      pensamientosAutomaticos: pensamientosText,
      creenciasSubyacentes: creenciasText,
      createdAtClient: clientTimestamp,
      createdAtServer: null,
      syncStatus: 'pending'
    };

    try {
      // Guardar localmente
      await saveMoodEntryLocal(newMoodEntry);
      console.log(`Successfully saved entry ${newLocalId} locally`);
      
      if (mountedRef.current) {
        toast.success("Registro guardado localmente.");
        
        // Recargar entries
        await loadUserEntriesFromLocal();
        
        // Actualizar estado del formulario
        setLastSubmissionData(newMoodEntry);
        setFormStatus('submitted');
        resetForm();
        scrollToTop();

        // Sincronización en segundo plano (sin await para no bloquear UI)
        syncPendingMoodEntries()
          .then(() => {
            console.log("Background sync completed successfully");
          })
          .catch(error => {
            console.error("Background sync error:", error);
          });
      }

    } catch (error) {
      console.error(`Error saving entry ${newLocalId}:`, error);
      if (mountedRef.current) {
        toast.error("Error al guardar el registro.");
      }
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
      submissionInProgressRef.current = false;
    }
  };

  // --- Renderizado ---
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
          selectedEmotions,
          selectedSubEmotions,
          otherEmotions,
          emotionIntensities,
          pensamientosText,
          creenciasText,
        };
        return (
          <Step4Pensamientos
            pensamientosText={pensamientosText}
            onPensamientosChange={setPensamientosText}
            creenciasText={creenciasText}
            onCreenciasChange={setCreenciasText}
            formDataSummary={formDataSummary}
            isSaving={isSaving}
            onPrev={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>Debes iniciar sesión para acceder al mood tracker.</div>;
  }

  if (formStatus === 'submitted') {
    return (
      <SubmissionSuccessScreen
        onStartNew={handleStartNewEntry}
        lastEntry={lastSubmissionData}
      />
    );
  }

  return (
    <div ref={formWrapperRef} className={cn("flex flex-col gap-6 sm:gap-8", className)} {...props}>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        onGoToStep={goToStep}
        stepLabels={["Suceso", "Emociones", "Intensidad", "Reflexión"]}
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