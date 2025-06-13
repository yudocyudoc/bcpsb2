// src/components/editable/LexicalEditorComponent.tsx
import React, { useCallback } from 'react'; // Importar useCallback
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
    $getRoot, $createParagraphNode, $createTextNode, // Importaciones necesarias para initialize
    type EditorState, type LexicalEditor
} from 'lexical';
import { editorConfig } from '@/config/lexicalConfig';
import  ToolbarPlugin  from '@/components/editable/ToolbarPlugin';
import { cn } from '@/lib/utils';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { ImagePlugin } from '@/components/editable/plugins/ImagePlugin'; // Verifica la ruta
// Importar Skeleton si defines el fallback aquí
// import { Skeleton } from "@/components/ui/skeleton";

// --- Skeleton para el fallback (Definido aquí o importado) ---
// const EditorLoadingSkeleton = () => ( // Si lo defines aquí
//     <div className="space-y-2 p-1 min-h-[4em]">
//         <Skeleton className="h-4 w-3/4" />
//         <Skeleton className="h-4 w-full" />
//     </div>
// );
// --- Fin Skeleton ---


// --- Props ---
interface LexicalEditorComponentProps {
    initialContent: string;
    onStateChange: (editorStateJSON: string) => void;
    placeholder: string;
    editableClassName?: string;
}

const LexicalEditorComponent: React.FC<LexicalEditorComponentProps> = ({
    initialContent, // Prop usada en initializeEditorState
    onStateChange,
    placeholder,
    editableClassName, // Prop usada en ContentEditable
}) => {

    // --- Función de Inicialización (DENTRO del componente) ---
    const initializeEditorState = useCallback((editor: LexicalEditor): void => {
        try {
            const initialJson = JSON.parse(initialContent || '{}');
            if (initialJson?.root?.children && initialJson.root.children.length > 0) {
                 const newState = editor.parseEditorState(initialJson);
                 editor.setEditorState(newState);
                 return;
            }
            throw new Error("Contenido inicial vacío o no es estado Lexical válido.");
        } catch (e) {
            console.warn("Creando párrafo inicial:", e);
            editor.update(() => {
                const root = $getRoot(); // Usado
                root.clear();
                const paragraph = $createParagraphNode(); // Usado
                if (initialContent && typeof initialContent === 'string') {
                    paragraph.append($createTextNode(initialContent)); // Usado
                }
                root.append(paragraph);
                if (root.isEmpty()) {
                    root.append($createParagraphNode()); // Usado
                }
            });
        }
    // --- Añadir array de dependencias a useCallback ---
    }, [initialContent]);
    // --- Fin Función de Inicialización ---

    // --- Handler onChange ---
    const onChange = (editorState: EditorState, _editor: LexicalEditor) => {
        const editorStateJSON = JSON.stringify(editorState.toJSON());
        onStateChange(editorStateJSON); // Llama a la función del padre
    };
    // --- Fin Handler onChange ---

    return (
        <LexicalComposer initialConfig={{
             ...editorConfig,
             // Pasa la función definida DENTRO del componente
             editorState: initializeEditorState
             }}>
            <ToolbarPlugin />
            <div className="relative border rounded-md"> {/* Contenedor del editor */}
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className={cn(
                            "lexical-content-editable outline-none min-h-[4em] p-1 relative z-0",
                            "prose dark:prose-invert max-w-none",
                            editableClassName // Prop usada aquí
                        )} autoFocus={true} />
                    }
                    placeholder={
                        <div className="lexical-placeholder absolute top-[0.35rem] left-[0.35rem] select-none text-muted-foreground pointer-events-none opacity-50 p-1 z-[-1]">
                           {placeholder}
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary} // Prop ErrorBoundary corregida
                 />
             </div>
             {/* Plugins esenciales */}
            <OnChangePlugin onChange={onChange} ignoreSelectionChange={true} />
            <HistoryPlugin />
             {/* Otros plugins útiles */}
            <LinkPlugin />
            <ImagePlugin />
            {/* Puedes añadir ListPlugin, MarkdownShortcutPlugin, etc. aquí */}
        </LexicalComposer>
    );
};

export default LexicalEditorComponent;