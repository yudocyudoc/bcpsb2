// src/pages/admin/botiquin/BotiquinTechniqueCreatePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation para leer query params
import { useAuth } from '@/contexts/AuthContext';
import { createTechniqueInSupabase, type CreateTechniquePayload } from '@/services/botiquinService'; // Importar CreateTechniquePayload directamente
import { botiquinCategories } from '@/constants/botiquin/categories.data'; // Para el selector de categorías
import { ROLES } from '@/config/navigation'; // Importar ROLES


import { EditableLexicalInstance } from '@/components/lexical/EditableLexicalInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
//import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Para categoría e intensidad
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Save, Ban, PlusCircle } from 'lucide-react';



type PageStatus = 'idle' | 'creating' | 'error';

// Plantilla JSON vacía para un editor Lexical
const EMPTY_LEXICAL_STATE = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export function BotiquinTechniqueCreatePage() {
  const navigate = useNavigate();
  const location = useLocation(); // Para leer query params
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [metadataJson, setMetadataJson] = useState<string>(EMPTY_LEXICAL_STATE); // Iniciar con estado vacío
  const [bodyJson, setBodyJson] = useState<string>(EMPTY_LEXICAL_STATE);       // Iniciar con estado vacío
  const [intensityLevel, setIntensityLevel] = useState<string | null>(null); // Usar null en lugar de undefined para consistencia del componente controlado

  const [status, setStatus] = useState<PageStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pre-seleccionar categoría si viene en query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromQuery = queryParams.get('category');
    if (categoryFromQuery && botiquinCategories.some(cat => cat.id === categoryFromQuery)) {
      setSelectedCategoryId(categoryFromQuery);
    }
  }, [location.search]);

  // Protección de ruta (aunque AppRouter ya lo hace, doble chequeo nunca está de más)
  useEffect(() => {
    if (profile && profile.role !== ROLES.ADMIN) { // Usar ROLES importado
        toast.error("Acceso denegado.");
      navigate('/');
    }
  }, [profile, navigate]);


  const handleCreateTechnique = async () => {
    if (!title.trim()) { toast.error("El título es obligatorio."); return; }
    if (!selectedCategoryId) { toast.error("Debes seleccionar una categoría."); return; }
    // Validación de JSON podría ser más robusta (ej. try-catch JSON.parse)
    if (!metadataJson || !bodyJson) { toast.error("Los contenidos de metadatos y cuerpo son necesarios."); return; }

    setStatus('creating');
    const payload: CreateTechniquePayload = {
      title: title.trim(),
      category_id: selectedCategoryId,
      metadata_lexical_json: metadataJson,
      body_lexical_json: bodyJson,
      intensity_level: intensityLevel, // Ahora intensityLevel ya es string | null
    };

    try {
      const newTechnique = await createTechniqueInSupabase(payload); // Usar la nueva función de servicio
      toast.success(`Técnica "${newTechnique.title}" creada con éxito.`);
      // Redirigir a la página de edición de la nueva técnica o a la lista
      navigate(`/admin/botiquin/edit/${newTechnique.id}`);
    } catch (err) {
      console.error("Error creating technique:", err);
      const errorMsg = err instanceof Error ? err.message : "No se pudo crear la técnica.";
      setErrorMessage(errorMsg)
      toast.error(errorMsg);
      setStatus('error'); // O volver a 'idle'
    }
  };

  const handleCancel = () => {
    navigate(selectedCategoryId ? `/botiquin/${selectedCategoryId}` : '/botiquin');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={handleCancel} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Cancelar y Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl flex items-center">
            <PlusCircle className="mr-3 h-7 w-7 text-primary"/>
            Crear Nueva Técnica del Botiquín
          </CardTitle>
          <CardDescription>
            Completa los detalles para añadir una nueva herramienta al botiquín.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'error' && (
            <div className="bg-destructive/15 p-3 rounded-md text-center text-sm text-destructive">
                {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
 {/* Usar <label> HTML nativo o <Label> de Shadcn para inputs estándar */}
 <label htmlFor="techniqueTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Título de la Técnica *</label>
                          <Input id="techniqueTitle" value={title} onChange={(e) => setTitle(e.target.value)} disabled={status === 'creating'} />
            </div>
            <div className="space-y-1.5">
            <label htmlFor="techniqueCategory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoría *</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={status === 'creating'}>
                <SelectTrigger id="techniqueCategory">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {botiquinCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
           {/* Usar un div como etiqueta visual para el editor Lexical */}
           <div id="metadata-editor-label" className="text-sm font-medium leading-none">Metadatos (JSON Lexical)</div>
           
            <EditableLexicalInstance
              id="metadataLexicalEditor" // ID para el ContentEditable
              ariaLabelledById="metadata-editor-label" // Apunta al ID del div de arriba
             
              key={`metadata-new-${selectedCategoryId}`} // Key puede ayudar a resetear si cambia la categoría
              initialJsonString={metadataJson}
              onJsonChange={setMetadataJson}
              placeholderText="Duración, materiales, cuándo usar..."
            />
          </div>

          <div className="space-y-1.5">
          {/* Usar un div como etiqueta visual para el editor Lexical */}
          <div id="body-editor-label" className="text-sm font-medium leading-none">Cuerpo Principal (JSON Lexical)</div>
           
            <EditableLexicalInstance
               id="bodyLexicalEditor" // ID para el ContentEditable
               ariaLabelledById="body-editor-label" // Apunta al ID del div de arriba
              
              
              key={`body-new-${selectedCategoryId}`}
              initialJsonString={bodyJson}
              onJsonChange={setBodyJson}
              placeholderText="Pasos a seguir, descripción detallada..."
            />
          </div>

          <div className="space-y-1.5 md:w-1/2">
          <label htmlFor="intensityLevel" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nivel de Intensidad Recomendado</label>
          <Select value={intensityLevel ?? ''} onValueChange={(value) => setIntensityLevel(value === 'none' ? null : value)} disabled={status === 'creating'}>
                <SelectTrigger id="intensityLevel">
                    <SelectValue placeholder="Selecciona un nivel (opcional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Ninguno / No aplica</SelectItem>
                    <SelectItem value="Leve">Leve</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancel} disabled={status === 'creating'}>
                <Ban className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleCreateTechnique} disabled={status === 'creating'}>
                {status === 'creating' ? 'Creando...' : 'Crear Técnica'}
                {status !== 'creating' && <Save className="ml-2 h-4 w-4" />}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}