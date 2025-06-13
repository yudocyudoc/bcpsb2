// src/pages/botiquin/BotiquinTechniquesListPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertTriangle, Edit3, PlusCircle, ShieldAlert, TriangleAlert, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Ya lo usas, ¡perfecto!
import { cn } from '@/lib/utils';
import { ROLES } from '@/config/navigation';
import { INTENSITY_LEVELS, type IntensityFilterLevel, type BotiquinCategoryLocalData, type BotiquinTechniqueApp } from '@/types/botiquin.types';

// --- SERVICIOS Y TIPOS ---
// Importamos TODAS las funciones que podríamos necesitar
import { 
  getCategoryDetailsFromLocal, 
  getTechniquesForCategoryFromSupabase, // Para Admins
  getCachedAllTechniques,               // Para Usuarios (Offline-First)
  transformSupabaseRowToTechniqueApp,   // Helper para transformar datos
  type TechniqueRowFromDb                // Tipo de fila de la DB
} from '@/services/botiquinService';

// Componente para renderizar JSON de Lexical
import { LexicalJsonRenderer } from '@/components/lexical/LexicalJsonRenderer';

// ... (Tus componentes Skeleton, ErrorDisplay, IntensityIcon se mantienen IGUAL) ...
type PageStatus = 'loading' | 'success' | 'categoryNotFound' | 'noTechniques' | 'error';

const ListPageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <Skeleton className="h-8 w-1/4 mb-2" />
    <Skeleton className="h-10 w-3/4 mb-1" />
    <Skeleton className="h-5 w-full mb-8" />
    <div className="space-y-3">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string; categoryId?: string }> = ({ message, categoryId }) => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive mb-2">Error al Cargar las Técnicas</h1>
      <p className="text-muted-foreground mt-1 mb-4">{message || "No se pudo obtener la información de las técnicas."}</p>
      {categoryId && <p className="text-sm text-muted-foreground">Categoría solicitada: {categoryId}</p>}
      <Button onClick={() => navigate('/botiquin')} className="mt-6">Volver al Botiquín</Button>
    </div>
  );
};

// Helper para el icono de intensidad
const IntensityIcon: React.FC<{ level: string | null | undefined }> = ({ level }) => {
  if (!level) return null; // No mostrar nada si no hay nivel

  switch (level.toLowerCase()) {
    case 'leve':
      return <Info className="h-5 w-5 text-yellow-500/80 ml-2 shrink-0" aria-label="Intensidad: Leve" />;
    case 'moderado':
      return <TriangleAlert className="h-5 w-5 text-orange-500/60 ml-2 shrink-0" aria-label="Intensidad: Moderado" />;
    case 'alto':
      return <ShieldAlert className="h-5 w-5 text-red-900/80 ml-2 shrink-0" aria-label="Intensidad: Alto" />;
    default:
      return null; // O un icono por defecto si el nivel no es reconocido
  }
};



export function BotiquinTechniquesListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth(); // ¡La clave está aquí!

  const [status, setStatus] = useState<PageStatus>('loading');
  const [currentCategory, setCurrentCategory] = useState<BotiquinCategoryLocalData | null>(null);
  const [techniques, setTechniques] = useState<BotiquinTechniqueApp[]>([]);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedIntensityFilter, setSelectedIntensityFilter] = useState<IntensityFilterLevel>("Todos");

  // --- LÓGICA DE CARGA DE DATOS REFACTORIZADA ---
  const fetchData = useCallback(async () => {
    if (!categoryId) {
      console.warn("No categoryId in params, redirecting...");
      navigate('/botiquin', { replace: true });
      return;
    }

    setStatus('loading');
    setTechniques([]);
    setCurrentCategory(null);
    setErrorMessage('');

    try {
      // Paso 1: Obtener detalles de la categoría (esto es local y rápido)
      const categoryDetails = await getCategoryDetailsFromLocal(categoryId);
      if (!categoryDetails) {
        setStatus('categoryNotFound');
        return;
      }
      setCurrentCategory(categoryDetails);

      // Paso 2: DECIDIR CÓMO OBTENER LAS TÉCNICAS BASADO EN EL ROL
      let fetchedTechniques: BotiquinTechniqueApp[] = [];

      if (profile?.role === ROLES.ADMIN) {
        // --- FLUJO PARA ADMINS: Siempre a la base de datos ---
        console.log('[ListPage] Admin detected. Fetching fresh data from Supabase.');
        fetchedTechniques = await getTechniquesForCategoryFromSupabase(categoryId);
      } else {
        // --- FLUJO PARA USUARIOS: Offline-First ---
        console.log('[ListPage] User detected. Fetching from cache first.');
        const allTechniquesData: TechniqueRowFromDb[] = await getCachedAllTechniques();
        
        // Filtramos en el cliente y transformamos los datos
        fetchedTechniques = allTechniquesData
          .filter(tech => tech.category_id === categoryId)
          .map(transformSupabaseRowToTechniqueApp);
      }

      // Paso 3: Actualizar el estado con los resultados
      if (fetchedTechniques.length === 0) {
        setStatus('noTechniques');
      } else {
        setTechniques(fetchedTechniques);
        setStatus('success');
      }
    } catch (error) {
      console.error(`ListPage: Error fetching data for category ${categoryId}:`, error);
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
      setStatus('error');
    }
  }, [categoryId, navigate, profile?.role]); // Dependemos del rol del perfil

  useEffect(() => {
    fetchData();
  }, [fetchData]); // El useEffect ahora solo llama a la función `fetchData`

  // ... (El resto de tu componente: filteredTechniques, accordionItems, y todo el JSX se mantiene IGUAL) ...
  const filteredTechniques = useMemo(() => {
    if (selectedIntensityFilter === "Todos") {
      return techniques;
    }
    return techniques.filter(technique =>
      technique.intensityLevel?.toLowerCase() === selectedIntensityFilter.toLowerCase()
    );
  }, [techniques, selectedIntensityFilter]);

  const accordionItems = useMemo(() => {
    return filteredTechniques.map((technique) => ( // <--- USAR filteredTechniques
      <AccordionItem value={technique.id} key={technique.id} className="border dark:border-border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
        <AccordionTrigger className="px-4 py-3 sm:px-6 sm:py-4 text-md sm:text-lg font-semibold hover:no-underline text-card-foreground text-left flex justify-between items-center w-full">
          <span className="flex-1 truncate">{technique.title}</span>
          {/* Envolver el IntensityIcon en un span para evitar la rotación */}
          <span className="flex items-center shrink-0"> {/* shrink-0 para evitar que el span se encoja */}
            <IntensityIcon level={technique.intensityLevel} />
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6 border-t dark:border-border/70 space-y-4">
          {technique.metadataLexicalJson && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Metadatos:</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none p-3 border rounded-md bg-muted/30">
                {(typeof technique.metadataLexicalJson === 'string' && technique.metadataLexicalJson.trim().startsWith('{')) ? (
                  <LexicalJsonRenderer jsonString={technique.metadataLexicalJson} />
                ) : <p className="text-xs italic text-muted-foreground">Metadatos no válidos.</p>}
              </div>
            </div>
          )}
          {technique.bodyLexicalJson && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1 mt-3">Procedimiento:</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {(typeof technique.bodyLexicalJson === 'string' && technique.bodyLexicalJson.trim().startsWith('{')) ? (
                  <LexicalJsonRenderer jsonString={technique.bodyLexicalJson} />
                ) : <p className="text-xs italic text-muted-foreground">Cuerpo no válido.</p>}
              </div>
            </div>
          )}
          {!technique.metadataLexicalJson && !technique.bodyLexicalJson && (
            <p className="text-sm italic text-muted-foreground py-4">Contenido no disponible.</p>
          )}
          {profile?.role === ROLES.ADMIN && (
            <div className="mt-4 pt-4 border-t">
              <Link
                to={`/admin/botiquin/edit/${technique.id}`}
                className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                title={`Editar la técnica: ${technique.title}`}
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                Editar Técnica
              </Link>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    ));
  }, [filteredTechniques, profile]); // Ahora depende de filteredTechniques

  if (status === 'loading') return <ListPageSkeleton />;
  if (status === 'error') return <ErrorDisplay message={errorMessage} categoryId={categoryId} />;
  if (status === 'categoryNotFound') return (
    <ErrorDisplay message="La categoría solicitada no fue encontrada." categoryId={categoryId} />
  );
  
  const pageTitle = currentCategory?.title || (categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : "Técnicas");
  const pageDescription = currentCategory?.description || "Explora las siguientes herramientas y ejercicios.";

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/botiquin')} className="text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver al Botiquín
        </Button>
        {profile?.role === ROLES.ADMIN && categoryId && (
          // Navegar a la ruta de creación, pasando el categoryId como query param
          <Button size="sm" onClick={() => navigate(`/admin/botiquin/new?category=${categoryId}`)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Técnica en "{currentCategory?.title || 'esta Categoría'}"
          </Button>
        )}
      </div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>
        <p className="text-md text-muted-foreground mt-2">{pageDescription}</p>
      </header>

      {/* SECCIÓN DE FILTROS DE INTENSIDAD */}
      {status === 'success' && techniques.length > 0 && ( // Mostrar filtros solo si hay técnicas cargadas
        <div className="mb-6 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Filtrar por Nivel de Intensidad:</h3>
          <div className="flex flex-wrap gap-2">
            {INTENSITY_LEVELS.map(level => (
              <Button
                key={level}
                variant={selectedIntensityFilter === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIntensityFilter(level)}
                className={cn(
                  "transition-all font-stretch-semi-condensed font-normal",
                  selectedIntensityFilter === level
                    ? "ring-1 ring-lime-500 bg-lime-100/80 text-gray-500 px-8 hover:bg-lime-500/40"
                    : "hover:bg-lime-300/60 hover:text-gray"
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Renderizado del Acordeón o mensajes de "no hay técnicas" */}
      {status === 'success' && filteredTechniques.length > 0 && ( // <--- USAR filteredTechniques
        <Accordion type="single" collapsible className="w-full space-y-3" value={activeAccordionItem} onValueChange={(value) => setActiveAccordionItem(value || '')}>
          {accordionItems}
        </Accordion>
      )}

      {status === 'success' && techniques.length > 0 && filteredTechniques.length === 0 && (
        // Mostrar si hay técnicas pero ninguna coincide con el filtro
        <div className="text-center text-muted-foreground py-10 mt-6 border bg-card p-8 rounded-lg shadow-sm">
          <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
          <p className="text-lg font-medium">No hay técnicas con intensidad "{selectedIntensityFilter}"</p>
          <p className="text-sm mt-1">Prueba seleccionando otro nivel de intensidad o "Todos".</p>
        </div>
      )}

      {(status === 'noTechniques' && currentCategory) && (
        // Mostrar si la categoría no tiene técnicas en absoluto (antes de aplicar filtros)
        <div className="text-center text-muted-foreground py-10 mt-6 border bg-card p-8 rounded-lg shadow-sm">
           <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
          <p className="text-lg font-medium">No hay técnicas disponibles</p>
          <p className="text-sm mt-1">Actualmente no hay técnicas registradas para la categoría "{currentCategory.title}".</p>
        </div>
      )}
    </div>
  );
}