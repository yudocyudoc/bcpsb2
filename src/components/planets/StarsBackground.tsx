import React, { CSSProperties, useEffect, useState } from 'react';

type StarsBackgroundProps = {
  density?: number;
  baseSize?: number;
  sizeVariation?: number;
  twinkleSpeed?: number;
  shootingStars?: number; // Nueva prop para estrellas fugaces
  className?: string;
  style?: CSSProperties;
};

const StarsBackground: React.FC<StarsBackgroundProps> = ({
  density = 200,
  baseSize = 1,
  sizeVariation = 2,
  twinkleSpeed = 5,
  shootingStars = 3, // Cantidad de estrellas fugaces
  className = '',
  style = {}
}) => {
  const [shootingStarsState, setShootingStars] = useState<Array<{
    id: number;
    top: string;
    left: string;
    size: number;
    duration: number;
  }>>([]);

  // Generar estrellas normales
  const stars = React.useMemo(() => {
    return Array.from({ length: density }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: baseSize + Math.random() * sizeVariation,
      delay: Math.random() * twinkleSpeed,
      duration: twinkleSpeed * (0.8 + Math.random() * 0.4)
    }));
  }, [density, baseSize, sizeVariation, twinkleSpeed]);

  // Efecto para estrellas fugaces
  useEffect(() => {
    if (shootingStars <= 0) return;

    const generateShootingStar = () => {
      const newStar = {
        id: Date.now() + Math.random(),
        top: `${Math.random() * 20}%`, // Aparecen en la parte superior
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        duration: 2 + Math.random() * 3 // Más rápido que las estrellas normales
      };
      
      setShootingStars(prev => [...prev, newStar]);
      
      // Eliminar después de la animación
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== newStar.id));
      }, newStar.duration * 1000);
    };

    // Generar estrellas fugaces iniciales
    for (let i = 0; i < shootingStars; i++) {
      setTimeout(generateShootingStar, i * 3000);
    }

    // Intervalo para nuevas estrellas
    const interval = setInterval(() => {
      generateShootingStar();
    }, 8000); // Cada 8 segundos

    return () => clearInterval(interval);
  }, [shootingStars]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Estrellas normales */}
      {stars.map(star => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Estrellas fugaces */}
      {shootingStarsState.map(star => (
        <div
          key={`shooting-${star.id}`}
          className="absolute bg-white animate-shooting-star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size * 3}px`, // Más anchas que largas
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            transform: 'rotate(-45deg)',
            borderRadius: '50% 50% 50% 50%',
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackground;