// src/pages/auth/LoginPage.tsx 

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx'; // Tu AuthContext
import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert.tsx";
import { AlertCircle } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Volvemos a usar la función del contexto

      console.log("LOGIN_PAGE: Verificando 'fetch' en la instancia de Supabase que usará signInWithPassword...");
  console.log("LOGIN_PAGE: globalThis.fetch:", globalThis.fetch);
      const { error: signInError } = await signInWithPassword({ email, password }); 
      if (signInError) {
        throw signInError;
      }
      // El onAuthStateChange en AuthContext se encargará de setear el usuario
      // y el perfil. La navegación puede ocurrir aquí o ser manejada por un ProtectedRoute.
      console.log("Login exitoso, AuthContext se encargará de la sesión y redirección si es necesario.");
       navigate('/'); // Redirige a la página principal después del login
    } catch (err: unknown) {
      console.error("Error en Login:", err);
      let message = "Ocurrió un error al iniciar sesión.";
        if (err instanceof Error) {
          // Si 'err' es una instancia de Error, podemos acceder a 'err.message'.
          // Mantenemos el fallback por si err.message es una cadena vacía.
          message = err.message; // Mostrar el mensaje de error de Supabase directamente es útil aquí
        } else if (typeof err === 'string' && err.length > 0) {
          message = err;
        }
        setError(message);
    } finally {      
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al Botiquín Emocional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="nombre de usuario o correo electrónico"
                placeholder="escribe tu correoe lectrónico"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="********"
          
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}