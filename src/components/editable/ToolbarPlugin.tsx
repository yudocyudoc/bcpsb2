// src/components/editable/ToolbarPlugin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    ElementNode,
    $isElementNode,
    $createParagraphNode,
     // <-- Añadir LexicalEditor para tipar el argumento
} from 'lexical';
import type { RangeSelection } from 'lexical';
import type {LexicalEditor} from 'lexical';
import  type {HeadingTagType} from '@lexical/rich-text';

import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Heading2, Link, Pilcrow, Undo, Redo, Image as ImageIcon } from 'lucide-react'; // <-- Añadir ImageIcon

// Importar el comando de subida
import { UPLOAD_IMAGE_COMMAND } from './plugins/ImagePlugin'; // <-- Importar comando y payload
import type { UploadImagePayload } from './plugins/ImagePlugin'; // <-- Importar payload


// --- Función Helper getSelectedNode (mejorada ligeramente) ---
function getSelectedNode(selection: RangeSelection): ElementNode | null {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = anchor.getNode();
    const focusNode = focus.getNode();
    // Si ambos nodos son iguales
    if (anchorNode === focusNode) {
        // Si es un ElementNode, devuélvelo directamente
        if ($isElementNode(anchorNode)) {
            return anchorNode;
        }
        // Si es un TextNode, devuelve su padre (que debería ser un ElementNode)
        return anchorNode.getParent();
    }

    // Si los nodos son diferentes (selección no colapsada)
    const isBackward = selection.isBackward();
    if (isBackward) {
        // Busca el ElementNode más cercano desde el nodo de foco
        return $getNearestNodeOfType(focusNode, ElementNode);
    } else {
        // Busca el ElementNode más cercano desde el nodo de ancla
        return $getNearestNodeOfType(anchorNode, ElementNode);
    }
}

// --- Función Helper para manejar el cambio de archivo (AHORA FUERA DEL COMPONENTE) ---
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, editor: LexicalEditor) => {
    const file = event.target.files?.[0];
    console.log("Archivo seleccionado:", file); // <-- LOG 1

    if (file) {
        console.log("Despachando UPLOAD_IMAGE_COMMAND..."); // <-- LOG 2

        // Despachar comando de SUBIDA con el archivo
        const payload: UploadImagePayload = { file: file }; // Crear el payload
        editor.dispatchCommand(UPLOAD_IMAGE_COMMAND, payload); // <-- Usar el comando correcto
    }
    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    if (event.target) {
        event.target.value = '';
    }
};


// --- Componente ToolbarPlugin ---
const ToolbarPlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref para el input de archivo

    // --- Estados del Toolbar ---
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [blockType, setBlockType] = useState<string>('paragraph');

    // --- Callback para actualizar el estado del Toolbar ---
    const $updateToolbarState = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // --- Actualizar formato de texto inline ---
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));

            // --- Actualizar estado del enlace ---
            const node = getSelectedNode(selection);
            const parent = node?.getParent();
            setIsLink($isLinkNode(node) || $isLinkNode(parent));

            // --- Actualizar tipo de bloque ---
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();

            if (element != null && element.getType() === 'text') {
                element = element.getParent() ?? element;
            }

            if (element != null) {
                const elementKey = element.getKey();
                const elementDOM = editor.getElementByKey(elementKey);

                if (elementDOM !== null) {
                    if ($isHeadingNode(element)) {
                        setBlockType(element.getTag());
                    } else {
                        const type = element.getType() || 'paragraph';
                        setBlockType(type);
                    }
                }
            }

        } else {
            // Resetear si no hay selección de rango
            setIsBold(false);
            setIsItalic(false);
            setIsUnderline(false);
            setIsLink(false);
            setBlockType('paragraph');
        }
    }, [editor]);


    // Registrar listeners
    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbarState();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateToolbarState();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            editor.registerCommand<boolean>(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, COMMAND_PRIORITY_CRITICAL),
            editor.registerCommand<boolean>(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, COMMAND_PRIORITY_CRITICAL)
        );
    }, [editor, $updateToolbarState]);

    // --- Función para formatear encabezado ---
    const formatHeading = (tag: HeadingTagType) => {
        if (blockType !== tag) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(tag));
                }
            });
        } else { // Si ya es ese heading, volver a párrafo
            formatParagraph();
        }
    };

    // --- Función para formatear párrafo ---
    const formatParagraph = () => {
        if (blockType !== 'paragraph') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        }
    };

    // --- Función para insertar/editar enlace (REVISADA) ---
    const insertLink = useCallback(() => {
        let initialUrl = '';
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = getSelectedNode(selection);
                const parent = node?.getParent();
                if ($isLinkNode(parent)) {
                    initialUrl = parent.getURL();
                } else if ($isLinkNode(node)) {
                    initialUrl = node.getURL();
                }
            }
        });

        const url = prompt(`Ingresa la URL ${initialUrl ? '(o deja vacío para eliminar)' : ''}:`, initialUrl);

        if (url === null) {
            return;
        }

        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (url === '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                } else {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
            } else {
                console.warn("La selección cambió o no es válida para aplicar el enlace.");
            }
        });

    }, [editor]);

    // --- Renderizado del Toolbar ---
    return (
        <div className="sticky top-0 z-10 p-1 bg-muted border-b border-border mb-2 flex gap-1 items-center flex-wrap rounded-t-md">
            {/* Input oculto para seleccionar archivos */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e, editor)} // Pasar editor a la función helper
                style={{ display: 'none' }}
            />

            {/* Botones Deshacer/Rehacer */}
            <Button variant="ghost" size="sm" disabled={!canUndo} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" disabled={!canRedo} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo className="h-4 w-4" /></Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Botones de Formato */}
            <Button
                variant={isBold ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                aria-label="Negrita"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant={isItalic ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                aria-label="Cursiva"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant={isUnderline ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                aria-label="Subrayado"
            >
                <Underline className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Botones de Bloque */}
            <Button
                variant={blockType === 'paragraph' ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={formatParagraph}
                aria-label="Párrafo"
            >
                <Pilcrow className="h-4 w-4" />
            </Button>
            <Button
                variant={blockType === 'h2' ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading('h2')}
                aria-label="Encabezado 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Botón Enlace */}
            <Button
                variant={isLink ? "secondary" : "ghost"}
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertLink}
                aria-label="Insertar/Editar Enlace"
            >
                <Link className="h-4 w-4" />
            </Button>

            {/* Botón Insertar Imagen */}
            <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()} // Abre el selector de archivos
                aria-label="Insertar Imagen"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>

            {/* Añadir más botones aquí (Quote, Listas, etc.) */}
        </div>
    );
};

// --- Exportación por defecto (AHORA AL NIVEL SUPERIOR) ---
export default ToolbarPlugin;
// --- Fin Exportación por defecto ---