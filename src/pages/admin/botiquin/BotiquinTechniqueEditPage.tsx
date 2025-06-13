// src/pages/admin/botiquin/BotiquinTechniqueEditPage.tsx
import React, { useState, useEffect, useRef } from 'react'; // Añadir useRef
import { useParams, useNavigate } from 'react-router-dom';
import { getTechniqueByIdFromSupabase, updateTechniqueInSupabase, type UpdateTechniquePayload } from '@/services/botiquinService';
import type { BotiquinTechniqueApp } from '@/types/botiquin.types';
import { EditableLexicalInstance, type EditableLexicalInstanceRef } from '@/components/lexical/EditableLexicalInstance'; // Importar el tipo de la ref
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // <-- AÑADIDO
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Save, Ban, AlertTriangle, Info } from 'lucide-react';

import { scroller } from 'react-scroll';


type PageStatus = 'loading' | 'editing' | 'saving' | 'notFound' | 'error';

const EditPageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <Skeleton className="h-8 w-1/4 mb-6" /> {/* Botón volver y título página */}
    <Card>
      <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
      <CardContent className="space-y-6">
        <div><Skeleton className="h-4 w-1/6 mb-2" /><Skeleton className="h-10 w-full" /></div>
        <div><Skeleton className="h-4 w-1/6 mb-2" /><Skeleton className="h-32 w-full" /></div>
        <div><Skeleton className="h-4 w-1/6 mb-2" /><Skeleton className="h-48 w-full" /></div>
        <div><Skeleton className="h-4 w-1/6 mb-2" /><Skeleton className="h-10 w-1/3" /></div>
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export function BotiquinTechniqueEditPage() {
  const { techniqueId } = useParams<{ techniqueId: string }>();
  const navigate = useNavigate();
  // const { user, profile } = useAuth(); // Para verificar roles de admin/editor en el futuro

  const [status, setStatus] = useState<PageStatus>('loading');
  const [initialTechnique, setInitialTechnique] = useState<BotiquinTechniqueApp | null>(null);

  // Estados para los campos editables
  const [title, setTitle] = useState('');
  const [metadataJson, setMetadataJson] = useState<string | null>(null);
  const [bodyJson, setBodyJson] = useState<string | null>(null);
  const [intensityLevel, setIntensityLevel] = useState<string | null>(null);
  // Necesitamos una key para forzar el remonte de los editores Lexical cuando cambian los datos iniciales
  const [editorKey, setEditorKey] = useState(Date.now().toString());

  // Refs para las instancias del editor
  const metadataEditorRef = useRef<EditableLexicalInstanceRef>(null);
  // const bodyEditorRef = useRef<EditableLexicalInstanceRef>(null); // Si también quieres enfocar el segundo

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Near the top of your component, add these IDs
  const metadataEditorId = "metadataLexicalEditor"; // Match the label's 'for' attribute
  const bodyEditorId = "bodyLexicalEditor"; // Match the label's 'for' attribute

  // Cargar datos de la técnica
  useEffect(() => {
    if (!techniqueId) {
      console.error("EditPage: No techniqueId provided.");
      toast.error("No se especificó una técnica para editar.");
      navigate('/admin/botiquin'); // O a una página de error/lista de técnicas
      return;
    }

    // TODO: Añadir verificación de rol aquí cuando esté implementado
    // if (profile && profile.role !== 'admin' && profile.role !== 'editor') {
    //   toast.error("No tienes permiso para editar técnicas.");
    //   navigate('/');
    //   return;
    // }

    setStatus('loading');
    getTechniqueByIdFromSupabase(techniqueId)
      .then(techniqueData => {
        if (techniqueData) {
          setInitialTechnique(techniqueData);
          setTitle(techniqueData.title);
          setMetadataJson(techniqueData.metadataLexicalJson);
          setBodyJson(techniqueData.bodyLexicalJson);
          setIntensityLevel(techniqueData.intensityLevel);
          setEditorKey(techniqueData.id + Date.now()); // Nueva key para forzar re-render de Lexical con nuevos datos
          setStatus('editing');

          // Scroll al campo de título y enfocar el primer editor después de que los datos estén listos
          // y los componentes se hayan actualizado.
          const layoutUpdateTimeout = setTimeout(() => {
            scroller.scrollTo('techniqueTitle', { // ID del campo de título
              duration: 500,
              delay: 0,
              smooth: 'easeInOutQuart',
              containerId: 'mainScrollContainer', // ID del <main> en DashboardLayout
              offset: -80, // Ajustar offset para que no quede pegado al header
            });
            console.log("EditPage: Attempted scroll to title field.");

            metadataEditorRef.current?.focus();
            console.log("EditPage: Attempted to focus metadata editor.");
          }, 150); // Delay para permitir que Lexical se inicialice completamente con el nuevo estado/key

          return () => clearTimeout(layoutUpdateTimeout);
        } else {
          setStatus('notFound');
        }
      })
      .catch(err => {
        console.error("Error fetching technique for editing:", err);
        setErrorMessage(err.message || "No se pudo cargar la técnica.");
        setStatus('error');
      });
  }, [techniqueId, navigate /*, profile */]);

  
  // El scroll al inicio ahora es manejado por DashboardLayout.tsx

  const handleSaveChanges = async () => {
    if (!techniqueId || !initialTechnique) return;

    // Validaciones básicas
    if (!title.trim()) {
      toast.error("El título no puede estar vacío.");
      return;
    }
    // Podrías añadir validaciones para los JSON de Lexical si es necesario
    // (ej. verificar que no sean null si son obligatorios, o que sean JSON válido)

    setStatus('saving');
    const payload: UpdateTechniquePayload = {
      title: title.trim(),
      metadata_lexical_json: metadataJson, // Nombres de columna de BD
      body_lexical_json: bodyJson,
      intensity_level: intensityLevel,
    };

    // Solo incluir campos que realmente cambiaron para optimizar (opcional)
    // Esto requiere comparar con initialTechnique, puede ser más complejo
    // Por ahora, enviamos todos los campos que el usuario pudo haber modificado.

    try {
      const updatedTechnique = await updateTechniqueInSupabase(techniqueId, payload);
      toast.success(`Técnica "${updatedTechnique?.title || title}" guardada con éxito.`);
      // Actualizar el estado inicial por si el usuario sigue editando
      if (updatedTechnique) {
        setInitialTechnique(updatedTechnique);
        // No es necesario resetear los estados de los campos si queremos que el usuario siga viendo lo que guardó
      }
      setStatus('editing'); // Volver al modo edición
      // Opcional: navegar a otra página, por ejemplo, la lista de técnicas
      // navigate(`/botiquin/${initialTechnique.categoryId}`);
    } catch (err) {
      console.error("Error saving technique:", err);
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la técnica.");
      setStatus('editing'); // Permitir reintentar
    }
  };

  const handleCancel = () => {
    if (initialTechnique) {
      navigate(`/botiquin/${initialTechnique.categoryId}`);
    } else {
      navigate('/botiquin'); // Fallback si no hay categoría inicial
    }
  };


  if (status === 'loading') {
    return <EditPageSkeleton />;
  }

  if (status === 'notFound') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold">Técnica no Encontrada</h1>
        <p className="text-muted-foreground">La técnica que intentas editar no existe (ID: {techniqueId}).</p>
        <Button onClick={() => navigate('/botiquin')} className="mt-4">Volver al Botiquín</Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Error al Cargar</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
        <Button onClick={() => navigate('/botiquin')} className="mt-4">Volver al Botiquín</Button>
      </div>
    );
  }

  // Solo renderizar si estamos en 'editing' o 'saving' y tenemos initialTechnique
  if (!initialTechnique && (status === 'editing' || status === 'saving')) {
    // Esto es un estado inesperado si la carga fue "exitosa" pero no hay datos.
    // Podría redirigir o mostrar un error más específico.
    // Por ahora, mostramos skeleton para evitar un crash.
    return <EditPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={handleCancel} className="mb-6 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="mr-2 h-4 w-4" />
        {initialTechnique ? `Volver a ${initialTechnique.categoryId}` : 'Volver'}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Editar Técnica: {initialTechnique?.title}</CardTitle>
          <CardDescription>
            Modifica los detalles de la técnica del botiquín.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título de la Técnica */}
          <div className="space-y-1.5">
            <Label htmlFor="techniqueTitle" className="text-sm font-medium">Título de la Técnica</Label>
            <Input
              id="techniqueTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Respiración Diafragmática"
              disabled={status === 'saving'}
            />
          </div>

          {/* Metadatos Lexical JSON */}
          <div className="space-y-1.5">

  {/* Usar un div como etiqueta visual para el editor Lexical */}
  <div id="metadata-editor-label-edit" className="text-sm font-medium leading-none">Metadatos (JSON Lexical)</div>
           
            <EditableLexicalInstance
              ref={metadataEditorRef}
              key={`metadata-${editorKey}`}
              id={metadataEditorId} // ID para el ContentEditable
              ariaLabelledById="metadata-editor-label-edit" // Nueva prop
              initialJsonString={metadataJson}
              onJsonChange={setMetadataJson}
              placeholderText="Introduce los metadatos (duración, materiales, etc.) aquí..."
            />
          </div>

          {/* Cuerpo Lexical JSON */}
          <div className="space-y-1.5">
           
            {/* Usar un div como etiqueta visual para el editor Lexical */}
            <div id="body-editor-label-edit" className="text-sm font-medium leading-none">Cuerpo Principal (JSON Lexical)</div>
           
            <EditableLexicalInstance
              key={`body-${editorKey}`}
              id={bodyEditorId} // ID para el ContentEditable
              ariaLabelledById="body-editor-label-edit" // Nueva prop
              initialJsonString={bodyJson}
              onJsonChange={setBodyJson}
              placeholderText="Introduce los pasos y el procedimiento de la técnica aquí..."
            />
          </div>

          {/* Nivel de Intensidad */}
          <div className="space-y-1.5 md:w-1/2"> {/* md:w-1/2 añadido */}
            <Label htmlFor="intensityLevelEdit" className="text-sm font-medium">Nivel de Intensidad Recomendado</Label>
            <Select
              value={intensityLevel || undefined} // `undefined` para que el placeholder se muestre si es null
              onValueChange={(value) => setIntensityLevel(value === 'none' ? null : value)} // Guardar null si es 'none'
              disabled={status === 'saving'}
            >
              <SelectTrigger id="intensityLevelEdit">
                <SelectValue placeholder="Selecciona un nivel (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno / No aplica</SelectItem>
                <SelectItem value="Leve">Leve</SelectItem>
                <SelectItem value="Moderado">Moderado</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                {/* Puedes añadir más opciones si las tienes */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCancel} disabled={status === 'saving'}>
            <Ban className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges} disabled={status === 'saving'}>
            {status === 'saving' ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {status === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}