// src/editor/plugins/ImagePlugin.tsx
import type { LexicalCommand } from 'lexical'; // Añadir tipos necesarios

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { mergeRegister } from '@lexical/utils';
import {
  //$createRangeSelection,
  $getSelection,
  //$isNodeSelection,
  $isRangeSelection,
  //$isRootNode,
  //$setSelection,
  COMMAND_PRIORITY_EDITOR,
  //COMMAND_PRIORITY_HIGH,
  //COMMAND_PRIORITY_LOW,
  createCommand,
  //DRAGOVER_COMMAND,
  //DRAGSTART_COMMAND,
  //DROP_COMMAND,
  // Necesitamos helpers para insertar nodos
   $insertNodes,
  // COMMAND_PRIORITY_NORMAL, // Otra prioridad
} from 'lexical';
import { useEffect } from 'react';

// --- Importar NUESTRO ImageNode y sus tipos/helpers ---
import {
  $createImageNode, // Nuestro helper de creación
  //$isImageNode,     // Nuestro type guard
  ImageNode,        // Nuestra clase de nodo
  // SerializedImageNode, // Podríamos necesitar el tipo serializado
} from '@/components/editable/nodes/ImageNode'; // <-- AJUSTAR RUTA si es necesario

// --- Importar Lógica de Subida (AHORA DE SUPABASE) ---
import { uploadFileToSupabaseStorage } from '@/supabase/utils/storageUtils'; // Cambiado a Supabase
import { toast } from 'sonner';


// --- Definir Payload para el comando que INICIA la subida ---
// Este comando lo disparará el botón de la toolbar con el archivo
export interface UploadImagePayload {
    file: File;
    altText?: string; // UploadImagePayload es un tipo
}
export const UPLOAD_IMAGE_COMMAND: LexicalCommand<UploadImagePayload> = createCommand('UPLOAD_IMAGE_COMMAND');

// --- Comando para insertar la imagen con la URL FINAL ---
// (Este es similar al INSERT_IMAGE_COMMAND del playground)
export type InsertImagePayload = Readonly<{ // Usamos el nombre del playground para claridad
  altText: string;
  height?: number;
  maxWidth?: number; // Playground usa maxWidth, adaptemos
  src: string;
  width?: number;
  // caption?: LexicalEditor; // Omitimos caption por ahora
  showCaption?: boolean; // Omitimos caption
}>;
export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');
// --- Fin Comandos ---


