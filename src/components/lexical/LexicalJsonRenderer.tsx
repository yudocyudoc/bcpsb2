// src/components/poc/LexicalJsonRenderer.tsx

import React, { useEffect } from 'react';
import { ListPlugin } from '@lexical/react/LexicalListPlugin'; // Para renderizar listas
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'; // Para renderizar enlaces
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// ... tus nodos custom, themes, etc.
import { editorConfig } from '@/config/lexicalConfig'; 

interface LexicalJsonRendererProps {
  jsonString?: string | null;
}

// Componente interno para setear el estado desde JSON
const SetInitialStatePlugin: React.FC<{ jsonString: string }> = ({ jsonString }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (jsonString) {
      try {
        const editorState = editor.parseEditorState(jsonString);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Error parsing Lexical JSON for PoC:", error);
        // Podrías setear un estado de error aquí para mostrar en la UI
      }
    }
  }, [editor, jsonString]);
  return null;
};

export function LexicalJsonRenderer({ jsonString }: LexicalJsonRendererProps) {
  if (!jsonString) {
    return <p className="text-red-500">No JSON string provided to renderer.</p>;
  }

  const initialConfigRenderer = {
    ...editorConfig, // Tu configuración base (nodos, tema, etc.)
    editorState: null, // Se seteará por el plugin
    editable: false, // Modo solo lectura
    namespace: `LexicalJsonRenderer-${Math.random()}`, // Namespace único
    onError: (error: Error) => {
      console.error("Lexical Renderer PoC Error:", error);
      // Manejar errores aquí, quizás mostrar un mensaje al usuario
      throw error; // Opcional, dependiendo de cómo quieras manejarlo
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfigRenderer}>
      {/* RichTextPlugin es el principal para contenido básico y párrafos */}
      <RichTextPlugin
        contentEditable={<ContentEditable className="outline-none" />} // No necesita ser editable visualmente
        placeholder={null} // No placeholder en modo solo lectura
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* Plugins necesarios para que los nodos se rendericen correctamente */}
      <ListPlugin /> {/* Necesario si tu JSON tiene listas */}
      <LinkPlugin /> {/* Necesario si tu JSON tiene enlaces */}
      {/* <ImagePlugin /> Si tu ImageNode requiere un plugin para modo lectura (a veces no) */}
      {/* <TablePlugin /> si usas tablas */}

      <SetInitialStatePlugin jsonString={jsonString} />
    </LexicalComposer>
  );
}