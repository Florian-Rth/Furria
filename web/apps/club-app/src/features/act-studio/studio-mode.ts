import type { StudioTool } from './studio-copy';
import { STUDIO_TOOLS } from './studio-copy';

export interface StudioModeStart {
  silent: boolean;
  evening: boolean;
  editing: boolean;
  desk: boolean;
}

const ALL_TOOLS: readonly StudioTool[] = STUDIO_TOOLS.map((entry) => entry.tool);
const EVENING_TOOLS: readonly StudioTool[] = ['formation', 'movement'];
const DESK_TOOLS: readonly StudioTool[] = ['formation', 'movement'];

export const studioToolsOf = ({ evening, desk }: StudioModeStart): readonly StudioTool[] => {
  if (evening) {
    return EVENING_TOOLS;
  }

  return desk ? ALL_TOOLS.filter((tool) => tool !== 'steps') : ALL_TOOLS;
};

export const firstStudioToolOf = ({ silent, evening, desk }: StudioModeStart): StudioTool => {
  if (evening) {
    return 'formation';
  }
  if (silent) {
    return 'music';
  }

  return desk ? 'formation' : 'steps';
};

export const shownStudioToolOf = (chosen: StudioTool, start: StudioModeStart): StudioTool =>
  studioToolsOf(start).includes(chosen) ? chosen : firstStudioToolOf(start);

export const onDeskOf = (desk: boolean, editing: boolean, tool: StudioTool): boolean =>
  desk && editing && DESK_TOOLS.includes(tool);
