// src/pages/admin/EmbeddingLabPage.tsx
import  { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';
import { ROLES } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Beaker, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { EmbeddingLabTabs } from '@/components/admin/embedding-lab/EmbeddingLabTabs';


// Importar servicios
import { 
  createAdditionalTestCases, 
  getTestCaseStats, 
  clearAllTestCases 
} from '@/services/embeddingTestService';




import { EmbeddingTestCase, TestCaseStats, SimilarityResult } from '@/types/embeddingLab';



export function EmbeddingLabPage() {
  const { profile } = useAuth();
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
      .map((entry: any) => {
        try {
            const embeddingData = entry.embedding;
            if (!embeddingData) {
              console.warn(`No embedding data for entry ${entry.id}`);
              return null;
            }

            const embedding = typeof embeddingData === 'string' 
              ? JSON.parse(embeddingData)
              : embeddingData;
              
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
 // Reemplazar toda la función analyzeText con esto:
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
      // Primero obtener embedding del texto nuevo
      const { data: newEmbeddingData, error: newError } = await supabase.functions.invoke('analyze-embedding', {
        body: {
          mode: 'single',
          text1: newText.trim()
        }
      });
  
      if (newError || !newEmbeddingData.success) {
        throw new Error('Error obteniendo embedding del texto nuevo');
      }
  
      const newEmbedding = newEmbeddingData.embedding;
      setNewEmbedding(newEmbedding);
  
      // Calcular similitudes localmente con los embeddings existentes
      const similarities: SimilarityResult[] = testCases.map((testCase) => {
        // Función de similitud coseno local
        const cosineSimilarity = (a: number[], b: number[]): number => {
          const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
          const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
          const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
          return dotProduct / (magnitudeA * magnitudeB);
        };
  
        const similarity = cosineSimilarity(newEmbedding, testCase.embedding);
        
        return {
          text1: newText.trim(),
          text2: `${testCase.suceso} (${testCase.emociones_principales.join(', ')})`,
          similarity: Number((similarity * 100).toFixed(1)),
          distance: Number((1 - similarity).toFixed(3))
        };
      });
  
      setSimilarities(similarities);
      toast.success(`✅ Análisis completado. ${similarities.length} comparaciones realizadas.`);
  
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
    <EmbeddingLabTabs
      stats={stats}
      testCases={testCases}
      isCreatingCases={isCreatingCases}
      isClearingCases={isClearingCases}
      isLoadingData={isLoading}
      onCreateAdditionalCases={handleCreateAdditionalCases}
      onReloadData={loadTestCases}
      onClearAllCases={handleClearAllCases}
      newText={newText}
      isAnalyzing={isAnalyzing}
      similarities={similarities}
      newEmbedding={newEmbedding}
      onTextChange={setNewText}
      onAnalyze={analyzeText}
    />


      )}
    </div>
  );
}