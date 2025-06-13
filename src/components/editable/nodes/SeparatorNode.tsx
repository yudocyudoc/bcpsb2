// src/components/editable/nodes/SeparatorNode.tsx (o donde lo quieras poner)
import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import type { ReactNode } from 'react';

export type SerializedSeparatorNode = SerializedLexicalNode; // SerializedLexicalNode es un tipo

function SeparatorComponent({ nodeKey }: { nodeKey: NodeKey }) {
  return <hr className="my-4 border-border" data-lexical-key={nodeKey} />; // Estilo con Tailwind
}

export class SeparatorNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    return 'separator';
  }

  static clone(node: SeparatorNode): SeparatorNode {
    return new SeparatorNode(node.__key);
  }

  static importJSON(_serializedNode: SerializedSeparatorNode): SeparatorNode {
    return $createSeparatorNode();
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: 'separator',
      version: 1,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    // No necesitamos un DOM complejo aquí ya que usamos decorate
    return document.createElement('div');
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactNode {
    return <SeparatorComponent nodeKey={this.getKey()} />;
  }

  isTopLevel(): true {
    return true;
  }
}

export function $createSeparatorNode(): SeparatorNode {
  return new SeparatorNode();
}

export function $isSeparatorNode(node: LexicalNode | null | undefined): node is SeparatorNode {
  return node instanceof SeparatorNode;
}