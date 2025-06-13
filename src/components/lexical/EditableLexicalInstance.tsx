import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import type { EditorState, LexicalEditor } from 'lexical';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { $generateNodesFromDOM } from '@lexical/html';
import { editorConfig } from '@/config/lexicalConfig';
import { useCallback } from 'react';

import { marked } from 'marked';
import type { Token } from 'marked'; // Importar marked y Token
import { LexicalToolbar } from './LexicalToolbar'; // <--- IMPORTA LA TOOLBAR


import './LexicalListFix.css'; // Importar los estilos de corrección


// Combinamos todos los transformadores para markdown
const ALL_MARKDOWN_TRANSFORMERS = [...TRANSFORMERS];

// Plugin para manejar el pegado de Markdown
const PasteMarkdownPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Función para manejar el evento de pegado
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const text = clipboardData.getData('text/plain');
      if (!text) return;

      // Verificar si el texto pegado parece ser markdown
      const isMdLike = /[*#\->`]/.test(text) || text.includes('](');

      if (isMdLike) {
        try {
          // Prevenir el comportamiento predeterminado de pegado
          event.preventDefault();

          // Función para modificar los tokens de 'marked' antes de la renderización.
          // Forzamos que los elementos de lista no sean 'loose', lo que generalmente
          // evita que marked envuelva el contenido simple del <li> en <p> tags.
          const walkTokens = (token: Token) => { // Usar el tipo Token importado
            if (token.type === 'list_item') {
              token.loose = false;
            }
          };

          // Usar marked para convertir Markdown a HTML
          const htmlContent = marked.parse(text, {
            gfm: true,
            breaks: true,
            //headerIds: false, // Evita añadir IDs a los encabezados
            //mangle: false     // Evita cambiar ciertos caracteres por entidades HTML
            walkTokens, // Aplicamos la función para modificar los tokens

          }) as string;
          //console.log("PASTE_PLUGIN: HTML generado por marked:", htmlContent); // <--- LOG


          editor.update(() => {
            try {
              // Crear un elemento temporal para convertir el HTML a nodos Lexical
              const parser = new DOMParser();
              const dom = parser.parseFromString(htmlContent, 'text/html');
              // Corregir la estructura del DOM antes de procesarlo con Lexical
              cleanupListStructure(dom.body);

             // console.log("PASTE_PLUGIN: DOM limpiado:", dom.body.innerHTML);

              // Si queremos reemplazar todo el contenido
              const root = $getRoot();
              root.clear();

              // Generar nodos Lexical a partir del DOM
              const nodes = $generateNodesFromDOM(editor, dom);
              console.log("PASTE_PLUGIN: Nodos generados desde DOM:", nodes);


              // Insertar los nodos en el editor
              if (nodes.length > 0) {
                root.append(...nodes);
              } else {
                // Fallback si no se generaron nodos
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(text));
                root.append(paragraph);
              }

              // Mover el cursor al final
              root.selectEnd();
            } catch (error) {
              console.error("Error al generar nodos del DOM:", error);
              // Fallback simple: insertar como texto plano
              const root = $getRoot();
              root.clear();
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(text));
              root.append(paragraph);
              root.selectEnd();
            }
          });
        } catch (error) {
          console.error("Error general al procesar markdown:", error);
          // Permitir el comportamiento normal de pegado si falla todo
          editor.update(() => {
            const root = $getRoot();
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(text));
            root.append(paragraph);
            root.selectEnd();
          });
        }
      }
    };