export function ImagePlugin(): React.JSX.Element | null { // Añadido React. para JSX
  const [editor] = useLexicalComposerContext();
  console.log("ImagePlugin MONTADO."); // <-- LOG A


  useEffect(() => {
    console.log("ImagePlugin useEffect ejecutándose..."); // <-- LOG B

    // Declarar las funciones de desregistro fuera del try, pero dentro del useEffect
    // Inicializar con una función vacía o undefined para asegurar que existan
    let unregisterUploadCommand = () => {};
    let unregisterInsertCommand = () => {};
    // let unregisterDragStart = () => {}; // Si añades Drag&Drop
    // let unregisterDragOver = () => {};  // Si añades Drag&Drop
    // let unregisterDrop = () => {};      // Si añades Drag&Drop

    try { // <-- El bloque try empieza aquí, dentro de la función del useEffect
    if (!editor.hasNodes([ImageNode])) {
        console.error("ImagePlugin: ImageNode no registrado.");
      return; // Salir si nuestro nodo no está
    }

    // --- Registrar Comando de SUBIDA (UPLOAD_IMAGE_COMMAND) ---
     unregisterUploadCommand = editor.registerCommand<UploadImagePayload>(
        UPLOAD_IMAGE_COMMAND,
        (payload) => {
            console.log("UPLOAD_IMAGE_COMMAND recibido en Plugin:", payload); // <-- LOG 3

            const { file, altText = file.name } = payload;
            const storagePathInBucket = `botiquin_images/${Date.now()}_${file.name}`; // Ejemplo de ruta única

            // Iniciar subida (mostrar toast, llamar a utilidad)
            const uploadToastId = toast.loading("Subiendo imagen...", { description: file.name });
            uploadFileToSupabaseStorage(file, 'bcp-bucket-general-test', storagePathInBucket) // Usar la función de Supabase
                .then((downloadURL: string) => { // Tipar downloadURL
                    console.log("Subida exitosa, despachando INSERT_IMAGE_COMMAND con URL:", downloadURL); // <-- LOG 4

                    toast.success("Imagen Subida", { id: uploadToastId, description: "Insertando..." });
                     // Una vez subida, despachar el comando de INSERCIÓN con la URL
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        altText: altText,
                        src: downloadURL,
                        // Podrías añadir width/height iniciales aquí
                    });
                })
                .catch((error: Error) => { // Tipar error
                    console.error("Error en uploadFileToStorage:", error); // <-- LOG 5 (Errores de subida)

                    toast.error("Error de Subida", { id: uploadToastId, description: error.message });
                });
            return true; // Comando manejado
        },
        COMMAND_PRIORITY_EDITOR
    );
    console.log("UPLOAD_IMAGE_COMMAND registrado OK."); // <-- LOG C

    // --- Registrar Comando de INSERCIÓN (INSERT_IMAGE_COMMAND) ---
    // Este comando recibe el payload con la URL FINAL
     unregisterInsertCommand = editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
            console.log("INSERT_IMAGE_COMMAND recibido en Plugin:", payload); // <-- LOG 6

            editor.update(() => { // Asegurarse de estar en un update
                console.log("Insertando nodo ImageNode..."); // <-- LOG 7

                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // Código de inserción del playground (adaptado)
                    // if ($isRootNode(selection.anchor.getNode())) {
                    //     selection.insertParagraph(); // Crear párrafo si estamos en root (opcional)
                    // }
                    const imageNode = $createImageNode(payload); // Usar nuestro helper $createImageNode
                    $insertNodes([imageNode]); // Insertar el nodo
                    // Mover selección después de la imagen (mejor UX)
                     const node = imageNode.getLatest();
                    if(node){
                        node.selectNext();
                    }
                    console.log("Nodo ImageNode insertado."); // <-- LOG 8


                }
            });
            return true; // Comando manejado
        },
        COMMAND_PRIORITY_EDITOR
    );
    console.log("INSERT_IMAGE_COMMAND registrado OK."); // <-- LOG D

    // --- Registrar Comandos Drag & Drop (Adaptados del Playground) ---
    // (Omitidos por brevedad inicial, se pueden añadir después si necesitas Drag & Drop)
    // const unregisterDragStart = editor.registerCommand<DragEvent>(DRAGSTART_COMMAND, onDragStart, COMMAND_PRIORITY_HIGH);
    // const unregisterDragOver = editor.registerCommand<DragEvent>(DRAGOVER_COMMAND, onDragover, COMMAND_PRIORITY_LOW);
    // const unregisterDrop = editor.registerCommand<DragEvent>(DROP_COMMAND, (event) => onDrop(event, editor), COMMAND_PRIORITY_HIGH);
    // --- Fin Drag & Drop ---


    // Desregistrar todos los comandos al desmontar
  

} catch (registerError) {
    console.error("Error registrando comandos en ImagePlugin:", registerError); // <-- LOG E
}


// Desregistrar al desmontar
return () => {
    console.log("Desregistrando comandos de ImagePlugin..."); // <-- LOG F
    unregisterUploadCommand();
    unregisterInsertCommand();
};
}, [editor]); // Solo depende del editor

return null;
}

// --- Funciones Helper para Drag & Drop (Adaptadas del Playground - OMITIR POR AHORA) ---
// function onDragStart(event: DragEvent): boolean { /* ... */ return false; }
// function onDragover(event: DragEvent): boolean { /* ... */ return false; }
// function onDrop(event: DragEvent, editor: LexicalEditor): boolean { /* ... */ return false; }
// function getImageNodeInSelection(): ImageNode | null { /* ... */ return null; }
// function getDragImageData(event: DragEvent): null | InsertImagePayload { /* ... */ return null; }
// function canDropImage(event: DragEvent): boolean { /* ... */ return false; }
// function getDragSelection(event: DragEvent): Range | null | undefined { /* ... */ return undefined; }
// --- Fin Helpers Drag & Drop ---