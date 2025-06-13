// src/pages/interactive/InteractiveStoriesListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info, PlayCircle } from 'lucide-react';
import { getPublishedInteractiveStories } from '@/services/interactiveStoriesService'; // Ajusta la ruta
import type { InteractiveStoryListItem } from '@/types/interactiveStories.types'; // Ajusta la ruta
//import { cn } from '@/lib/utils';

type PageStatus = 'loading' | 'success' | 'noStories' | 'error';

const StoryListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-28" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

export function InteractiveStoriesListPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [stories, setStories] = useState<InteractiveStoryListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    setStatus('loading');
    getPublishedInteractiveStories()
      .then(fetchedStories => {
        if (fetchedStories.length === 0) {
          setStatus('noStories');
        } else {
          setStories(fetchedStories);
          setStatus('success');
        }
      })
      .catch(err => {
        console.error("Error fetching interactive stories list:", err);
        setErrorMessage(err.message || "No se pudo cargar la lista de historias.");
        setStatus('error');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Historias Interactivas</h1>
        <StoryListSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Error al Cargar Historias</h1>
        <p className="text-muted-foreground mt-1 mb-4">{errorMessage}</p>
        <Button onClick={() => navigate('/')} className="mt-6">Volver al Inicio</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Historias Interactivas
        </h1>
        <p className="mt-3 text-md leading-7 text-muted-foreground sm:mt-4 max-w-2xl mx-auto">
          Explora narrativas que te ayudarán a reflexionar y aprender sobre diferentes situaciones y emociones.
        </p>
      </header>

      {status === 'noStories' ? (
        <div className="text-center text-muted-foreground py-10 mt-6 border bg-card p-8 rounded-lg shadow-sm">
          <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
          <p className="text-lg font-medium">No hay historias disponibles</p>
          <p className="text-sm mt-1">Aún no se han publicado historias interactivas. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stories.map(story => (
            <Card key={story.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{story.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="line-clamp-3">
                  {story.description || "Explora esta historia interactiva."}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/historias/${story.id}`}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Comenzar Historia
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}