import type { MarkdownHeading } from 'astro';

export interface TocNode extends MarkdownHeading {
  children: TocNode[];
}

interface TocRange {
  minDepth?: number;
  maxDepth?: number;
}

export function buildTocTree(
  headings: MarkdownHeading[],
  { minDepth = 2, maxDepth = 4 }: TocRange = {},
): TocNode[] {
  const tree: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const heading of headings) {
    if (heading.depth < minDepth || heading.depth > maxDepth) continue;

    const node: TocNode = { ...heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }

    // A jump from h2 straight to h4 leaves nothing on the stack to nest under,
    // so the deeper heading is promoted to the level it can actually attach to
    // rather than being dropped.
    if (stack.length === 0) {
      tree.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return tree;
}

export function countTocNodes(nodes: TocNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countTocNodes(node.children), 0);
}
