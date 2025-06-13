// src/pages/MoodTrackerPage.tsx
import React, { useState, useEffect } from 'react';
import { MoodTrackerStepperForm } from '@/components/mood/MoodTrackerStepperForm'; // Asegúrate que la ruta sea correcta
import { ReusableSplashAlert } from '@/components/ui/ReusableSplashAlert';     // Asegúrate que la ruta sea correcta
// import { Lightbulb } from "lucide-react"; // Si quieres usar un icono por defecto para el Splash
import diarioImageSrc from '@/assets/imgs/diario.webp'; // <-- IMPORTA LA IMAGEN AQUÍ


const MoodTrackerPage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Comprobar si el usuario ya ha descartado la introducción
    // Usar una clave específica y versionada para localStorage es una buena práctica
    const introDismissed = localStorage.getItem('moodTrackerIntroDismissed_v1');
    if (introDismissed === 'true') {
      setShowIntro(false);
    }
  }, []);

  const dismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem('moodTrackerIntroDismissed_v1', 'true');
  };

  const pageTitle = "Registro de Estado de Ánimo";
  const introTitle = "¡Hola! Bienvenido/a"; // Más inclusivo
  const introDescription = (
    <>
      Este espacio es para ti. Reflexiona sobre tus emociones y 
      pensamientos para un mayor autoconocimiento y bienestar.
      <br className="hidden sm:block" />
      ¡Empecemos!
    </>
  );
  
  // Descripción para el header cuando el splash ya no está visible
  const headerDescription = "Reflexiona sobre tus emociones y pensamientos para un mayor autoconocimiento y bienestar.";


  return (
    // Ya NO se incluye <DashboardLayout> aquí
    // El div principal de la página
    <div className="container mx-auto py-4 px-2 sm:px-4 md:py-8">
      
      <ReusableSplashAlert
        isOpen={showIntro}
        onDismiss={dismissIntro}
        title={introTitle}
        description={introDescription}
        imageUrl={diarioImageSrc} 
        imageAlt="Ilustración de persona escribiendo en un diario y reflexionando"
        actionButtonText="Entendido"
         onAction={dismissIntro} // Podrías hacer que el botón de acción también descarte el splash
      />

      {/* Header de la página, se muestra si el splash está cerrado */}
      {!showIntro && (
          <header className="mb-6 sm:mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {pageTitle}
              </h1>
              {/* Muestra la descripción solo en pantallas más grandes o siempre si prefieres */}
              <p className="mt-2 text-md text-muted-foreground max-w-2xl mx-auto">
                {headerDescription}
              </p>
          </header>
      )}
      
      {/* Contenedor principal del formulario, se muestra siempre o solo si !showIntro */}
      {/* Si quieres que el formulario solo aparezca después de descartar el splash: */}
      {!showIntro && (
        <main className="mt-4"> {/* O ajusta el margen si es necesario */}
          <div className="max-w-3xl mx-auto"> {/* Ajustado max-w para consistencia */}
            <MoodTrackerStepperForm />
          </div>
        </main>
      )}
      {/* Si quieres que el formulario sea visible incluso con el splash (detrás, quizás):
      <main className={showIntro ? "mt-4 opacity-50 pointer-events-none" : ""}> 
        <div className="max-w-3xl mx-auto">
          <MoodTrackerStepperForm />
        </div>
      </main>
      */}
    </div>
  );
};

export default MoodTrackerPage;