// src/components/editable/SimpleLexicalRenderer.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Para combinar clases
import { lexicalEditorTheme } from '@/config/lexicalConfig'; // Importar tema para estilos

// --- Tipos Lexical (Más completos y definidos ANTES de usarse) ---
interface LexicalNode {
    type: string;
    version: number;
    children?: LexicalNode[];
    direction?: 'ltr' | 'rtl' | null; // Común en nodos de bloque
    format?: number | string; // Puede ser número (texto) o string (bloque)
    indent?: number; // Común en nodos de bloque
    // Campos de Texto
    text?: string;
    detail?: number;
    mode?: 'normal' | 'token' | 'segmented';
    style?: string;
    // Campos de Encabezado
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    // Campos de Enlace
    url?: string;
    target?: string;
    rel?: string;
    // Campos de Imagen
    src?: string;
    altText?: string;
    width?: number | 'inherit';
    height?: number | 'inherit';
    maxWidth?: number; // A veces usado
    showCaption?: boolean;
    // Campos de Lista
    listType?: 'bullet' | 'number' | 'check';
    start?: number;
    value?: number; // Para listitem
    checked?: boolean; // Para listitem check
    // Campos de Bloque de Código
    language?: string;
    // ... otros campos específicos de tus nodos personalizados
}

interface LexicalRoot {
    root: {
        children: LexicalNode[];
        direction?: 'ltr' | 'rtl' | null;
        format?: string;
        indent?: number;
        type: 'root';
        version: number;
    };
}

// --- Componentes Internos de Renderizado (Definidos fuera del componente principal) ---

const ParagraphRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => (
    // Aplicar indentación si existe
    <p
        className={cn(lexicalEditorTheme.paragraph)}
        style={{ paddingLeft: node.indent ? `${node.indent * 2}em` : undefined }} // Ejemplo de indentación
    >
        {children}
    </p>
);

const TextRenderer: React.FC<{ node: LexicalNode }> = ({ node }) => {
    // Usar \u200B (Zero-width space) si el texto está vacío para mantener la altura
    const textContent = node.text === '' ? '\u200B' : node.text || '';
    // Asegurarse de que format sea un número para operaciones de bits
    const format = typeof node.format === 'number' ? node.format : 0;
    // console.log(`Renderizando texto: "${textContent}"`, 'Format DEC:', format, 'Format BIN:', format.toString(2));

    const textClasses: string[] = [];

    // Aplicar clases basadas en bits de formato de texto
    if (format & 1) { textClasses.push('font-bold'); }         // IS_BOLD
    if (format & 2) { textClasses.push('italic'); }            // IS_ITALIC
    if (format & 4) { textClasses.push('line-through'); }      // IS_STRIKETHROUGH (Corregido bit)
    if (format & 8) { textClasses.push('underline'); }         // IS_UNDERLINE (Corregido bit)
    if (format & 16) { textClasses.push(lexicalEditorTheme.text?.code || 'font-mono bg-muted px-1 py-0.5 rounded text-sm'); } // IS_CODE (inline)
    if (format & 32) { textClasses.push('underline decoration-wavy'); } // IS_SUBSCRIPT (Ejemplo, ajustar estilo)
    if (format & 64) { textClasses.push('underline decoration-dotted'); } // IS_SUPERSCRIPT (Ejemplo, ajustar estilo)
    if (format & 128) { textClasses.push('text-yellow-500 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900'); } // IS_HIGHLIGHT (Ejemplo)

    return (
        <span
            className={cn(textClasses)} // Une las clases del array
            style={{ whiteSpace: 'pre-wrap' }} // Mantener espacios y saltos de línea internos
        >
            {textContent}
        </span>
    );
};

const LineBreakRenderer: React.FC = () => <br />;

const HeadingRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => {
    const tag = node.tag;
    // Validar que el tag sea uno de los permitidos, si no, usar h3 por defecto
    const ValidTag = tag && [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`].includes(tag) ? tag : 'h3';
    // Obtener clase del tema, usando h3 como fallback si el tag específico no está
    const className = lexicalEditorTheme.heading?.[ValidTag] || lexicalEditorTheme.heading?.h3;

    return React.createElement(ValidTag, {
        className: className,
        style: { paddingLeft: node.indent ? `${node.indent * 2}em` : undefined } // Aplicar indentación
    }, children);
};

const QuoteRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => (
    <blockquote
        className={lexicalEditorTheme.quote}
        style={{ paddingLeft: node.indent ? `${node.indent * 2}em` : undefined }} // Aplicar indentación
    >
        {children}
    </blockquote>
);

const LinkRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => (
    <a
        href={node.url}
        target={node.target || '_blank'} // Default a _blank si no se especifica
        rel={node.rel || 'noopener noreferrer'} // Default a rel seguro
        className={lexicalEditorTheme.link}
    >
        {children}
    </a>
);

const ImageRenderer: React.FC<{ node: LexicalNode }> = ({ node }) => {
    const src = node.src;
    const altText = node.altText;
    const width = node.width;
    const height = node.height;
    const maxWidth = node.maxWidth || 500; // Usar maxWidth del nodo o un default

    if (!src) return null;

    // Determinar estilos inline para dimensiones
    const imgStyle: React.CSSProperties = {
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : '100%', // Usar maxWidth numérico o 100%
        width: typeof width === 'number' ? `${width}px` : width === 'inherit' ? 'inherit' : 'auto', // 'auto' si no es número o inherit
        height: typeof height === 'number' ? `${height}px` : height === 'inherit' ? 'inherit' : 'auto', // 'auto' si no es número o inherit
        display: 'block', // Para evitar espacio extra debajo
        margin: '0.5rem auto', // Margen vertical y centrado horizontal
    };

    return (
        <img
            src={src}
            alt={altText || ''}
            style={imgStyle}
            className="rounded shadow-sm" // Clases adicionales de Tailwind/CSS
            loading="lazy" // Carga diferida nativa
        />
    );
};

// --- NUEVO: Renderizador para Bloques de Código ---
const CodeBlockRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => {
    const language = node.language || 'plaintext'; // Lenguaje (para resaltado futuro)

    // Usar <pre> para mantener formato y <code> para semántica
    return (
        <pre
            className={cn(lexicalEditorTheme.code, "overflow-x-auto p-4 rounded bg-muted text-sm")} // Estilos base
            data-language={language} // Atributo para posible resaltado CSS o JS
            style={{ paddingLeft: node.indent ? `${node.indent * 2}em` : undefined }} // Aplicar indentación
        >
            <code>{children}</code>
        </pre>
    );
};

// --- Renderizador para Listas (Ejemplo Básico) ---
const ListRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => {
    const Tag = node.listType === 'number' ? 'ol' : 'ul';
    return (
        <Tag
            start={node.start}
            className={cn(
                node.listType === 'number' ? lexicalEditorTheme.list?.ol : lexicalEditorTheme.list?.ul,
                "list-inside" // O list-outside según preferencia
            )}
            style={{ paddingLeft: node.indent ? `${node.indent * 2}em` : undefined }} // Aplicar indentación
        >
            {children}
        </Tag>
    );
};

const ListItemRenderer: React.FC<{ node: LexicalNode, children: React.ReactNode }> = ({ node, children }) => {
    // Aquí podrías manejar checkboxes si node.checked existe
    return (
        <li value={node.value} className={lexicalEditorTheme.list?.listitem}>
            {children}
        </li>
    );
};

// --- Componente Renderer Principal ---
interface SimpleLexicalRendererProps {
    contentJson: string; // El JSON del estado del editor
    className?: string; // Clase opcional para el contenedor principal
}

const SimpleLexicalRenderer: React.FC<SimpleLexicalRendererProps> = ({ contentJson, className }) => {
    let parsedState: LexicalRoot | null = null;
    const fallbackContent = contentJson || ''; // Guardar original por si falla el parseo

    try {
        // Intentar parsear el JSON
        parsedState = JSON.parse(contentJson || '{"root":{"children":[]}}') as LexicalRoot;
        // Validar estructura básica
        if (!parsedState?.root?.children || !Array.isArray(parsedState.root.children)) {
            throw new Error("Estructura JSON inválida o 'root.children' no es un array.");
        }
    } catch (e) {
        // Si falla el parseo o la validación, mostrar como texto plano simple
        console.warn("Error al parsear JSON del editor, renderizando como texto plano:", e);
        // Usar 'whitespace-pre-wrap' para respetar saltos de línea y espacios del texto original
        return <div className={cn("prose dark:prose-invert max-w-none whitespace-pre-wrap", className)}>{fallbackContent}</div>;
    }

    // --- Función Recursiva para Renderizar Nodos ---
    const renderNodes = (nodes: LexicalNode[]): React.ReactNode[] => {
        if (!nodes) return []; // Guarda contra nodos sin hijos

        return nodes.map((node, index) => {
            // Renderizar hijos recursivamente si existen
            const children = node.children ? renderNodes(node.children) : null;

            // Usar 'index' como key es aceptable para renderizado estático,
            // pero si tuvieras nodos con keys únicas, sería preferible usarlas.
            const key = `node-${index}`; // Key simple basada en índice

            switch (node.type) {
                // --- Nodos de Bloque ---
                case 'paragraph': return <ParagraphRenderer key={key} node={node}>{children}</ParagraphRenderer>;
                case 'heading':   return <HeadingRenderer key={key} node={node}>{children}</HeadingRenderer>;
                case 'quote':     return <QuoteRenderer key={key} node={node}>{children}</QuoteRenderer>;
                case 'code':      return <CodeBlockRenderer key={key} node={node}>{children}</CodeBlockRenderer>; // <-- Añadido
                case 'list':      return <ListRenderer key={key} node={node}>{children}</ListRenderer>; // <-- Añadido
                case 'listitem':  return <ListItemRenderer key={key} node={node}>{children}</ListItemRenderer>; // <-- Añadido
                // --- Nodos Inline o Decoradores ---
                case 'link':      return <LinkRenderer key={key} node={node}>{children}</LinkRenderer>;
                case 'image':     return <ImageRenderer key={key} node={node} />; // No tiene hijos renderizables directamente
                // --- Nodos de Texto y Formato ---
                case 'text':      return <TextRenderer key={key} node={node} />;
                case 'linebreak': return <LineBreakRenderer key={key} />;
                // --- Nodo Raíz (generalmente no se renderiza directamente) ---
                case 'root':      return children; // Renderizar solo los hijos del root
                // --- Default para nodos desconocidos ---
                default:
                    // Si tiene hijos, intentar renderizarlos
                    if (children) {
                        console.warn(`Nodo desconocido tipo "${node.type}" encontrado, renderizando hijos.`);
                        return <React.Fragment key={key}>{children}</React.Fragment>; // Usar Fragment para no añadir divs extra
                    }
                    // Si no tiene hijos, no renderizar nada
                    console.warn(`Nodo desconocido tipo "${node.type}" sin hijos encontrado.`);
                    return null;
            }
        });
    };
    // --- Fin Función Recursiva ---

    // Renderizar comenzando desde los hijos del nodo raíz
    return (
        <div className={cn("prose dark:prose-invert max-w-none", className)}>
            {renderNodes(parsedState.root.children)}
        </div>
    );
};

export default SimpleLexicalRenderer;
