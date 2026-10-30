import { useState } from 'react';
import type { StudioTool } from '../studio-copy';
import { STUDIO_TOOLS } from '../studio-copy';

export interface ActStudioMode {
  canEdit: boolean;
  editing: boolean;
  tool: StudioTool;
  tools: readonly StudioTool[];
  toggle: () => void;
  choose: (tool: StudioTool) => void;
}

export interface ActStudioModeStart {
  silent: boolean;
  evening: boolean;
  editing: boolean;
  tool: StudioTool | null;
  stageOnly: boolean;
}

const ALL_TOOLS: readonly StudioTool[] = STUDIO_TOOLS.map((entry) => entry.tool);
const STAGE_TOOLS: readonly StudioTool[] = ['formation', 'movement'];

const toolsOf = ({ evening, stageOnly }: ActStudioModeStart): readonly StudioTool[] =>
  evening || stageOnly ? STAGE_TOOLS : ALL_TOOLS;

const firstToolOf = (start: ActStudioModeStart): StudioTool => {
  const { silent, evening, stageOnly, tool } = start;
  if (tool !== null && toolsOf(start).includes(tool)) {
    return tool;
  }
  if (evening || stageOnly) {
    return 'formation';
  }

  return silent ? 'music' : 'steps';
};

export const useActStudioMode = (canEdit: boolean, start: ActStudioModeStart): ActStudioMode => {
  const [editing, setEditing] = useState(start.silent || start.editing);
  const [tool, setTool] = useState<StudioTool>(firstToolOf(start));
  const tools = toolsOf(start);

  return {
    canEdit,
    editing: canEdit && editing,
    tool: tools.includes(tool) ? tool : firstToolOf(start),
    tools,
    toggle: () => {
      setEditing((open) => !open);
    },
    choose: setTool,
  };
};
