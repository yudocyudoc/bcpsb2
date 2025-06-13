// src/components/pwa/PWAPrompt.tsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';


interface PWAPromptProps {}

interface UpdateServiceWorker {
    offlineReady: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    needRefresh: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    updateServiceWorker: (reload?: boolean) => Promise<void>;
}

const PWAPrompt: React.FC<PWAPromptProps> = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    }: UpdateServiceWorker = useRegisterSW({
        onRegisteredSW(swUrl: string, _r?: ServiceWorkerRegistration) {
            console.log(`PWA: Service Worker at: ${swUrl}`);
        },
        onRegisterError(error: Error) {
            console.error('PWA: Service Worker registration error', error);
        },
    });

    const close = (): void => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (offlineReady || needRefresh) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Alert className="shadow-lg">
                    <RefreshCw className="h-4 w-4" />
                    <AlertTitle>
                        {offlineReady ? 'Aplicación lista para funcionar offline' : '¡Nueva versión disponible!'}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                        {offlineReady ? 'Los contenidos se han guardado para acceso sin conexión.' : 'Recarga para obtener las últimas mejoras y funcionalidades.'}
                    </AlertDescription>
                    <div className="mt-3 flex gap-2 justify-end">
                        {needRefresh && (
                            <Button onClick={() => updateServiceWorker(true)} size="sm">
                                Recargar Ahora
                            </Button>
                        )}
                        <Button variant="outline" onClick={close} size="sm">
                            Cerrar
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    return null;
}

export default PWAPrompt;