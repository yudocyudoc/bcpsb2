// src/pages/HomePage.tsx
import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Bienvenido a bcpSP</h1>
      <p className="mt-2 text-muted-foreground">
        Este es el panel principal de la aplicación. Desde aquí podrás acceder a todas las herramientas.
      </p>
      {/* Podrías añadir algunos Cards o links rápidos aquí */}
    </div>
  );
};