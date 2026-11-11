import type { ComponentType } from 'react';
import type { MessageKey } from '../i18n';
import { ColoringTool } from './coloring/ColoringTool';
import { ColoringPictureTool } from './coloring-image/ColoringPictureTool';
import { MathTool } from './math/MathTool';
import { SchulteTool } from './schulte/SchulteTool';
import { MazeTool } from './maze/MazeTool';
import { SudokuTool } from './sudoku/SudokuTool';

export interface ToolDefinition {
  slug: 'coloring' | 'picture' | 'math' | 'schulte' | 'maze' | 'sudoku';
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
    slug: 'picture',
    nameKey: 'home.picture.name',
    descKey: 'home.picture.desc',
    Component: ColoringPictureTool,
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
  {
    slug: 'sudoku',
    nameKey: 'home.sudoku.name',
    descKey: 'home.sudoku.desc',
    Component: SudokuTool,
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}