// Función para limpiar y corregir la estructura de listas anidadas
    // Esta función se moverá junto con el plugin si decides separarlo.
    function cleanupListStructure(element: Element) {
      // 1. Eliminar atributos 'value' de todos los <li> en listas no ordenadas (<ul>)
      const ulLiElements = element.querySelectorAll('ul li');
      ulLiElements.forEach(li => {
        li.removeAttribute('value');
      });

      // 2. Lógica para asegurar que las listas anidadas estén correctamente contenidas
      //    y tengan las clases adecuadas si es necesario.
      //    La lógica original de reestructuración de mover <ul> de un <li> a otro
      //    se ha simplificado aquí, ya que `marked` con `walkTokens` ya produce
      //    una buena estructura anidada (<li>Parent<ul>Child</ul></li>).
      //    Nos enfocaremos en asegurar que los atributos y clases sean correctos.
      const listItems = element.querySelectorAll('li');
      listItems.forEach(li => {
        const childLists = Array.from(li.children).filter(child =>
          child.tagName === 'UL' || child.tagName === 'OL');

        childLists.forEach(list => {
          // Asegurar clases para el estilo visual si es necesario (esto puede ser redundante
          // si Lexical o tu tema ya aplican clases, pero puede ayudar en algunos casos).
          // Estas clases son ejemplos y podrían necesitar ajustarse a tu sistema de diseño.
          if (list.tagName === 'UL') {
            if (!list.classList.contains('list-disc')) list.classList.add('list-disc');
            // if (!list.classList.contains('ml-6')) list.classList.add('ml-6'); // Ejemplo de indentación
            // if (!list.classList.contains('mb-2')) list.classList.add('mb-2'); // Ejemplo de margen
          } else if (list.tagName === 'OL') {
            if (!list.classList.contains('list-decimal')) list.classList.add('list-decimal');
            // if (!list.classList.contains('ml-6')) list.classList.add('ml-6');
            // if (!list.classList.contains('mb-2')) list.classList.add('mb-2');
          }
        });
      });

      // 3. Corregir la continuidad de valores en listas ordenadas
      //    Esto asegura que los <li> dentro de un <ol> tengan atributos 'value' secuenciales.
      const orderedLists = element.querySelectorAll('ol');
      orderedLists.forEach(ol => {
        const liItems = ol.querySelectorAll(':scope > li'); // :scope para hijos directos
        let counter = 1;
        liItems.forEach(li => {
          li.setAttribute('value', counter.toString());
          counter++;
        });
      });
    }

    // Añadimos el listener al elemento del editor una vez esté disponible
    const addPasteListener = () => {
      const editorElement = editor.getRootElement();
      if (editorElement) {
        editorElement.addEventListener('paste', handlePaste);
        return true;
      }
      return false;
    };

    // Intentar añadir inmediatamente
    if (!addPasteListener()) {
      // Si el elemento aún no está disponible, intentar con un pequeño retraso
      const interval = setInterval(() => {
        if (addPasteListener()) {
          clearInterval(interval);
        }
      }, 100);

      // Limpiar el intervalo si pasa demasiado tiempo
      setTimeout(() => clearInterval(interval), 3000);
    }

    // Limpieza al desmontar
    return () => {
      const editorElement = editor.getRootElement();
      if (editorElement) {
        editorElement.removeEventListener('paste', handlePaste);
      }
    };
  }, [editor]);

  return null;
};

