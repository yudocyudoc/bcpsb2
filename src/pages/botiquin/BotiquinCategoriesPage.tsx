// src/pages/botiquin/BotiquinCategoriesPage.tsx
import React, { useEffect, useMemo } from 'react'; // Añadir useEffect, useMemo
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card'; // CardTitle podría usarse dentro del map
import { Button } from '@/components/ui/button'; // Para el botón de favorito
import { Star } from 'lucide-react'; // Icono para favorito
import { cn } from '@/lib/utils';

import { botiquinCategories as allLocalCategories } from '@/constants/botiquin/categories.data';
// import type { BotiquinCategoryLocalData } from '@/types/botiquin.types'; // No se usa directamente aquí
import { useAuth } from '@/contexts/AuthContext';
import { useFavoritesStore, type FavoritesState } from '@/store/useFavoritesStore'; // <-- 1. IMPORTAR STORE Y SU TIPO


export function BotiquinCategoriesPage() {
  const { user } = useAuth(); // Para obtener el userId

  // --- 2. USAR EL STORE DE ZUSTAND ---
  const favoriteCategoryIds = useFavoritesStore((state: FavoritesState) => state.favoriteCategoryIds);
  const isLoadingFavorites = useFavoritesStore((state: FavoritesState) => state.isLoadingFavorites);
  const fetchUserFavorites = useFavoritesStore((state: FavoritesState) => state.fetchUserFavorites);
  const toggleFavorite = useFavoritesStore((state: FavoritesState) => state.toggleFavorite);
  const favoritesError = useFavoritesStore((state: FavoritesState) => state.favoritesError); // Para manejo de errores opcional

  // --- 3. LLAMAR A fetchUserFavorites ---
  useEffect(() => {
    if (user?.id) {
      fetchUserFavorites(user.id);
    }
    // No es necesario limpiar aquí ya que el store maneja su propio estado.
    // Si el usuario cambia, el store debe ser limpiado/reseteado en el AuthContext o similar (ej. clearFavorites).
  }, [user, fetchUserFavorites]);

  // --- 6. ORDENAR CATEGORÍAS (FAVORITAS PRIMERO) ---
  const orderedCategories = useMemo(() => {
    if (!allLocalCategories) return [];
    return [...allLocalCategories].sort((a, b) => {
      const aIsFavorite = favoriteCategoryIds.has(a.id);
      const bIsFavorite = favoriteCategoryIds.has(b.id);
      if (aIsFavorite && !bIsFavorite) return -1; // a (favorita) antes que b
      if (!aIsFavorite && bIsFavorite) return 1;  // b (favorita) antes que a
      return a.title.localeCompare(b.title);      // sino, orden alfabético por título
    });
  }, [allLocalCategories, favoriteCategoryIds]);

  const handleToggleFavorite = async (event: React.MouseEvent, categoryId: string) => {
    event.preventDefault(); // Prevenir navegación si el icono está dentro del Link
    event.stopPropagation(); // Prevenir que el evento de clic se propague al Link
    if (user?.id) {
      await toggleFavorite(user.id, categoryId);
    } else {
      // Manejar caso donde no hay usuario (quizás mostrar un toast para iniciar sesión)
      console.warn("Usuario no logueado, no se puede marcar favorito.");
    }
  };

  // UI para carga de favoritos (opcional, si quieres mostrar algo específico)
  if (isLoadingFavorites && !favoriteCategoryIds.size) { // Mostrar solo si no hay favoritos cacheados y está cargando
    // Podrías mostrar skeletons para las tarjetas aquí
    // return <div className="container mx-auto px-4 py-8 text-center"><p>Cargando favoritos...</p></div>;
  }
  
  // UI para error al cargar favoritos (opcional)
  if (favoritesError) {
      // return <div className="container mx-auto px-4 py-8 text-center text-destructive"><p>Error al cargar favoritos: {favoritesError}</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Botiquín Emocional
        </h1>
        <p className="mt-3 text-md leading-7 text-muted-foreground sm:mt-4 max-w-2xl mx-auto">
          Encuentra aquí algunas herramientas rápidas para momentos difíciles.
          Elige cómo te sientes o qué necesitas ahora para explorar las técnicas disponibles.
        </p>
      </div>

      {orderedCategories.length === 0 && !isLoadingFavorites && (
        <p className="text-center text-muted-foreground">No hay categorías disponibles en este momento.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
        {orderedCategories.map((category) => {
          const isFavorite = favoriteCategoryIds.has(category.id);
          return (
            <Link
              to={`/botiquin/${category.id}`}
              key={category.id}
              className="relative group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full max-w-[280px] h-auto flex flex-col" // h-auto para que se ajuste al contenido. Quitado 'block' redundante.
              aria-label={`Explorar técnicas para ${category.title}`}
            >
              {/* --- 4 y 5. ICONO/BOTÓN DE FAVORITO --- */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/70 hover:bg-background",
                  isFavorite ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground/70 hover:text-muted-foreground"
                )}
                onClick={(e) => handleToggleFavorite(e, category.id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Quitar ${category.title} de favoritos` : `Añadir ${category.title} a favoritos`}
                title={isFavorite ? `Quitar de favoritos` : `Añadir a favoritos`}
              >
                <Star className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </Button>

              <Card
                className={cn(
                  "overflow-hidden w-full flex-grow flex flex-col transition-all duration-300 ease-in-out", // flex-grow para que la card llene el espacio del Link
                  "hover:shadow-xl hover:scale-[1.02]",
                  `${category.accentColorClass || 'border-l-transparent'}`,
                  category.backgroundColorClass,
                  category.textColorClass,
                  isFavorite && "ring-2 ring-yellow-400 dark:ring-yellow-500" // Resaltar si es favorita
                )}
              >
                <CardContent className="p-5 flex-grow flex flex-col items-center text-center justify-center">
                  <div className="mb-4 h-28 w-28 flex items-center justify-center rounded-full overflow-hidden bg-white/30 dark:bg-black/10 shadow-lg p-2">
                    {/* ... tu lógica de ilustración ... */}
                     {category.illustrationComponent ? (
                        <category.illustrationComponent
                            className="w-full h-full object-contain"
                            aria-label={`Ilustración para ${category.title}`}
                        />
                        ) : category.illustrationSrc ? (
                        <img src={category.illustrationSrc} alt={category.title} className="w-full h-full object-contain rounded-full" />
                        ) : (
                        <PlaceholderIllustration className="h-full w-full rounded-full" />
                    )}
                  </div>
                  <CardTitle className={cn( "text-xl font-semibold", category.titleHoverColorClass )}>
                    {category.title}
                  </CardTitle>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      {category.description}
                    </p>
                  )}
                </CardContent>
              </Card>
              {/* El título y contador de actividades ahora podrían ir fuera del Link si el Link solo envuelve la Card visual */}
              {/* O si el Link envuelve todo, asegurarse que el botón de favorito no navegue. */}
              {/* Por ahora, lo he dejado como estaba, con el botón de favorito previniendo la propagación. */}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Implementación básica para PlaceholderIllustration si no la tienes
const PlaceholderIllustration: React.FC<{ className?: string; src?: string; alt?: string }> = ({ className, src, alt }) => {
  return (
    <div className={cn("bg-muted/30 rounded flex items-center justify-center text-muted-foreground text-sm", className)}>
      {src ? <img src={src} alt={alt || "Illustration placeholder"} className="w-full h-full object-contain" /> : "[ Ilustración ]"}
    </div>
  );
};