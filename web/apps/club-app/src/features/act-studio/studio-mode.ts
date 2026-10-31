import type { StudioTool } from './studio-copy';
import { STUDIO_TOOLS } from './studio-copy';

export interface StudioModeStart {
  silent: boolean;
  evening: boolean;
  editing: boolean;
  stageOnly: boolean;
  tool: StudioTool | null;
}

export type StudioEditor = 'cards' | 'desk';

const ALL_TOOLS: readonly StudioTool[] = STUDIO_TOOLS.map((entry) => entry.tool);
const STAGE_TOOLS: readonly StudioTool[] = ['formation', 'movement'];

export const studioToolsOf = ({ evening, stageOnly }: StudioModeStart): readonly StudioTool[] =>
  evening || stageOnly ? STAGE_TOOLS : ALL_TOOLS;

export const firstStudioToolOf = (start: StudioModeStart): StudioTool => {
  const { silent, evening, stageOnly, tool } = start;
  if (tool !== null && studioToolsOf(start).includes(tool)) {
    return tool;
  }
  if (evening || stageOnly) {
    return 'formation';
  }

  return silent ? 'music' : 'steps';
};

export const shownStudioToolOf = (chosen: StudioTool, start: StudioModeStart): StudioTool =>
  studioToolsOf(start).includes(chosen) ? chosen : firstStudioToolOf(start);

export const studioEditorOf = (
  stageOnly: boolean,
  editing: boolean,
  wide: boolean,
): StudioEditor | null => {
  if (!stageOnly || !editing) {
    return null;
  }

  return wide ? 'desk' : 'cards';
};
