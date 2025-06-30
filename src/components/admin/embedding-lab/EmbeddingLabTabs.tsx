// src/components/admin/embedding-lab/EmbeddingLabTabs.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Search, 
  BarChart3, 
  Brain,
  TrendingUp
} from 'lucide-react';

// Importar componentes existentes
import { EmbeddingStats } from './EmbeddingStats';
import { TestCaseManager } from './TestCaseManager';
import { TestCasesList } from './TestCasesList';
import { TextAnalyzer } from './TextAnalyzer';
import { SimilarityResults } from './SimilarityResults';
import { EmbeddingDisplay } from './EmbeddingDisplay';
import { EmbeddingInsights } from './EmbeddingInsights';
// ✅ AGREGAR IMPORT DEL COMPONENTE DE CHARTS
import { EmbeddingCharts } from './EmbeddingCharts';

// Importar tipos
import { EmbeddingTestCase, TestCaseStats, SimilarityResult } from '@/types/embeddingLab';

interface EmbeddingLabTabsProps {
  // Props para estadísticas y gestión
  stats: TestCaseStats | null;
  testCases: EmbeddingTestCase[];
  isCreatingCases: boolean;
  isClearingCases: boolean;
  isLoadingData: boolean;
  onCreateAdditionalCases: () => void;
  onReloadData: () => void;
  onClearAllCases: () => void;
  
  // Props para análisis
  newText: string;
  isAnalyzing: boolean;
  similarities: SimilarityResult[];
  newEmbedding: number[] | null;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
}

export function EmbeddingLabTabs({
  stats,
  testCases,
  isCreatingCases,
  isClearingCases,
  isLoadingData,
  onCreateAdditionalCases,
  onReloadData,
  onClearAllCases,
  newText,
  isAnalyzing,
  similarities,
  newEmbedding,
  onTextChange,
  onAnalyze
}: EmbeddingLabTabsProps) {
  const [activeTab, setActiveTab] = useState('gestion');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="gestion" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Gestión</span>
        </TabsTrigger>
        <TabsTrigger value="analisis" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Análisis</span>
        </TabsTrigger>
        <TabsTrigger value="visualizaciones" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Visualizaciones</span>
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">Insights</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Gestión */}
      <TabsContent value="gestion" className="space-y-6 mt-6">
        <EmbeddingStats stats={stats} />
        
        <TestCaseManager
          isCreatingCases={isCreatingCases}
          isClearingCases={isClearingCases}
          isLoadingData={isLoadingData}
          onCreateAdditionalCases={onCreateAdditionalCases}
          onReloadData={onReloadData}
          onClearAllCases={onClearAllCases}
        />
        
        <TestCasesList testCases={testCases} />
      </TabsContent>

      {/* Tab 2: Análisis */}
      <TabsContent value="analisis" className="space-y-6 mt-6">
        <TextAnalyzer
          newText={newText}
          isAnalyzing={isAnalyzing}
          hasTestCases={testCases.length > 0}
          onTextChange={onTextChange}
          onAnalyze={onAnalyze}
        />
        
        {similarities.length > 0 && (
          <SimilarityResults similarities={similarities} />
        )}
        
        {newEmbedding && (
          <EmbeddingDisplay embedding={newEmbedding} />
        )}
      </TabsContent>

      {/* Tab 3: Visualizaciones - ✅ USAR EL COMPONENTE REAL */}
      <TabsContent value="visualizaciones" className="space-y-6 mt-6">
        <EmbeddingCharts testCases={testCases} />
      </TabsContent>

      {/* Tab 4: Insights Avanzados */}
      <TabsContent value="insights" className="space-y-6 mt-6">
        {testCases.length > 0 ? (
          <EmbeddingInsights testCases={testCases} />
        ) : (
          <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos para insights</h3>
              <p className="text-gray-500">
                Ve a la pestaña de Gestión para crear casos de prueba
              </p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}