import React, { useState } from 'react';
//import { supabase } from '../lib/supabaseClient'; // Asegúrate que la ruta a tu cliente Supabase sea correcta
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SearchTestPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user) {
        setError("El campo de búsqueda no puede estar vacío y debes estar autenticado.");
        return;
    };

    setIsLoading(true);
    setError(null);
    setResults(null);

 


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Página de Prueba de Búsqueda</h1>
      <p className="mb-6">Esta es una página de prueba para la funcionalidad de búsqueda.</p>

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6 max-w-md">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe algo sobre cómo te sientes..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </form>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md"><h3 className="font-bold">Error</h3><p>{error}</p></div>}
      {results && <div><h2 className="text-xl font-semibold mb-4">Resultados</h2><pre className="p-4 bg-muted rounded-md overflow-x-auto">{JSON.stringify(results, null, 2)}</pre></div>}
    </div>
  );
}
};