// src/contexts/AuthContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    type ReactNode,
  } from 'react';
  import { AuthError } from '@supabase/supabase-js'; // Importar como valor
  import type { // Tipos
    Session,
    User as SupabaseUser, // Renombrar para claridad
    AuthChangeEvent,
    SignUpWithPasswordCredentials,
    SignInWithPasswordCredentials,
    Provider, // Para OAuth si lo necesitas
  } from '@supabase/supabase-js';
  import { supabase } from '@/supabase/client'; // Ajusta la ruta
  import type { Database } from '@/supabase/database.types';
  import { toast } from "sonner"; // Importar toast de sonner
  import { mapSupabaseAuthError } from '@/lib/utils'; // Asegúrate que esta ruta sea correcta
  
  // Tipo para el perfil obtenido de la tabla 'profiles'
  // Asegúrate que coincida con tu tabla 'profiles' (id, username, full_name, avatar_url, role)
  type UserProfileFromDB = Database['public']['Tables']['profiles']['Row'];
  
  // Interfaz para el perfil que usará la aplicación.
  // Aquí puedes mapear o añadir campos si es necesario.
  interface AppUserProfile {
    id: string;
    email?: string | null; // Lo tomaremos del SupabaseUser
    username: UserProfileFromDB['username'];
    full_name: UserProfileFromDB['full_name'];
    avatar_url: UserProfileFromDB['avatar_url'];
    role: UserProfileFromDB['role'] | 'user'; // Rol con fallback a 'user'
  }
  
  // Interfaz para el valor del contexto
  interface AuthContextType {
    session: Session | null;
    user: SupabaseUser | null;
    profile: AppUserProfile | null;
    role: AppUserProfile['role'] | null; // El rol específico del perfil
    isLoading: boolean; // Estado de carga principal (sesión y perfil inicial)
    authError: AuthError | null;
    signUp: (credentials: SignUpWithPasswordCredentials) => ReturnType<typeof supabase.auth.signUp>;
    signInWithPassword: (credentials: SignInWithPasswordCredentials) => ReturnType<typeof supabase.auth.signInWithPassword>;
    signInWithOAuth: (provider: Provider) => ReturnType<typeof supabase.auth.signInWithOAuth>; // Añadido OAuth
    signOut: () => ReturnType<typeof supabase.auth.signOut>;
    resetPasswordForEmail: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>; // Añadido
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  // --- Función helper para obtener el perfil (fuera del componente) ---
  async function fetchAppUserProfile(userId: string, userEmail?: string | null): Promise<AppUserProfile | null> {
    // console.log(`[AuthHelper] fetchAppUserProfile: START - UserID: ${userId}`);
  
    if (!userId) {
      // console.warn("[AuthHelper] fetchAppUserProfile: No userId provided.");
      return null;
    }
    if (!supabase || !supabase.from) { // Verificación del cliente Supabase
      console.error("[AuthHelper] fetchAppUserProfile: Supabase client or 'from' method is not available!");
      return null;
    }
  
    try {
      const { data: dbProfile, error } = await supabase // Añadir status para log
        .from('profiles')
        .select('id, username, full_name, avatar_url, role') // Columnas de tu tabla 'profiles'
        .eq('id', userId)
        .single(); // Esperamos un solo registro
  
   
      
      // PGRST116: "The result contains 0 rows" - esto es un caso esperado si no hay perfil aún
      if (error && error.code !== 'PGRST116') { 
        // console.error('[AuthHelper] fetchAppUserProfile: Error from Supabase (not PGRST116):', error);
        return null; 
      }
  
      if (dbProfile) {
        // console.log(`[AuthHelper] fetchAppUserProfile: dbProfile found. Role from DB: '${dbProfile.role}'. Assigned role: '${dbProfile.role || 'user'}'`);
        return {
          id: dbProfile.id,
          email: userEmail || null, // Añadir el email del SupabaseUser
          username: dbProfile.username,
          full_name: dbProfile.full_name,
          avatar_url: dbProfile.avatar_url,
          role: dbProfile.role || 'user', // Fallback si el rol en DB es null
        };
      }
      // Si dbProfile es null (porque error.code fue PGRST116 o no hubo error pero no data)
      // Devolvemos un perfil básico con rol por defecto, usando el ID y email del usuario de auth.
      return {
          id: userId,
          email: userEmail || null,
          username: null, // O un valor por defecto si lo deseas
          full_name: null,
          avatar_url: null,
          role: 'user', // Rol por defecto si no se encuentra perfil en DB
      };
  
    } catch (e: unknown) {
      // console.error('[AuthHelper] fetchAppUserProfile: EXCEPTION caught:', exceptionMessage, e);
      return null; // O un perfil por defecto en caso de excepción
    }
  }
  // --- Fin Función helper ---
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [sessionState, setSessionState] = useState<Session | null>(null);
    const [userState, setUserState] = useState<SupabaseUser | null>(null);
    const [profileState, setProfileState] = useState<AppUserProfile | null>(null);
    // roleState ya no es necesario, se deriva de profileState.role
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [authErrorState, setAuthErrorState] = useState<AuthError | null>(null);
  
    // Efecto para la sesión inicial y listener de cambios de autenticación
    useEffect(() => {
      // console.log("[AuthProvider] Mount: Setting up auth listener.");
      // setIsLoading(true); // El estado inicial de isLoading ya es true
  
      supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
        // console.log("[AuthProvider] Initial getSession() result. Session:", initialSession ? 'Exists' : 'No session');
        setSessionState(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUserState(currentUser);
        // Si no hay usuario después de obtener la sesión inicial, terminamos la carga.
        // Si hay un usuario, el segundo useEffect (desencadenado por setUserState)
        // se encargará de setIsLoading(false) después de cargar el perfil.
        if (!currentUser) { 
          setIsLoading(false); // Terminar carga inicial
      }
    });
  
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          // console.log(`[AuthProvider] onAuthStateChange - Event: ${event}, User: ${session?.user?.id || 'null'}`);
          const newSupabaseUser = session?.user ?? null;

          setSessionState(session);
          // Solo actualiza userState si las propiedades esenciales del usuario han cambiado realmente
          // para evitar re-renders innecesarios por nuevas referencias de objeto con los mismos datos.
          setUserState(prevUser => {
            if (prevUser?.id === newSupabaseUser?.id &&
                prevUser?.email === newSupabaseUser?.email &&
                prevUser?.updated_at === newSupabaseUser?.updated_at) {
            console.log('[AuthContext] setUserState: User data unchanged, returning previous user instance.');

              return prevUser; // Devuelve la instancia anterior si no hay cambios
            }
           console.log('[AuthContext] setUserState: User data changed or new user, updating user instance.');
            return newSupabaseUser; // Actualiza con la nueva instancia del usuario
          });
          setAuthErrorState(null);
  
          if (event === 'SIGNED_OUT') {
            setProfileState(null);
            if (isLoading) setIsLoading(false);
          } else if (event === 'USER_UPDATED' && newSupabaseUser) {
            // El cambio en userState activará el segundo useEffect para recargar el perfil.
            // isLoading será manejado por el segundo useEffect.
          } else if (event === 'INITIAL_SESSION' && !newSupabaseUser && isLoading) {
            // Si es la sesión inicial y no hay usuario, y estábamos cargando
          setIsLoading(false);
        }
          // Si es SIGNED_IN o INITIAL_SESSION y hay usuario, el siguiente useEffect se encargará del perfil.
          // isLoading se manejará en el segundo useEffect después de la carga del perfil.
        }
      );
  
      return () => {
        // console.log("[AuthProvider] Unmount: Cleaning up auth listener.");
        authListener?.subscription?.unsubscribe();
      };
    }, []); // Este efecto solo debe ejecutarse una vez al montar para configurar listeners.
  
    // Efecto para cargar/limpiar el perfil cuando userState cambia
    useEffect(() => {
      if (userState) {
        // console.log(`[AuthProvider] User available (${userState.id}). Fetching profile.`);
        setIsLoading(true); // Indicar que estamos cargando el perfil
        fetchAppUserProfile(userState.id, userState.email)
        .then(newAppProfile => {
          setProfileState(prevProfile => {
            // Solo actualiza profileState si las propiedades esenciales del perfil han cambiado realmente
            if (prevProfile && newAppProfile &&
                prevProfile.id === newAppProfile.id &&
                prevProfile.email === newAppProfile.email &&
                prevProfile.username === newAppProfile.username &&
                prevProfile.full_name === newAppProfile.full_name &&
                prevProfile.avatar_url === newAppProfile.avatar_url &&
                prevProfile.role === newAppProfile.role) {
              console.log('[AuthContext] setProfileState: Profile data unchanged, returning previous profile instance.');
              return prevProfile; // Devuelve la instancia anterior
            }
           console.log('[AuthContext] setProfileState: Profile data changed or new profile, updating profile instance.');

            return newAppProfile; // Actualiza con la nueva instancia del perfil
          });

           console.log(`[AuthProvider] Profile fetch complete for ${userState.id}. Profile:`, newAppProfile);
          })
          .catch(error => { // Aunque fetchAppUserProfile maneja sus excepciones, por si acaso.
            console.error("[AuthProvider] Error in fetchAppUserProfile promise chain:", error);
            // Podrías establecer un AuthError aquí si es relevante
            let detailErrorMessage = "Error al cargar perfil";
            if (error instanceof Error) detailErrorMessage = error.message;
            setAuthErrorState(new AuthError(detailErrorMessage));
          })
          .finally(() => {
            setIsLoading(false);
            // console.log(`[AuthProvider] Profile fetch attempt finalized for ${userState.id}. isLoading: false.`);
          });
      } else {
        // No hay usuario, limpiar perfil y asegurar que no estamos cargando
        setProfileState(null);
        // Si userState se vuelve null (ej. después de SIGNED_OUT),
        // el primer useEffect (onAuthStateChange) ya debería haber puesto isLoading a false.
        // No es necesario manejar isLoading aquí para el caso de userState nulo.
      }
    }, [userState]); // Este efecto depende únicamente del estado del usuario.
  
    // --- Funciones de Autenticación ---
    const signUp = useCallback(async (credentials: SignUpWithPasswordCredentials) => {
      setAuthErrorState(null);
      setIsLoading(true); // Indicar carga durante la operación
      
      // Realizar trim solo si 'email' está presente en las credenciales
      let processedCredentials = credentials;
      if ('email' in credentials && typeof credentials.email === 'string') {
        processedCredentials = { ...credentials, email: credentials.email.trim() };
      }

      const result = await supabase.auth.signUp(processedCredentials);
      if (result.error) {
        const friendlyError = mapSupabaseAuthError(result.error);
        toast.error(friendlyError);
        setAuthErrorState(result.error as AuthError);
      } else if (result.data.user) {
        // Si la confirmación de correo está desactivada, el usuario se loguea directamente.
        // O si el flujo es que el usuario se crea y se loguea inmediatamente.
        toast.success("¡Cuenta creada y sesión iniciada!");
      }
      setIsLoading(false); // Poner isLoading a false DESPUÉS del intento de signUp
      return result;
    }, []);
  
    const signInWithPassword = useCallback(async (credentials: SignInWithPasswordCredentials) => {
      setAuthErrorState(null);
      setIsLoading(true);
      const result = await supabase.auth.signInWithPassword(credentials);
      if (result.error) {
        const friendlyError = mapSupabaseAuthError(result.error);
        toast.error(friendlyError, {
          description: "Por favor, verifica tus credenciales.",
        });
        setAuthErrorState(result.error);
        setIsLoading(false); // Importante: si hay error en login, detener la carga.
      }
      // Si el login es exitoso, onAuthStateChange y el useEffect de userState/profile se encargarán de isLoading.
      return result;
    }, []);
    
    const signInWithOAuth = useCallback(async (provider: Provider) => {
      setAuthErrorState(null);
      setIsLoading(true);
      const result = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin + '/auth/callback' } // Ajusta tu callback
      });
      if (result.error) {
        const friendlyError = mapSupabaseAuthError(result.error);
        toast.error(friendlyError);
        setAuthErrorState(result.error);
        setIsLoading(false); // También aquí si hay error y no se loguea
      }
      // Si el login es exitoso, el onAuthStateChange y el useEffect de userState
      // se encargarán de poner isLoading a false después de cargar el perfil.
    
      return result;
    }, []);
  
    const signOut = useCallback(async () => {
      setAuthErrorState(null);
      // setIsLoading(true); // No es estrictamente necesario para signOut, ya que el cambio es rápido
      const result = await supabase.auth.signOut();
      if (result.error) {
        const friendlyError = mapSupabaseAuthError(result.error);
        toast.error(friendlyError);
        setAuthErrorState(result.error);
        setIsLoading(false); // Si signOut falla, asegurar que no nos quedemos cargando
    } else {
      toast.success("Has cerrado sesión correctamente.");
    }
    return result;
  }, []);
    
    const resetPasswordForEmail = useCallback(async (email: string) => {
      setAuthErrorState(null);
      // No necesariamente isLoading(true) aquí, es una operación lateral
      const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth/update-password', // Ajusta tu ruta de update-password
      });
      if (result.error) {
        const friendlyError = mapSupabaseAuthError(result.error);
        toast.error(friendlyError);
        setAuthErrorState(result.error);
      } else {
        toast.success(`Si existe una cuenta para ${email}, recibirás un correo con instrucciones.`);
      }
      return result;
    }, []);
    // --- Fin Funciones de Autenticación ---
  
    const value: AuthContextType = {
      session: sessionState,
      user: userState,
      profile: profileState,
      role: profileState?.role || null, // Derivar rol del perfil
      isLoading,
      authError: authErrorState,
      signUp,
      signInWithPassword,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
  };