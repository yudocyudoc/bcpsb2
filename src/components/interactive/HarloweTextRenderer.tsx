// src/components/interactive/HarloweTextRenderer.tsx
import React from 'react';

interface HarloweTextRendererProps {
  text: string;
  playerName?: string | null;
  className?: string;
}

interface ParsedElement {
  type: 'paragraph' | 'list' | 'heading' | 'blockquote';
  content: string | string[];
  level?: number; // Para headings
}

const HarloweTextRenderer: React.FC<HarloweTextRendererProps> = ({ 
  text, 
  playerName, 
  className = "prose dark:prose-invert max-w-none leading-relaxed" 
}) => {
  
  const processHarloweMarkup = (input: string): string => {
    let processed = input;
    
    // Reemplazar variables del jugador
    if (playerName) {
      processed = processed.replace(/\{\{PLAYER_NAME\}\}/g, playerName);
    }
    
    // Procesamiento de markup en orden de precedencia
    
    // 1. Enlaces Harlowe: [[texto|destino]] o [[texto->destino]]
    processed = processed.replace(/\[\[([^\|\]]+)\|([^\]]+)\]\]/g, '<a href="#$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    processed = processed.replace(/\[\[([^-\]]+)->([^\]]+)\]\]/g, '<a href="#$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    processed = processed.replace(/\[\[([^\]]+)\]\]/g, '<a href="#$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // 2. Texto tachado: ~~texto~~ (común en muchos formatos)
    processed = processed.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // 3. Negritas: ''texto'' (Harlowe) o **texto** (Markdown-style)
    processed = processed.replace(/''([^']+)''/g, '<strong>$1</strong>');
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 4. Cursivas: //texto// (Harlowe) o *texto* (Markdown-style)
    processed = processed.replace(/\/\/([^/]+?)\/\//g, '<em>$1</em>');
    processed = processed.replace(/(?<!\*)\*([^*\s][^*]*[^*\s]|\S)\*(?!\*)/g, '<em>$1</em>');
    
    // 5. Código inline: `código`
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');
    
    // 6. Subrayado: __texto__
    processed = processed.replace(/__([^_]+)__/g, '<u>$1</u>');
    
    // 7. Superíndice: ^texto^
    processed = processed.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');
    
    // 8. Subíndice: ~texto~
    processed = processed.replace(/~([^~]+)~/g, '<sub>$1</sub>');
    
    // 9. Texto resaltado: ==texto==
    processed = processed.replace(/==([^=]+)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    
    return processed;
  };

  const parseTextStructure = (text: string): ParsedElement[] => {
    const lines = text.split('\n');
    const elements: ParsedElement[] = [];
    let currentParagraph: string[] = [];
    let currentList: string[] = [];
    let inList = false;
    
    const finalizeParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join('\n').trim();
        if (content) {
          elements.push({
            type: 'paragraph',
            content: processHarloweMarkup(content)
          });
        }
        currentParagraph = [];
      }
    };
    
    const finalizeList = () => {
      if (currentList.length > 0) {
        elements.push({
          type: 'list',
          content: currentList.map(item => processHarloweMarkup(item))
        });
        currentList = [];
      }
    };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Detectar headings: # Título, ## Subtítulo, etc.
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        finalizeParagraph();
        finalizeList();
        inList = false;
        
        elements.push({
          type: 'heading',
          content: processHarloweMarkup(headingMatch[2]),
          level: headingMatch[1].length
        });
        return;
      }
      
      // Detectar blockquotes: > Texto
      if (trimmed.startsWith('> ')) {
        finalizeParagraph();
        finalizeList();
        inList = false;
        
        elements.push({
          type: 'blockquote',
          content: processHarloweMarkup(trimmed.substring(2))
        });
        return;
      }
      
      // Detectar elementos de lista: * item, - item, + item
      const listMatch = trimmed.match(/^[*\-+]\s+(.+)$/);
      if (listMatch) {
        if (!inList) {
          finalizeParagraph();
          inList = true;
        }
        currentList.push(listMatch[1]);
        return;
      }
      
      // Si estábamos en una lista y encontramos algo que no es lista
      if (inList && !listMatch) {
        finalizeList();
        inList = false;
      }
      
      // Manejo de párrafos
      if (trimmed === '') {
        if (currentParagraph.length > 0) {
          finalizeParagraph();
        }
      } else {
        currentParagraph.push(line);
      }
    });
    
    // Finalizar elementos pendientes
    finalizeParagraph();
    finalizeList();
    
    return elements;
  };

  const renderElement = (element: ParsedElement, index: number): React.ReactNode => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${Math.min(element.level || 1, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const headingClasses = {
          1: 'text-3xl font-bold mb-4 mt-6',
          2: 'text-2xl font-bold mb-3 mt-5',  
          3: 'text-xl font-bold mb-2 mt-4',
          4: 'text-lg font-bold mb-2 mt-3',
          5: 'text-base font-bold mb-1 mt-2',
          6: 'text-sm font-bold mb-1 mt-2'
        };
        
        return React.createElement(HeadingTag, {
          key: `heading-${index}`,
          className: headingClasses[element.level as keyof typeof headingClasses] || headingClasses[1],
          dangerouslySetInnerHTML: { __html: element.content as string }
        });
        
      case 'list':
        return (
          <ul key={`list-${index}`} className="list-disc pl-6 my-3 space-y-1">
            {(element.content as string[]).map((item, itemIndex) => (
              <li 
                key={`item-${itemIndex}`}
                dangerouslySetInnerHTML={{ __html: item }}
                className="leading-relaxed"
              />
            ))}
          </ul>
        );
        
      case 'blockquote':
        return (
          <blockquote 
            key={`quote-${index}`}
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: element.content as string }}
          />
        );
        
      case 'paragraph':
      default:
        const content = element.content as string;
        // Convertir saltos de línea simples a <br> dentro del párrafo
        const processedContent = content.replace(/\n/g, '<br />');
        
        return (
          <p 
            key={`paragraph-${index}`}
            className="mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        );
    }
  };

  const elements = parseTextStructure(text);
  
  return (
    <div className={className}>
      {elements.map(renderElement)}
    </div>
  );
};

export default HarloweTextRenderer;

// Ejemplo de uso en TwinePlayer.tsx:
/*
import HarloweTextRenderer from './HarloweTextRenderer';

// En lugar de processPassageText, usar:
<HarloweTextRenderer 
  text={passage.text} 
  playerName={playerName}
  className="prose dark:prose-invert max-w-none leading-relaxed"
/>
*/