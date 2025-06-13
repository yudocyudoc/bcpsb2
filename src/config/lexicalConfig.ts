// src/config/lexicalConfig.ts
import type { EditorThemeClasses } from 'lexical';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

import {
    TableNode,
    TableCellNode,
    TableRowNode,
} from "@lexical/table";

import { SeparatorNode } from "@/components/editable/nodes/SeparatorNode";

import { ImageNode } from '@/components/editable/nodes/ImageNode';




// Función onError (puedes personalizarla más adelante)
export const handleLexicalError = (error: Error) => {
    console.error("Error en Lexical:", error);
    // En producción, podrías querer enviar esto a un servicio de logging
    // throw error; // Relanzar si quieres que un ErrorBoundary superior lo capture
};

// Tema CSS (usa clases Tailwind/prose o tus propias clases)
export const lexicalEditorTheme: EditorThemeClasses = {
    paragraph: 'mb-2', // Margen inferior para párrafos
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'font-mono bg-muted px-1 py-0.5 rounded text-sm', // Estilo para código inline
    },
    heading: {
        h1: 'text-3xl font-bold my-4 border-b pb-2',
        h2: 'text-2xl font-semibold my-3 border-b pb-1',
        h3: 'text-xl font-semibold my-2',
    },
    list: {
        ul: 'list-disc ml-6 mb-2',
        ol: 'list-decimal ml-6 mb-2',
        listitem: 'mb-1',
    },
    link: 'text-primary hover:underline cursor-pointer',
    quote: 'border-l-4 border-muted-foreground pl-4 italic my-2 text-muted-foreground',
    code: 'bg-muted text-sm p-3 rounded font-mono block overflow-x-auto relative', // Bloque de código
    codeHighlight: { // Clases para resaltado de sintaxis si usas un highlighter
        'atrule': 'text-pink-600',
        'attr': 'text-blue-600',
        // ... (añade más clases de highlight.js/prismjs si es necesario) ...
        'tag': 'text-purple-600',
        'function': 'text-teal-600',
        'keyword': 'text-red-600',
        'comment': 'text-gray-500 italic',
    table: 'editor-table my-4 border-collapse border border-slate-400', // Clase para el <table>
    tableCell: 'editor-table-cell p-2 border border-slate-300',       // Clase para <td> y <th>
    tableCellHeader: 'editor-table-cell-header font-bold bg-slate-100 dark:bg-slate-700', // Clase específica para <th>
    tableRow: 'editor-table-row',                                     // Clase para <tr>
        // ...
    },
};



// Configuración principal exportada
export const editorConfig = {
    namespace: 'MiEditorLexical', // Namespace único para tu editor
    theme: lexicalEditorTheme,
    onError: handleLexicalError,
    nodes: [ // Nodos que tu editor soportará
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        AutoLinkNode,
        LinkNode,
        ImageNode,
        HorizontalRuleNode,
        SeparatorNode,
        // Nodos de Tabla
        TableNode,
        TableCellNode,
        TableRowNode,
        // Añade más nodos aquí si los necesitas
    ]
};