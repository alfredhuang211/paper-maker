import type { ComponentType } from 'react';
import type { MessageKey } from '../i18n';
import { ColoringTool } from './coloring/ColoringTool';
import { MathTool } from './math/MathTool';
import { SchulteTool } from './schulte/SchulteTool';
import { MazeTool } from './maze/MazeTool';

export interface ToolDefinition {
  slug: 'coloring' | 'math' | 'schulte' | 'maze';
  nameKey: MessageKey;
  descKey: MessageKey;
  Component: ComponentType;
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'coloring',
    nameKey: 'home.coloring.name',
    descKey: 'home.coloring.desc',
    Component: ColoringTool,
  },
  {
    slug: 'math',
    nameKey: 'home.math.name',
    descKey: 'home.math.desc',
    Component: MathTool,
  },
  {
    slug: 'schulte',
    nameKey: 'home.schulte.name',
    descKey: 'home.schulte.desc',
    Component: SchulteTool,
  },
  {
    slug: 'maze',
    nameKey: 'home.maze.name',
    descKey: 'home.maze.desc',
    Component: MazeTool,
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}
