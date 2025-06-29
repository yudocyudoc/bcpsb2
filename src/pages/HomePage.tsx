// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator'; // Importa desde tu UI lib
//import { HomeWelcomeProfile } from '@/components/home/welcomeHeader';
import { getWelcomeArt } from '@/config/illustrations';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

import { Smile, HeartHandshake } from 'lucide-react';


export default function HomePage() {
  const { profile } = useAuth();
  const welcomeArt = getWelcomeArt();



  // Datos para los logros (los harás dinámicos después)
  const achievements = [
    { value: 18, label: "Días realizando tu registro" },
    { value: 12, label: "Actividades realizadas" }
  ];


  return (

    <div className="w-full mt-0 py-4 sm:py-6 md:py-8 2xl:py-12 flex flex-col items-center gap-6 md:gap-8 2xl:gap-12">

      {/* SECCIÓN SUPERIOR: Grid responsivo - 2 columnas desde 1024px (lg) para que esté activo en 1280px */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-8 2xl:gap-12">

        {/* COLUMNA IZQUIERDA: Saludo */}
        <div className="flex flex-col order-1 lg:order-1">
          <div
            className="relative w-full flex-grow pt-2 pb-0.5 flex flex-col justify-between overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] 2xl:min-h-[500px]"
            style={{
              backgroundImage: profile?.show_illustrations ? `url(${welcomeArt.path})` : 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: welcomeArt.position,
              backgroundSize: welcomeArt.size,
            }}
          >
            {/* Saludo con tamaños responsivos optimizados */}
            <div>
              <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-8xl font-serif text-black/70 leading-none mb-0">
                Hola,
              </h1>
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-serif pb-2 text-black/65">
                {(profile?.full_name || profile?.username)?.split(' ')[0]}
              </h1>
            </div>

            {/* Subtítulo con fondo translúcido */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-6">
              <p className="text-xl sm: sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl 6xl:text-6xl text-muted-foreground font-extralight">
             Ten un momento para conectar contigo.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-2xl text-muted-foreground font-extralight">
              ¿Qué te dice tu voz interior?
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Logros */}
        <div className="w-full bg-card/10 p-4 sm:p-6 md:p-8 lg:p-6 xl:p-8 rounded-2xl order-2 lg:order-2">
          <h2 className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold tracking-wider text-primary bg-primary/10 rounded-full mb-4 md:mb-6">
            LOGROS
          </h2>

          <div className="space-y-2 md:space-y-4">
            {achievements.map((ach, index) => (
              <React.Fragment key={ach.label}>
                <div className="flex items-center p-2 md:p-4">
                  <p className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold text-[#C56285]/60 pr-2 sm:pr-4 min-w-[60px] sm:min-w-[80px]">
                    {ach.value}
                  </p>
                  <p className="ml-2 sm:ml-4 text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl 2xl:text-3xl text-muted-foreground font-normal">
                    {ach.label}
                  </p>
                </div>
                {index < achievements.length - 1 && (
                  <hr className="border-gray-100 my-1 border-4 md:border-8 lg:border-4 xl:border-6 2xl:border-8 w-1/2 sm:w-2/3 ml-16 sm:ml-20 md:ml-28 lg:ml-16 xl:ml-20 2xl:ml-28" />
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="max-w-prose pl-2 sm:pl-4 md:pl-7 lg:pl-2 xl:pl-4 2xl:pl-7 pt-4 md:pt-6 text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-muted-foreground">
            Felicidades por tu constancia, es un gran momento para celebrar y sentirte orgullosa del camino que iniciaste para aumentar tu bienestar y crecer en todos los sentidos.
          </p>
        </div>
      </div>


      {/* SECCIÓN INFERIOR: Acciones rápidas */}
      <div className=" w-full max-w-6xl mx-auto">
        <h2 className="text-md font-medium text-muted-foreground mb-4 text-center">Acciones sugeridas</h2>


        <div
          className="p-6 rounded-2xl shadow-lg"
          style={{ backgroundColor: getWelcomeArt().accentColor }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">

            {/* Acción 1: Registro */}
            <Link to="/mi-estado-animo" className="group flex items-center gap-4 p-2 transition-opacity hover:opacity-80">
              <Smile className='w-10 h-10 text-white/80' />
              <p className="font-light text-white text-xl">
                Inicia el registro de emociones <span className='underline decoration-dotted'>del día de hoy</span>
              </p>
            </Link>

            {/* Separador Vertical */}
            <Separator orientation="vertical" className="h-16 bg-white/20 hidden md:block" />

            {/* Acción 2: Actividad */}
            <Link to="/botiquin" className="group flex items-center gap-4 p-2 transition-opacity hover:opacity-80">
              <HeartHandshake className='w-10 h-10 text-white/80' />
              <p className="font-light text-white text-xl">
                También puedes realizar alguna <span className='underline decoration-dotted'>actividad</span>
              </p>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}