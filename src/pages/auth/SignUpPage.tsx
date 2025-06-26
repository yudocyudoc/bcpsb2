// src/pages/auth/SignUpPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Opcional: Campos adicionales para el perfil que se pueden pasar como metadata
  // const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // Para mensajes de éxito/confirmación
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp({
        email,
        password,
        // Opciones adicionales, como redirectTo para verificación de email
        // options: {
        //   emailRedirectTo: `${window.location.origin}/`, 
        //   data: { // Estos datos se pueden usar en tu trigger de DB handle_new_user
        //     username: username, 
        //   }
        // }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Si Supabase está configurado para requerir confirmación de email:
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         setMessage("¡Registro casi listo! Revisa tu correo electrónico para confirmar tu cuenta.");
         // No redirigir aún, esperar confirmación.
      } else if (data.session) {
        // Si no hay confirmación de email o ya está confirmada (o es un login automático después de signup)
        console.log("Registro y login automático exitosos (o sin confirmación requerida). Redirigiendo...");
        navigate('/'); // Redirige a la página principal
      } else {
        // Caso raro, el usuario se creó pero no hay sesión (puede pasar si confirmación es requerida)
        setMessage("¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta o intenta iniciar sesión.");
      }

    } catch (err: unknown) {
        console.error("Error en SignUp:", err);
        let message = "Ocurrió un error durante el registro.";
        if (err instanceof Error) {
          // Si 'err' es una instancia de Error (como AuthError de Supabase), podemos acceder a 'err.message'.
          message = err.message || message;
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
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Únete al Botiquín Emocional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert variant="default"> {/* O 'success' si tienes esa variante */}
                <AlertCircle className="h-4 w-4" /> {/* Podrías usar CheckCircle aquí */}
                <AlertTitle>Información</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {/* Opcional: Campo de Username
            <div className="space-y-1.5">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            */}
            <div className="space-y-1.5">
              <Label htmlFor="email-signup">Correo Electrónico</Label>
              <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-signup">Contraseña</Label>
              <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}