// Helper function to transform incoming JSON to a Lexical-compatible format
function transformToLexicalCompatibleJSON(json: any): any {
  if (!json || !json.root || !Array.isArray(json.root.children)) {
    // console.warn("ESM_PLUGIN_TRANSFORM: JSON structure not as expected for transformation", json);
    return json; // Not the structure we're targeting, return original
  }

  const transformNode = (node: any): any => {
    let modifiedNode = { ...node };

    // 1. Transform 'content' string to a 'children' array with a text node
    if (typeof node.content === 'string') {
      modifiedNode.children = [{
        type: 'text',
        text: node.content,
        version: 1,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: ''
      }];
      delete modifiedNode.content;
    }

    // 2. Transform 'heading' node: 'level' to 'tag'
    if (node.type === 'heading' && typeof node.level === 'number') {
      modifiedNode.tag = `h${node.level}`;
      delete modifiedNode.level;
    }

    // Recursively transform children if they exist
    if (Array.isArray(modifiedNode.children)) {
      modifiedNode.children = modifiedNode.children.map(transformNode);
    }

    return modifiedNode;
  };

  return { ...json, root: { ...json.root, children: json.root.children.map(transformNode) } };
}
// Componente para cargar estado inicial desde JSON y manejar cambios
const EditorStateManagementPlugin: React.FC<{
  initialJsonString?: string | null;
  onJsonChange?: (jsonString: string) => void;
  editorKey?: string; // Añadimos editorKey a las props
}> = ({ initialJsonString, onJsonChange, editorKey }) => { // <-- Añadir editorKey aquí
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editor && initialJsonString && !isInitialized && typeof initialJsonString === 'string' && initialJsonString.trim().startsWith('{')) {
      const timeoutId = setTimeout(() => {
        try {
          let parsedInitialJSON = JSON.parse(initialJsonString);
          const transformedJSON = transformToLexicalCompatibleJSON(parsedInitialJSON);

          // Verificar que el objeto parseado tenga la estructura mínima de Lexical (un root)
          // La sugerencia usa parsedInitialJSON.root para la condición, pero parsea transformedJSON.
          if (parsedInitialJSON && parsedInitialJSON.root) {
            const initialEditorState = editor.parseEditorState(transformedJSON);
            editor.setEditorState(initialEditorState);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error("ESM_PLUGIN: Error al parsear o setear estado!", error);
        }
      }, 0); // Usar timeout de 0ms para diferir ligeramente la ejecución
      return () => clearTimeout(timeoutId);
    }
  }, [editor, initialJsonString, editorKey, isInitialized]);

  const handleOnChange = useCallback((editorState: EditorState) => {
    if (onJsonChange) {
      const jsonString = JSON.stringify(editorState.toJSON());
      onJsonChange(jsonString);
    }
  }, [onJsonChange]);

  return <OnChangePlugin onChange={handleOnChange} />;
};

