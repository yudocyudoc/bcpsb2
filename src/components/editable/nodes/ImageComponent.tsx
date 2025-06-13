// src/editor/nodes/ImageComponent.tsx
import React, { useRef, useState, useCallback } from 'react';
import type { NodeKey, LexicalEditor } from 'lexical';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
    CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_DELETE_COMMAND, KEY_BACKSPACE_COMMAND, $getNodeByKey
} from 'lexical';
import { cn } from '@/lib/utils';

interface ImageComponentProps {
    src: string;
    altText: string;
    width: number | 'inherit';
    height: number | 'inherit';
    nodeKey: NodeKey;
    editor: LexicalEditor; // Recibe el editor
    resizable?: boolean; // Prop para habilitar redimensión
}

const ImageComponent: React.FC<ImageComponentProps> = ({
    src,
    altText,
    width,
    height,
    nodeKey,
    editor,
    //resizable,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing] = useState(false); // Estado para redimensión
    // const [editor] = useLexicalComposerContext(); // Alternativa para obtener editor

    const onDelete = useCallback((payload: KeyboardEvent) => {
        if (isSelected) {
             payload.preventDefault();
             editor.update(() => {
                 // 1. Obtener el nodo Lexical usando $getNodeByKey
                 const node = $getNodeByKey(nodeKey);
                 // 2. Si el nodo existe, obtener su versión más reciente y eliminarla
                 if (node) {
                    node.getLatest().remove();
                 }
             });
             return true; // Evento manejado
        }
        return false;
    // Añadir dependencias a useCallback
    }, [isSelected, editor, nodeKey]);

    React.useEffect(() => {
        // Registrar comandos para borrar imagen al presionar Supr/Backspace cuando está seleccionada
        return mergeRegister(
            editor.registerCommand(CLICK_COMMAND, (event: MouseEvent) => {
                const img = imgRef.current;
                if (img && img === event.target) {
                    // Seleccionar nodo al hacer clic en la imagen
                    clearSelection(); // Limpiar selección previa
                    setSelected(true);
                    return true; // Evento manejado
                }
                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
        );
    }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);


    // --- Lógica de Redimensión (Ejemplo Básico) ---
    // Esto requeriría implementar handlers onMouseDown, onMouseMove, onMouseUp
    // en los "agarradores" (handles) de redimensión y actualizar el nodo Lexical.
    // Es complejo, lo omitimos por ahora para simplificar.
    // const handleResizeStart = ...
    // const handleResizeMove = ...
    // const handleResizeEnd = ...
    // --- Fin Lógica Redimensión ---


    return (
        <div
            className={cn(
                "relative inline-block focus:outline-none",
                 isSelected && !isResizing && "outline-2 outline-primary")} // Resaltar si está seleccionada
            ref={imgRef} // Referencia para detectar clics
            tabIndex={-1}
            draggable={isSelected} // Permitir arrastrar si está seleccionada
        >
            <img
                src={src}
                alt={altText}
                width={width === 'inherit' ? undefined : width}
                height={height === 'inherit' ? undefined : height}
                className="block max-w-full h-auto pointer-events-none" // Estilo base de imagen
                draggable="false" // No permitir arrastrar
            />
            {/* Aquí irían los handles para redimensionar si resizable es true */}
            {/* {resizable && isSelected && ( <> ... handles ... </> )} */}
        </div>
    );
};

export default ImageComponent; // ¡IMPORTANTE: Exportación por defecto!