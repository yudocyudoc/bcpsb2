// src/components/admin/embedding-lab/TestCaseManager.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface TestCaseManagerProps {
  isCreatingCases: boolean;
  isClearingCases: boolean;
  isLoadingData: boolean;
  onCreateAdditionalCases: () => void;
  onReloadData: () => void;
  onClearAllCases: () => void;
}

export function TestCaseManager({
  isCreatingCases,
  isClearingCases,
  isLoadingData,
  onCreateAdditionalCases,
  onReloadData,
  onClearAllCases
}: TestCaseManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Gestión de Casos de Prueba
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={onCreateAdditionalCases}
            disabled={isCreatingCases}
            className="flex items-center gap-2"
            variant="default"
          >
            {isCreatingCases ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando casos...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear 12 Casos Adicionales
              </>
            )}
          </Button>

          <Button 
            onClick={onReloadData}
            disabled={isLoadingData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar Datos
          </Button>

          <Button 
            onClick={onClearAllCases}
            disabled={isClearingCases}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isClearingCases ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Limpiar Todos
              </>
            )}
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Información Importante</AlertTitle>
          <AlertDescription>
            Los casos de prueba se crean para el usuario ID: <code>584266c3-5623-4e63-91b1-b1b962568ab5</code>.
            Los embeddings se generan automáticamente mediante una Edge Function.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}