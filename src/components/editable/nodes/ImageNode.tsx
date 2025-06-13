// src/components/editable/nodes/ImageNode.tsx

import React from 'react';
import type {
    EditorConfig,
    LexicalNode, // Es un tipo
    NodeKey, // Es un tipo
    SerializedLexicalNode, // Es un tipo
    LexicalEditor, // Es un tipo
    // Spread, // No se usa, se puede quitar
} from 'lexical';
// --- IMPORTACIÓN CORREGIDA: Quitar 'type' de DecoratorNode ---
import { DecoratorNode, $applyNodeReplacement } from 'lexical';
import { Suspense } from 'react'; // Necesitamos Suspense y React

// --- Componente React para Renderizar (Importación Diferida) ---
// Asegúrate que la ruta a ImageComponent es correcta
const ImageComponent = React.lazy(() => import('./ImageComponent'));

// --- Interfaz de Serialización (Definida UNA VEZ) ---
export interface SerializedImageNode extends SerializedLexicalNode { // SerializedLexicalNode es un tipo
    src: string;
    altText: string;
    width?: number | 'inherit';
    height?: number | 'inherit';
    type: 'image'; // Obligatorio
    version: 1;    // Buena práctica incluir versión
}

// --- Definición del Nodo Lexical (Definido UNA VEZ) ---
// Extiende DecoratorNode<JSX.Element> porque decorate devuelve JSX
export class ImageNode extends DecoratorNode<React.JSX.Element> {
    // Propiedades internas
    __src: string;
    __altText: string;
    __width: number | 'inherit';
    __height: number | 'inherit';

    // --- Métodos Estáticos ---
    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__width,
            node.__height,
            node.__key, // Pasar la key original
        );
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, altText, width, height } = serializedNode;
        // Usar el helper $createImageNode asegura consistencia y reemplazo si es necesario
        const node = $createImageNode({ src, altText, width, height });
        // Aquí podrías añadir lógica para manejar otros campos si los hubiera
        return node;
    }

    // --- Constructor ---
    constructor(
        src: string,
        altText: string,
        width?: number | 'inherit',
        height?: number | 'inherit',
        key?: NodeKey, // NodeKey es un tipo
    ) {
        // Pasar la key al constructor de DecoratorNode
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
    }

    // --- Métodos de Instancia ---
    exportJSON(): SerializedImageNode { // SerializedImageNode es un tipo
        return {
            src: this.getSrc(), // Usar getters es buena práctica
            altText: this.getAltText(),
            width: this.__width,
            height: this.__height,
            type: 'image',
            version: 1,
        };
    }

    // Crea el elemento DOM base (usado internamente por Lexical)
    createDOM(config: EditorConfig): HTMLElement { // EditorConfig es un tipo
        const span = document.createElement('span');
        const theme = config.theme;
        // Intentar obtener clase del tema, si no, usar una por defecto o ninguna
        const className = theme.image; // Asume que tienes 'image' en tu lexicalEditorTheme
        if (className !== undefined) {
            span.className = className;
        }
        // Podrías añadir atributos aquí si fueran necesarios para el span wrapper
        // span.style.display = 'inline-block'; // Ejemplo
        return span;
    }

    // Actualizar el DOM (generalmente no necesario para DecoratorNodes simples)
    updateDOM(): false {
        // Retorna false para indicar que Lexical no necesita hacer nada especial
        // para actualizar este nodo wrapper. El componente React se encarga.
        return false;
    }

    // --- Renderizado del Componente React ---
    // Este es el método CLAVE que devuelve el JSX a renderizar en el editor
    decorate(editor: LexicalEditor, _config: EditorConfig): React.JSX.Element { // LexicalEditor y EditorConfig son tipos
        // No necesitamos 'config' aquí, pero lo dejamos por si acaso en el futuro
        return (
             <Suspense fallback={<div>Cargando imagen...</div>}>
                 <ImageComponent
                    src={this.getSrc()} // Usar getter
                    altText={this.getAltText()} // Usar getter
                    width={this.__width}
                    height={this.__height}
                    nodeKey={this.getKey()} // Pasar la key para interacción
                    editor={editor} // Pasar el editor al componente
                    resizable={true} // Ejemplo: Habilitar redimensión (el componente debe implementarlo)
                />
            </Suspense>
         );
    }

    // --- Getters (y Setters si los necesitas) ---
    getSrc(): string {
        // Obtener la versión más reciente del nodo antes de leer
        return this.getLatest().__src;
    }

    getAltText(): string {
        return this.getLatest().__altText;
    }

    // Podrías añadir setters si permites modificar la imagen desde el componente
    // setSrc(src: string): void {
    //   const writable = this.getWritable();
    //   writable.__src = src;
    // }
}

// --- Función Helper para Crear Nodos (Definida UNA VEZ) ---
// Exporta una función para crear instancias del nodo fácilmente
export function $createImageNode({
    src,
    altText,
    width,
    height,
    key,
}: { // Tipado del payload
    src: string;
    altText: string;
    width?: number | 'inherit';
    height?: number | 'inherit';
    key?: NodeKey; // NodeKey es un tipo
}): ImageNode {
     // Llama al constructor y usa $applyNodeReplacement para manejar el reemplazo de selección si existe
    return $applyNodeReplacement(new ImageNode(src, altText, width, height, key));
}

// --- Type Guard (Definido UNA VEZ) ---
// Verifica si un nodo es una instancia de ImageNode
export function $isImageNode(
    node: LexicalNode | null | undefined, // LexicalNode es un tipo
): node is ImageNode {
    return node instanceof ImageNode;
}
