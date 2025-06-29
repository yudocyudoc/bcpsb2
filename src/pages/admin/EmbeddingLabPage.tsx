// src/pages/admin/EmbeddingLabPage.tsx
import  { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';
import { ROLES } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Beaker, ChevronLeft, Loader2, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importar servicios
import { 
  createAdditionalTestCases, 
  getTestCaseStats, 
  clearAllTestCases 
} from '@/services/embeddingTestService';

// Importar componentes modulares
import { EmbeddingStats } from '@/components/admin/embedding-lab/EmbeddingStats';
import { TestCaseManager } from '@/components/admin/embedding-lab/TestCaseManager';
import { TestCasesList } from '@/components/admin/embedding-lab/TestCasesList';
import { TextAnalyzer } from '@/components/admin/embedding-lab/TextAnalyzer';
import { SimilarityResults } from '@/components/admin/embedding-lab/SimilarityResults';
import { EmbeddingDisplay } from '@/components/admin/embedding-lab/EmbeddingDisplay';
import { EmbeddingInsights } from '@/components/admin/embedding-lab/EmbeddingInsights';
import { EmbeddingTestCase, TestCaseStats, SimilarityResult, AnalyzeEmbeddingResponse } from '@/types/embeddingLab';

export function EmbeddingLabPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [testCases, setTestCases] = useState<EmbeddingTestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [similarities, setSimilarities] = useState<SimilarityResult[]>([]);
  const [newEmbedding, setNewEmbedding] = useState<number[] | null>(null);
  const [stats, setStats] = useState<TestCaseStats | null>(null);
  const [isCreatingCases, setIsCreatingCases] = useState(false);
  const [isClearingCases, setIsClearingCases] = useState(false);

  // Protección de acceso
  useEffect(() => {
    if (profile && profile.role !== ROLES.ADMIN) {
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden acceder al laboratorio de embeddings.'
      });
      navigate('/');
      return;
    }
  }, [profile, navigate]);

  // Cargar casos de prueba existentes
  const loadTestCases = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', '584266c3-5623-4e63-91b1-b1b962568ab5')
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

      if (error) {
        console.error('Error loading test cases:', error);
        toast.error('Error al cargar casos de prueba');
        return;
      }

      if (!data || data.length === 0) {
        console.log('No test cases found');
        toast.info('No se encontraron casos de prueba con embeddings');
        return;
      }

      const processedCases: EmbeddingTestCase[] = data
        .map(entry => {
          try {
            const embedding = typeof entry.embedding === 'string' 
              ? JSON.parse(entry.embedding)
              : entry.embedding;
              
            if (!Array.isArray(embedding) || embedding.length === 0) {
              console.warn(`Invalid embedding for entry ${entry.id}`);
              return null;
            }

            return {
              id: entry.id,
              user_id: entry.user_id,
              created_at: entry.created_at,
              suceso: entry.suceso || '',
              emociones_principales: entry.emociones_principales || [],
              pensamientos_automaticos: entry.pensamientos_automaticos || '',
              embedding: embedding
            };
          } catch (e) {
            console.warn(`Error processing entry ${entry.id}:`, e);
            return null;
          }
        })
        .filter((entry): entry is EmbeddingTestCase => entry !== null);

      setTestCases(processedCases);
      console.log(`Loaded ${processedCases.length} test cases`);
      
    } catch (error) {
      console.error('Error in loadTestCases:', error);
      toast.error('Error al cargar datos del laboratorio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getTestCaseStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  // Crear casos de prueba adicionales
  const handleCreateAdditionalCases = useCallback(async () => {
    setIsCreatingCases(true);
    try {
      const result = await createAdditionalTestCases();
      toast.success(`Casos creados: ${result.success} exitosos, ${result.errors} errores`);
      await Promise.all([loadTestCases(), loadStats()]);
    } catch (error) {
      console.error('Error creating additional cases:', error);
      toast.error('Error al crear casos adicionales');
    } finally {
      setIsCreatingCases(false);
    }
  }, [loadTestCases, loadStats]);

  // Limpiar todos los casos de prueba
  const handleClearAllCases = useCallback(async () => {
    if (!confirm('¿Estás seguro? Esto eliminará TODOS los casos de prueba del usuario de testing.')) {
      return;
    }
    
    setIsClearingCases(true);
    try {
      const success = await clearAllTestCases();
      if (success) {
        toast.success('Todos los casos de prueba fueron eliminados');
        setTestCases([]);
        setStats(null);
        await loadStats();
      } else {
        toast.error('Error al eliminar casos de prueba');
      }
    } catch (error) {
      console.error('Error clearing cases:', error);
      toast.error('Error al eliminar casos de prueba');
    } finally {
      setIsClearingCases(false);
    }
  }, [loadStats]);

  // Analizar similitudes usando la Edge Function
  const analyzeText = useCallback(async () => {
    if (!newText.trim()) {
      toast.error('Por favor ingresa un texto para analizar');
      return;
    }

    if (testCases.length === 0) {
      toast.error('No hay casos de prueba disponibles para comparar');
      return;
    }

    setIsAnalyzing(true);
    setSimilarities([]);
    setNewEmbedding(null);

    try {
      const referenceTexts = testCases.map(testCase => {
        const combinedText = [
          testCase.suceso,
          testCase.pensamientos_automaticos,
          testCase.emociones_principales.join(', ')
        ].filter(Boolean).join(' | ');
        
        return combinedText;
      });

      const { data, error } = await supabase.functions.invoke('analyze-embedding', {
        body: {
          new_text: newText.trim(),
          reference_texts: referenceTexts
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Error al llamar al servicio de análisis');
        return;
      }

      const response = data as AnalyzeEmbeddingResponse;
      
      if (!response.success) {
        console.error('Analysis failed:', response.error);
        toast.error(`Error en el análisis: ${response.error}`);
        return;
      }

      if (response.similarities) {
        const processedSimilarities: SimilarityResult[] = response.similarities.map((sim, index) => ({
          text1: newText.trim(),
          text2: referenceTexts[index] || `Caso ${index + 1}`,
          similarity: sim.similarity,
          distance: sim.distance
        }));

        setSimilarities(processedSimilarities);
      }

      if (response.new_embedding) {
        setNewEmbedding(response.new_embedding);
      }

      toast.success(`Análisis completado. ${response.similarities?.length || 0} comparaciones realizadas.`);

    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error('Error inesperado durante el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  }, [newText, testCases]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTestCases();
    loadStats();
  }, [loadTestCases, loadStats]);

  if (profile?.role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        
        <div className="flex items-center gap-3">
          <Beaker className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Laboratorio de Embeddings</h1>
            <p className="text-muted-foreground">
              Analiza y compara representaciones vectoriales de textos emocionales
            </p>
          </div>
        </div>
      </div>

      {/* Estado de carga global */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando casos de prueba...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Componentes modulares */}
          <EmbeddingStats stats={stats} />
          
          <TestCaseManager
            isCreatingCases={isCreatingCases}
            isClearingCases={isClearingCases}
            isLoadingData={isLoading}
            onCreateAdditionalCases={handleCreateAdditionalCases}
            onReloadData={loadTestCases}
            onClearAllCases={handleClearAllCases}
          />
          
          <TestCasesList testCases={testCases} />
          
          <TextAnalyzer
            newText={newText}
            isAnalyzing={isAnalyzing}
            hasTestCases={testCases.length > 0}
            onTextChange={setNewText}
            onAnalyze={analyzeText}
          />
          
          <SimilarityResults similarities={similarities} />
          
          <EmbeddingDisplay embedding={newEmbedding} />

          {/* Insights avanzados */}
          {testCases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análisis Avanzado de Embeddings
              </h2>
              <EmbeddingInsights testCases={testCases} />
            </div>
          )}
        </>
      )}
    </div>
  );
}