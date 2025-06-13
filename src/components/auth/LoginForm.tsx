// src/components/auth/LoginForm.tsx
import { useState, useEffect } from 'react'; // Añadir useEffect
import type { FormEvent, KeyboardEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Cambiado aquí
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // CardTitle, etc. no se usan en CardContent
//import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Separator } from '@/components/ui/separator'; // Ya no se usa así
import { Icons } from '@/components/ui/icons';
import { AuthInput } from './AuthInput'; // O usa Input directamente
import { mapSupabaseAuthError } from '@/lib/utils';
import type { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner'; // Importar toast de sonner para validaciones locales si es necesario
import { cn } from '@/lib/utils'; // Importante para combinar clases

import loginImageSrc from '@/assets/login_pic.webp';


interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> { // Para pasar className, etc.
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  className, // Para que AuthApp pueda pasar clases si es necesario (aunque no se usa en este caso)
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [loading, setLoading] = useState(false); // Se usará isLoading del contexto
  const [formError, setFormError] = useState<string | null>(null);

  // isLoading y authError del contexto. Renombrar authError para evitar colisión.
  const { signInWithPassword, signInWithOAuth, isLoading, authError: globalAuthError } = useAuth();

  useEffect(() => {
    // Si hay un error global del contexto después de una acción, mostrarlo localmente
    // Esto es útil si quieres mostrar el error en un <Alert> además del toast global.
    if (globalAuthError && !isLoading) { 
        setFormError(mapSupabaseAuthError(globalAuthError));
    }
  }, [globalAuthError, isLoading]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setFormError(null);

    if (!email || !password) {
      // Ejemplo de uso de toast de sonner para validación del lado del cliente
      toast.warning("Campos incompletos", {
        description: "Por favor, ingresa tu correo y contraseña.",
      });
      setFormError('Por favor completa todos los campos.'); // También puedes mantener el error local
      return;
    }

    // signInWithPassword (del AuthContext) se encargará de:
    // 1. Poner isLoading a true/false.
    // 2. Mostrar toasts de sonner para éxito/error de la operación de Supabase.
    // El useEffect de arriba se encargará de poner el error en formError si deseas mostrarlo también en un Alert.
    await signInWithPassword({ email, password });
  };

  const handleOAuthLogin = async (provider: Provider) => {
    setFormError(null);
    // signInWithOAuth (del AuthContext) se encargará de:
    // 1. Poner isLoading a true/false.
    // 2. Mostrar toasts de sonner para éxito/error de la operación de Supabase.
    await signInWithOAuth(provider);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevenir submit doble si ya está cargando
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden shadow-xl border md:border-border py-0">
        {/* ^^^ Añadido shadow-xl y border para que se vea más como un panel */}
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Columna 1: Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 md:p-8">
            {/* Encabezado del formulario */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Iniciar Sesión</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Accede a tu cuenta para continuar.
              </p>
            </div>

            {/* Contenedor para el mensaje de error para reservar espacio y evitar CLS */}
            <div className="min-h-[44px]"> {/* Ajusta esta altura si el mensaje de error puede ocupar más (ej. múltiples líneas) */}
              {formError && (
                <div className="bg-destructive/15 p-3 rounded-md text-center text-sm text-destructive">
                  {formError}
                </div>
              )}
            </div>

            {/* Campos del formulario */}
            <div className="grid gap-4"> {/* Usamos grid gap-4 para espacio entre inputs */}
              <AuthInput // O usa Label e Input directamente
                label="Email"
                id="email-login"
                type="email"
                icon="Mail"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading} // Usar isLoading del contexto
                required
                autoComplete="email"
              />
              <div className="grid gap-1"> {/* Div para agrupar Label y Link "Forgot Password" */}
                <div className="flex items-center">
                  <Label htmlFor="password-login" className="text-sm font-medium">Contraseña</Label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    disabled={isLoading} // Usar isLoading del contexto
                    className="ml-auto text-sm font-medium text-primary hover:underline underline-offset-2 focus:outline-none"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <AuthInput // O usa Input directamente
                  label=""
                  id="password-login"
                  type="password"
                  icon="Lock"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading} // Usar isLoading del contexto
                  required
                  autoComplete="current-password"
                  // Quita el Label de AuthInput si lo manejas externamente como aquí
                  // O ajusta AuthInput para que el Label sea opcional.
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-10"> {/* h-10 para altura */}
              {isLoading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            {/* Separador "Or continue with" */}
            <div className="relative text-center text-sm after:absolute after:inset-x-0 after:top-1/2 after:z-0 after:h-px after:bg-border">
              {/* ^^^ Simplificado el 'after' para solo la línea */}
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>

            {/* Botones OAuth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={isLoading} className="w-full h-10">
                {isLoading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
                <Icons.Google className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="outline" onClick={() => handleOAuthLogin('facebook')} disabled={isLoading} className="w-full h-10">
                {isLoading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
                <Icons.Facebook className="mr-2 h-4 w-4 text-[#1877F2]" /> Facebook
              </Button>
            </div>

            {/* Enlace de Registro */}
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                disabled={isLoading} // Usar isLoading del contexto
                className="font-medium text-primary hover:underline underline-offset-4 focus:outline-none"
              >
                Regístrate aquí
              </button>
            </div>
          </form>

          {/* Columna 2: Imagen */}
          <div className=" p-2 ">
            {/* ^^^ md:flex para mostrarlo. items-center justify-center para la imagen interna */}
            <img
              src={loginImageSrc}
              width="800" // Reemplaza con el ancho real de tu imagen
              height="600" // Reemplaza con el alto real de tu imagen
              alt="Authentication"
              // La clase de Shadcn/ui es: className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              // Para que funcione 'absolute inset-0', el div padre debe ser 'relative'.
              // Como este div ya es el contenedor directo, podemos hacerla más simple:
              className="h-full w-full object-contain bg-muted rounded-lg dark:brightness-[0.2] dark:grayscale"
              // ^^^ object-contain para verla completa, max-w-* para controlarla.
              // O si quieres que llene como en Shadcn/ui (pero puede ser que necesite position:absolute)
              // className="h-full w-full object-cover rounded-lg dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      {/* Texto Legal */}
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Al continuar, aceptas nuestros <a href="/terms">Términos de Servicio</a>{" "}
        y <a href="/privacy">Política de Privacidad</a>.
      </div>
    </div>
  );
};