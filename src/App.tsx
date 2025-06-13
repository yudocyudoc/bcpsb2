import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { setupOnlineSyncListener } from '@/services/syncService'; // <-- IMPORTA TU FUNCIÓN

import PWAPrompt from '@/components/pwa/PWAPrompt'; // <-- IMPORTAR

function App() {
  // Efecto para configurar el listener de sincronización online/offline
  // Esto se ejecutará una vez cuando el componente App se monte.
  useEffect(() => {
    // console.log("App.tsx: Setting up online sync listener.");
    const cleanupSyncListener = setupOnlineSyncListener();

    // Función de limpieza que se ejecuta cuando App se desmonta
    return () => {
      // console.log("App.tsx: Cleaning up online sync listener.");
      cleanupSyncListener();
    };
  }, []); // El array vacío de dependencias asegura que solo se ejecute al montar/desmontar

  return (
    <>
      {/* AppRouter maneja todas las vistas y layouts */}
      <AppRouter />
      <PWAPrompt />
    </>
  );
}

export default App;