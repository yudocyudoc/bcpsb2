// src/components/admin/embedding-lab/TestCasesList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, AlertCircle, Activity } from 'lucide-react';
import { EmbeddingTestCase } from '@/types/embeddingLab';




interface TestCasesListProps {
  testCases: EmbeddingTestCase[];
}

export function TestCasesList({ testCases }: TestCasesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Casos de Prueba Existentes ({testCases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testCases.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No hay casos disponibles</AlertTitle>
            <AlertDescription>
              No se encontraron entradas con embeddings para el usuario de prueba.
              Usa el botón "Crear 12 Casos Adicionales" para generar datos de prueba.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div key={testCase.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Caso {index + 1}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(testCase.created_at).toLocaleString()}
                  </span>
                </div>
                
                {testCase.suceso && (
                  <div>
                    <strong className="text-sm">Suceso:</strong>
                    <p className="text-sm text-muted-foreground">{testCase.suceso}</p>
                  </div>
                )}
                
                {testCase.pensamientos_automaticos && (
                  <div>
                    <strong className="text-sm">Pensamientos:</strong>
                    <p className="text-sm text-muted-foreground">{testCase.pensamientos_automaticos}</p>
                  </div>
                )}
                
                {testCase.emociones_principales.length > 0 && (
                  <div>
                    <strong className="text-sm">Emociones:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testCase.emociones_principales.map((emotion, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Embedding: {testCase.embedding.length} dimensiones
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}