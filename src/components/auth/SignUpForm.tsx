// src/components/auth/SignUpForm.tsx
import { useState, useEffect } from 'react';
import type {FormEvent, KeyboardEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Cambiado aquí
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { AuthInput } from './AuthInput';
import { mapSupabaseAuthError } from '@/lib/utils';
import { toast } from 'sonner'; // Importar toast de sonner


interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [loading, setLoading] = useState(false); // El loading global de useAuth se puede usar
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, isLoading, authError: globalAuthError } = useAuth(); // Usar isLoading y authError del contexto

  useEffect(() => {
    // Si hay un error global del contexto después de una acción, mostrarlo localmente
    if (globalAuthError && !isLoading) { // Solo si no estamos cargando activamente
        setFormError(mapSupabaseAuthError(globalAuthError));
    }
  }, [globalAuthError, isLoading]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email || !password || !confirmPassword) {
      toast.warning("Campos incompletos", { // Toast de validación
        description: "Por favor, completa todos los campos requeridos.",
      });
      setFormError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      toast.warning("Error de validación", { // Toast de validación
        description: "Las contraseñas no coinciden.",
      });
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) { // O tu política de contraseña
      toast.warning("Contraseña insegura", { // Toast de validación
        description: "La contraseña debe tener al menos 6 caracteres.",
      });
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // setLoading(true); // Ya no es necesario si usamos isLoading del contexto
    const emailToSubmit = email.trim();

    const { data, error } = await signUp({ email: emailToSubmit, password });

    if (error) {
      setFormError(mapSupabaseAuthError(error));
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Este caso puede ocurrir si la confirmación de email está DESHABILITADA y el usuario se loguea inmediatamente.
      // O si hay algún otro flujo donde el usuario se crea pero no se espera confirmación.
      // Generalmente, onAuthStateChange en AuthContext manejará el login.
      // Aquí podrías limpiar el formulario y redirigir o mostrar un mensaje de "Registro y login exitoso".
      setSuccessMessage("¡Cuenta creada y sesión iniciada!");
      // No es necesario limpiar el formulario aquí si onAuthStateChange redirige.
    } else {
      // Este es el caso más común: usuario creado, se necesita confirmación de email.
      setSuccessMessage(`¡Cuenta creada! Revisa tu correo ${emailToSubmit} para confirmar tu cuenta.`);
      setEmail(''); setPassword(''); setConfirmPassword(''); // Limpiar formulario
    }
    // setLoading(false); // Ya no es necesario
  };
  
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (successMessage) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Icons.CheckCircle className="mx-auto h-12 w-12 text-green-500" /> {/* Mantener icono */}
          <CardTitle className="text-xl md:text-2xl font-bold">¡Revisa tu Correo!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-6 md:p-8">
          <p className="text-sm text-muted-foreground">{successMessage}</p>
          <Button onClick={onSwitchToLogin} className="w-full h-9 md:h-10">
            Ir a Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para comenzar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4"> {/* Ajustado space-y para consistencia con el form y el div de error */}
        {/* Contenedor para el mensaje de error para reservar espacio y evitar CLS */}
        <div className="min-h-[52px]"> {/* Basado en padding de Alert (py-3) y una línea de texto. Ajusta si es necesario. */}
          {formError && (
            <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email" id="email-signup" type="email" icon="Mail"
            placeholder="tu@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} // Mantener onKeyPress
            disabled={isLoading} required autoComplete="email"
          />
          <AuthInput
            label="Contraseña" id="password-signup" type="password" icon="Lock"
            placeholder="•••••••• (mín. 6 caracteres)" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} // Mantener onKeyPress
            disabled={isLoading} required autoComplete="new-password"
          />
          <AuthInput
            label="Confirmar Contraseña" id="confirm-password-signup" type="password" icon="Lock"
            placeholder="••••••••" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={handleKeyPress} // Mantener onKeyPress
            disabled={isLoading} required autoComplete="new-password"
          />
          <Button type="submit" disabled={isLoading} className="w-full h-9 text-sm md:h-10 md:text-base">
            {isLoading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground mx-auto">
          ¿Ya tienes cuenta?{' '}
          <Button variant="link" onClick={onSwitchToLogin} disabled={isLoading} className="p-0 h-auto">
            Inicia sesión aquí
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};