// Plugin para customizar la forma en que Lexical renderiza las listas
const CustomListStylePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Esta función se ejecuta cada vez que hay un cambio en el editor
    // y aplica clases adicionales para ayudar con el estilo de las listas
    const handleUpdate = () => {
      const editorElement = editor.getRootElement();
      if (!editorElement) return;

      
// --- Paso 1: Limpieza inicial y clases base para UL/OL ---
      // Limpiar clases de nivel y de contenedor de TODOS los LIs antes de re-aplicar.
      // Esto asegura que si la estructura cambia, las clases viejas se eliminan.
      editorElement.querySelectorAll('li').forEach(li => {
        li.classList.remove(
          'decimal-primer-nivel',
          'bullet-segundo-nivel',
          'bullet-tercer-nivel',
          'lexical-li-container',
          'li-is-container'
          // Añade aquí otras clases de nivel si las tienes
        );
      });

      // Aplicar clases base a los elementos de lista UL y OL
      editorElement.querySelectorAll('ul, ol').forEach(list => {

        if (list.tagName === 'UL') {
          list.classList.add('lexical-ul');
        } else if (list.tagName === 'OL') {
          list.classList.add('lexical-ol');
        }
      });

       // Eliminar atributos 'value' de LIs en listas UL (Lexical a veces los añade)
       editorElement.querySelectorAll('ul li[value]').forEach(li => {
        li.removeAttribute('value');
      });

     
      // --- Paso 2: Aplicar clases de nivel y de contenedor con la nueva lógica recursiva ---

      function processList(listElement: HTMLOListElement | HTMLUListElement, level: number) {
        const directLiChildren = listElement.querySelectorAll<HTMLLIElement>(':scope > li');

        directLiChildren.forEach((li) => {
          // Limpieza local de clases de nivel y contenedor para este LI específico.
          // La limpieza global ya se hizo, pero esto asegura que si un LI cambia
          // de ser contenedor a no serlo (o viceversa) en una actualización, se recalcule.
          // Las clases 'lexical-ul', 'lexical-ol' en los elementos de lista se mantienen.
          li.classList.remove(
            'decimal-primer-nivel',
            'bullet-primer-nivel', // Añadido para ULs de primer nivel
            'bullet-segundo-nivel',
            'bullet-tercer-nivel',
            'lexical-li-container',
            'li-is-container'
            // Añade más clases de nivel si las tienes
          );

          let listTypeClass = '';
          const isContainer = li.querySelector<HTMLUListElement | HTMLOListElement>(':scope > ul, :scope > ol') !== null;

          if (!isContainer) { // Solo aplicar clases de nivel si el LI NO es un contenedor
            if (listElement.tagName === 'OL') {
              if (level === 1) listTypeClass = 'decimal-primer-nivel';
              // Ejemplo: if (level === 2) listTypeClass = 'decimal-segundo-nivel';
            } else if (listElement.tagName === 'UL') {
              if (level === 1) listTypeClass = 'bullet-primer-nivel';
              if (level === 2) listTypeClass = 'bullet-segundo-nivel';
              if (level === 3) listTypeClass = 'bullet-tercer-nivel';
              // Añade más niveles si es necesario
            }
          }

          if (listTypeClass) {
            li.classList.add(listTypeClass);
          }

          // Si este LI contiene una sublista, marcarlo como contenedor y procesar la sublista
          const nestedList = li.querySelector<HTMLUListElement | HTMLOListElement>(':scope > ul, :scope > ol');
          if (nestedList) {
            li.classList.add('lexical-li-container');
            li.classList.add('li-is-container');
            processList(nestedList, level + 1); // Procesar la sublista recursivamente
          }
        });
      }

      // Empezar procesando las listas de primer nivel
      const topLevelLists = editorElement.querySelectorAll<HTMLOListElement | HTMLUListElement>(
        ':scope > ol.lexical-ol, :scope > ul.lexical-ul'
      );
      topLevelLists.forEach(list => processList(list, 1));



    };

    // Registrar un listener para cambios en el editor
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        // Ejecutar en requestAnimationFrame para asegurar que el DOM está actualizado
        window.requestAnimationFrame(handleUpdate);
      });
    });
  }, [editor]);


  return null;
};

// Plugin to capture the editor instance
const EditorInstancePlugin: React.FC<{ editorRef: React.MutableRefObject<LexicalEditor | null> }> = ({ editorRef }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null; // Clean up on unmount
    };
  }, [editor, editorRef]);
  return null;
};

interface EditableLexicalInstanceProps {
  initialJsonString?: string | null;
  onJsonChange?: (jsonString: string) => void;
  placeholderText?: string;
  editorKey?: string; // Prop para pasar la key al plugin de manejo de estado
  id?: string; // Prop para el ID del contenedor principal
  ariaLabelledById?: string; // Nueva prop para la asociación con Label


}
export interface EditableLexicalInstanceRef {
  focus: () => void;
}

