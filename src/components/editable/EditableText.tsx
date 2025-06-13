// src/components/editable/EditableText.tsx
import React, { useState, useCallback, lazy, Suspense, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import SimpleLexicalRenderer from './SimpleLexicalRenderer';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button'; // Mantener Button
import { AlertCircle, Edit2, Save, XCircle, Loader2 } from 'lucide-react'; // Quitar Lock

// --- IMPORTAR SONNER ---
import { toast } from "sonner";


// --- CARGA DIFERIDA ---
const LexicalEditorComponent = lazy(() => import('./LexicalEditorComponent'));

// --- SKELETON ---
const EditorLoadingSkeleton = () => (
    <div className="space-y-2 p-1 min-h-[10em]">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
    </div>
);

// --- PROPS ---
interface EditableTextProps {
    initialContent: string;
    onSave: (editorStateJSON: string) => Promise<void> | void;
    placeholder?: string;
    className?: string;
    editableClassName?: string;
    onDirtyChange?: (isDirty: boolean) => void;
    pageId?: string; // <-- pageId ahora es opcional, ya que no se usa para bloqueo
}

// --- Componente Principal ---
const EditableText: React.FC<EditableTextProps> = ({
    initialContent,
    onSave,
    placeholder = "Escribe aquí...",
    className,
    editableClassName,
    onDirtyChange,
    // pageId, // pageId ya no se usa directamente aquí
}) => {
    const { role } = useAuth(); // user ya no es necesario para la lógica de bloqueo
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Estado solo para guardar
    // const [lockedByOther, setLockedByOther] = useState<string | null>(null); // Ya no se necesita
    const canEdit = role === 'admin' || role === 'editor';
    const editorStateRef = useRef<string | null>(null);

    // Actualizar ref y estado dirty
    const setLatestEditorState = useCallback((jsonState: string) => {
        editorStateRef.current = jsonState;
        const changed = jsonState !== initialContent;
        if (changed !== isDirty) {
            setIsDirty(changed);
            onDirtyChange?.(changed);
        }
    }, [initialContent, onDirtyChange, isDirty]);

    // --- Handlers ACTUALIZADOS ---
    const handleActivateEditing = async () => {
        if (!canEdit || isEditing) return;
        console.log("Intentando activar edición...");
        // Ya no hay lógica de bloqueo aquí
        setIsDirty(false);
        onDirtyChange?.(false);
        editorStateRef.current = initialContent; // Estado inicial para comparación
        setIsEditing(true);
    };

    const handleStopEditing = async () => { // Cancelar
        console.log("Cancelando edición...");
        // Ya no hay lógica de desbloqueo aquí
        setIsEditing(false);
        setIsDirty(false);
        onDirtyChange?.(false);
        editorStateRef.current = null;
    };

    const handleSaveChanges = async () => {
        const currentStateJson = editorStateRef.current;
        if (currentStateJson === null || !isDirty) {
            console.log("No hay cambios detectados o estado no disponible, cancelando...");
            await handleStopEditing(); // Si no hay cambios, solo cancelar
            return;
        }
        console.log("Guardando cambios...");
        setIsSaving(true); // Bloquear UI

        try {
            // 1. Guardar (llama a la prop onSave que actualiza Firestore)
            await onSave(currentStateJson);
            toast.success("Cambios Guardados", { duration: 3000 });

            // 2. Resetear estados locales
            setIsDirty(false);
            onDirtyChange?.(false);
            setIsEditing(false);
            editorStateRef.current = null;

        } catch (error) {
            console.error("Error al guardar cambios:", error);
            toast.error("Error al Guardar", { description: "No se pudieron guardar los cambios." });
        } finally {
            setIsSaving(false); // Desbloquear UI
        }
    };
    // --- Fin Handlers ---

    // Renderizado condicional inicial
    if (!canEdit && (!initialContent || initialContent === '{"root":{"children":[]}}')) {
        return <div className={cn("text-muted-foreground italic p-1", className)}>Contenido no disponible.</div>;
    }

    // Renderizado principal
    return (
        <div
            className={cn(
                "relative border rounded-md transition-colors duration-200 ease-in-out",
                 // Borde transparente por defecto, azul si se puede editar y no se está editando
                !isEditing && canEdit ? "border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer" : "border-transparent",
                 // Borde resaltado si se está editando
                isEditing ? "border-primary ring-1 ring-primary" : "border-border", // Usar border-border por defecto
                className
            )}
            onClick={!isEditing && canEdit ? handleActivateEditing : undefined} // Solo activar al click si se puede editar y no se está editando
            title={canEdit && !isEditing ? "Haz clic para editar" : undefined}
        >
            {/* Botón Activar Edición Flotante (AHORA CON ESTADO DE BLOQUEO) */}
            {canEdit && !isEditing && (
                <Button
                    variant="outline" size="icon"
                    onClick={(e) => { e.stopPropagation(); handleActivateEditing(); }}
                    disabled={isSaving} // Deshabilitar si está guardando
                    className="absolute top-1 right-1 z-20 opacity-30 hover:opacity-100 h-6 w-6"
                    title={"Activar Edición"}
                >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Edit2 className="h-3 w-3" />}
                </Button>
            )}

            {/* MODO VISUALIZACIÓN */}
            {!isEditing && (
                <div className="p-1"> {/* Padding para contenido visualización */}
                     <SimpleLexicalRenderer contentJson={initialContent || '{"root":{"children":[]}}'} />
                </div>
            )}

            {/* MODO EDICIÓN (Diferido) */}
            {canEdit && isEditing && (
                <Suspense fallback={<EditorLoadingSkeleton />}>
                    <LexicalEditorComponent
                        initialContent={initialContent}
                        onStateChange={setLatestEditorState}
                        placeholder={placeholder}
                        editableClassName={editableClassName}
                    />
                    {/* Botones Guardar/Cancelar */}
                    <div className="mt-2 flex justify-end gap-2 items-center p-1">
                         {isDirty && <span className='text-xs text-orange-500 flex items-center gap-1 mr-auto'><AlertCircle size={14}/> Cambios sin guardar</span>}
                        <Button variant="outline" size="sm" onClick={handleStopEditing} disabled={isSaving}> <XCircle className="mr-1 h-4 w-4" /> Cancelar </Button>
                        <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={!isDirty || isSaving}>
                             {isSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Save className="mr-1 h-4 w-4" />}
                             {isSaving ? "Procesando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </Suspense>
            )}
        </div>
    );
};

export default EditableText;
