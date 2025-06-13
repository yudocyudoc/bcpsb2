// src/components/lexical/LexicalToolbar.tsx
// (Puedes crearlo en components/poc/ o components/lexical/ por ahora, luego lo movemos)

import { useCallback, useEffect, useState, forwardRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  //LexicalEditor,
} from 'lexical';
//import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'; // Aunque no usemos link aún, es útil para la estructura
import { Button } from '@/components/ui/button'; // Asumiendo Shadcn UI
import { Bold, Italic, Underline, Undo, Redo } from 'lucide-react'; 

const LowPriority = 1;



export const LexicalToolbar = forwardRef<HTMLDivElement>((_props, ref) => {
    const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor); // Podrías tener editores anidados

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  // const [isLink, setIsLink] = useState(false); // Para el futuro
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Actualizar estado de formatos de texto
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // (Para el futuro) Actualizar estado de enlace
      // const node = getSelectedNode(selection);
      // const parent = node.getParent();
      // setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [activeEditor]); // Depender de activeEditor si lo usas para anidamiento

  useEffect(() => {
    // Escuchar cambios en la selección para actualizar la toolbar
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor); // Para escenarios con múltiples editores
        return false;
      },
      LowPriority,
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    // Escuchar cambios en el contenido para actualizar el estado de deshacer/rehacer
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [activeEditor, updateToolbar]);

  useEffect(() => {
    // Escuchar si se puede deshacer/rehacer
    // Estos comandos son despachados por Lexical cuando cambia el estado de su historial
    editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, LowPriority);
    editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, LowPriority);
  }, [editor]);


  return (
<div
      ref={ref}
      className="flex items-center flex-wrap space-x-1 p-2 border-b bg-slate-50 dark:bg-slate-800 rounded-t-md"
    >
      <Button
        variant={canUndo ? "outline" : "ghost"}
        size="sm"
        disabled={!canUndo}
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Deshacer"
        title="Deshacer (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant={canRedo ? "outline" : "ghost"}
        size="sm"
        disabled={!canRedo}
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Rehacer"
        title="Rehacer (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="h-6 border-l mx-2"></div> {/* Separador vertical */}

      <Button
        variant={isBold ? "secondary" : "ghost"}
        size="sm"
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        aria-pressed={isBold}
        aria-label="Negrita"
        title="Negrita (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={isItalic ? "secondary" : "ghost"}
        size="sm"
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        aria-pressed={isItalic}
        aria-label="Cursiva"
        title="Cursiva (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={isUnderline ? "secondary" : "ghost"}
        size="sm"
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        aria-pressed={isUnderline}
        aria-label="Subrayado"
        title="Subrayado (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      {/* Aquí irán más botones (headings, listas, etc.) */}
    </div>
  );
});

LexicalToolbar.displayName = 'LexicalToolbar';
