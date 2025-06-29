// src/components/admin/embedding-lab/TextAnalyzer.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Zap, Loader2 } from 'lucide-react';

interface TextAnalyzerProps {
  newText: string;
  isAnalyzing: boolean;
  hasTestCases: boolean;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
}

export function TextAnalyzer({
  newText,
  isAnalyzing,
  hasTestCases,
  onTextChange,
  onAnalyze
}: TextAnalyzerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Análisis de Nuevo Texto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Texto a analizar:</label>
          <Textarea
            value={newText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Ingresa el texto que quieres analizar y comparar con los casos existentes..."
            className="mt-1"
            rows={3}
          />
        </div>
        
        <Button 
          onClick={onAnalyze} 
          disabled={isAnalyzing || !newText.trim() || !hasTestCases}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Analizar Similitudes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}