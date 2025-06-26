// src/config/illustrations.ts

// 1. Definimos la estructura que tendrá cada objeto de arte.
//    Exportamos el tipo para poder usarlo en otros lugares si es necesario.
export interface WelcomeArt {
    path: string;
    size: string;
    position: string;
    accentColor: string;
  }
  
  // 2. Creamos nuestro directorio de ilustraciones.
  //    Cada objeto contiene toda la información necesaria para renderizarse correctamente.
  const morningArt: WelcomeArt = {
    path: '/illustrations/welcome-morning.svg',
    size: 'auto 90%',
    position: '95% 0%',
    accentColor: '#e18470', // Tono naranjón
  };
  
  const afternoonArt: WelcomeArt = {
    path: '/illustrations/welcome-afternoon.svg', // Tu ilustración de la mujer bailando
    size: 'contain',
    position: '67% 0%',
    accentColor: '#225876', // Azul petróleo
  };
  
  const eveningArt: WelcomeArt = {
    path: '/illustrations/welcome-evening.svg', // Tu ilustración de la mujer sentada
    size: 'contain',
    position: '90% 0%',
    accentColor: '#4c8f8b', // Morado oscuro/sereno
  };
  
  // 3. Creamos y exportamos la función que elige el arte.
  //    Esta es la única función que otros componentes necesitarán importar.
  export const getWelcomeArt = (): WelcomeArt => {
    const currentHour = new Date().getHours();
  
    if (currentHour >= 5 && currentHour < 12) { // Mañana (5am - 11:59am)
      return morningArt;
    }
    
    if (currentHour >= 12 && currentHour < 18) { // Tarde (12pm - 6:59pm)
      return afternoonArt;
    }
    
    // Por defecto, se muestra el arte de la noche.
    return eveningArt;
  };