export const EditableLexicalInstance = forwardRef<EditableLexicalInstanceRef, EditableLexicalInstanceProps>(({
  initialJsonString,
  onJsonChange,
  placeholderText = "Empieza a escribir...",
  editorKey, // Recibir el editorKey
  id, ariaLabelledById, // Recibir el id y ariaLabelledById


}, ref) => {
  const editorInstanceRef = useRef<LexicalEditor | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorInstanceRef.current?.focus();
    }
  }));

  // Clona la configuración base y ajusta lo necesario para el editor editable
  const initialConfigEditable = {
    ...editorConfig,
    editorState: null,
    editable: true,
    namespace: `EditableLexicalInstance-${Math.random().toString(36).substring(2, 11)}`, // Namespace único para depuración
    onError: (error: Error) => {
      console.error("EditableLexicalInstance: Lexical Error:", error);
      // No lanzar el error, solo registrarlo
    },
  };

  const toolbarRef = useRef<HTMLDivElement>(null);
  // Inicializa con el valor anterior 'top-14' (3.5rem) como fallback o mientras se calcula.
  const [placeholderTopStyle, setPlaceholderTopStyle] = useState('3.5rem');

  useEffect(() => {
    let animationFrameId: number | null = null;
    let fallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const calculatePlaceholderTop = () => {
      if (toolbarRef.current) {
        const toolbarHeight = toolbarRef.current.offsetHeight;
        // ContentEditable tiene p-3 (0.75rem).
        // El placeholder debe estar debajo de la toolbar + el padding superior de ContentEditable.
        setPlaceholderTopStyle(`calc(${toolbarHeight}px + 0.75rem)`);
      }
    };

    // Función para ejecutar el cálculo en el siguiente frame de animación.
    // Esto ayuda a asegurar que las dimensiones del DOM estén actualizadas.
    const scheduleCalculation = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        calculatePlaceholderTop();
      });
    };

    // Observador para cambios de tamaño de la toolbar
    const resizeObserver = new ResizeObserver(scheduleCalculation);
    let currentToolbarElement: HTMLDivElement | null = toolbarRef.current;

    if (currentToolbarElement) {
      resizeObserver.observe(currentToolbarElement);
      scheduleCalculation(); // Calcular inmediatamente al montar si la ref está lista
    } else {
      // Si la ref no está lista inmediatamente (poco probable con forwardRef bien implementado),
      // el primer cálculo podría retrasarse. Este log ayuda a depurar.
      console.warn("EditableLexicalInstance: Toolbar ref not immediately available for initial placeholder calculation. Retrying shortly.");
      // Como fallback, intentar después de un breve delay.
      fallbackTimeoutId = setTimeout(scheduleCalculation, 100);
      // La limpieza de este timeout específico se hará si el efecto se desmonta antes.
      // No es ideal depender de esto, la ref debería estar lista.
      // La función de limpieza principal se encargará de los listeners generales.
      // Para ser explícitos con este timeout:
      // return () => clearTimeout(fallbackTimeoutId); // Esto limpiaría SOLO el timeout.
      // Sin embargo, la limpieza general es más completa.
    }

    // Listener para cambios de tamaño de la ventana
    window.addEventListener('resize', scheduleCalculation);


    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
      }
      if (currentToolbarElement) {
        resizeObserver.unobserve(currentToolbarElement);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleCalculation);
    };
    // El array de dependencias vacío asegura que este efecto se ejecute solo al montar y desmontar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  return (
    <LexicalComposer initialConfig={initialConfigEditable}>
      <EditorInstancePlugin editorRef={editorInstanceRef} />
      <div
        // El id principal se moverá al ContentEditable para la correcta asociación con el Label
        role="group"
        aria-label={placeholderText}
        className="editor-container relative border border-gray-300 rounded-md"
      >
        <LexicalToolbar ref={toolbarRef} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              role="textbox"
              id={id} // ID único para el editor
              aria-labelledby={ariaLabelledById} // Asociar con el ID del elemento que actúa como etiqueta
              aria-multiline="true" // Indicar que es multilínea
              tabIndex={0}
              className="editor-input min-h-[150px] p-3 outline-none resize-none prose dark:prose-invert max-w-none"
            />
          }
          placeholder={
            <div
            aria-hidden="true" // El placeholder no debe ser leído
              className="editor-placeholder absolute left-3 text-muted-foreground pointer-events-none"
              style={{ top: placeholderTopStyle }}
            >
              {placeholderText}
          </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={ALL_MARKDOWN_TRANSFORMERS} />
        <PasteMarkdownPlugin />
        <CustomListStylePlugin />


        <EditorStateManagementPlugin
          initialJsonString={initialJsonString}
          onJsonChange={onJsonChange}
          editorKey={editorKey} // Pasar el editorKey al plugin
        />
      </div>
    </LexicalComposer>
  );
});

EditableLexicalInstance.displayName = 'EditableLexicalInstance';