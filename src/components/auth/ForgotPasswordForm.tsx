// src/components/auth/ForgotPasswordForm.tsx
import { useState} from 'react';
import type {FormEvent, KeyboardEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Cambiado aquí
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { AuthInput } from './AuthInput';
import { mapSupabaseAuthError } from '@/lib/utils';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email) {
      setFormError('Por favor ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    if (error) {
      setFormError(mapSupabaseAuthError(error));
    } else {
      setSuccessMessage(`Si existe una cuenta para ${email}, recibirás un correo con instrucciones para reestablecer tu contraseña.`);
      setEmail(''); // Limpiar input
    }
    setLoading(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <Icons.ShieldQuestion className="mx-auto h-10 w-10 text-primary mb-2" />
        <CardTitle className="text-2xl font-bold">Reestablecer Contraseña</CardTitle>
        <CardDescription>Ingresa tu correo para recibir instrucciones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4"> {/* Ajustado space-y para consistencia */}
        {/* Contenedor para los mensajes para reservar espacio y evitar CLS */}
        {/* Esta altura debe acomodar el mensaje más largo (éxito o error) */}
        <div className="min-h-[70px]"> {/* El mensaje de éxito puede ser largo. Ajusta esta altura. */}
          {formError && (
            <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>
          )}
          {successMessage && !formError && ( /* Mostrar mensaje de éxito solo si no hay error */
            <Alert variant="default"><AlertDescription>{successMessage}</AlertDescription></Alert>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email" id="email-forgot" type="email" icon="Mail"
            placeholder="tu@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress}
            disabled={loading || !!successMessage} // Deshabilitar si ya se envió
            required autoComplete="email"
          />
          <Button type="submit" disabled={loading || !!successMessage} className="w-full">
            {loading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <Button variant="link" onClick={onSwitchToLogin} disabled={loading} className="p-0 h-auto mx-auto">
          Volver a Iniciar Sesión
        </Button>
      </CardFooter>
    </Card>
  );
};