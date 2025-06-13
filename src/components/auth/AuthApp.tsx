// src/components/auth/AuthApp.tsx
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const AuthView = {
  LOGIN: 'LOGIN',
  SIGN_UP: 'SIGN_UP',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD'
} as const;
const EnvironmentCheck: React.FC = () => (
  <div>Please configure your environment variables</div>
);

export const AuthApp: React.FC = () => {
  // 'loadingInitial' se llama 'isLoading' en AuthContext
  const [currentView, setCurrentView] = useState<typeof AuthView[keyof typeof AuthView]>(AuthView.LOGIN);

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return <EnvironmentCheck />;
  }

  const handleViewChange = (newView: typeof AuthView[keyof typeof AuthView]) => {
    setCurrentView(newView);
  };



  let authComponentToRender;
  switch (currentView) {
    case AuthView.SIGN_UP:
      authComponentToRender = <SignUpForm onSwitchToLogin={() => handleViewChange(AuthView.LOGIN)} />;
      break;
    case AuthView.FORGOT_PASSWORD:
      authComponentToRender = <ForgotPasswordForm onSwitchToLogin={() => handleViewChange(AuthView.LOGIN)} />;
      break;
    case AuthView.LOGIN:
    default:
      authComponentToRender = (
        <LoginForm
          onSwitchToSignUp={() => handleViewChange(AuthView.SIGN_UP)}
          onSwitchToForgotPassword={() => handleViewChange(AuthView.FORGOT_PASSWORD)}
        />
      );
  }

  return (
    // Contenedor principal que centra el componente de autenticación
    <div className="flex min-h-svh flex-col justify-center bg-background p-6 md:p-10"> {/* Se podría quitar items-center si se usa mx-auto en el hijo */}
      {/* Contenedor que define el ancho máximo del componente de autenticación */}
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto"> {/* Añadido mx-auto */}
        {authComponentToRender}
      </div>
    </div>
  );
};