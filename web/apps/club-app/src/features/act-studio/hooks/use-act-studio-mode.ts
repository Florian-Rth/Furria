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
}

const ALL_TOOLS: readonly StudioTool[] = STUDIO_TOOLS.map((entry) => entry.tool);
const EVENING_TOOLS: readonly StudioTool[] = ['formation', 'movement'];

const firstToolOf = ({ silent, evening }: ActStudioModeStart): StudioTool => {
  if (evening) {
    return 'formation';
  }

  return silent ? 'music' : 'steps';
};

export const useActStudioMode = (canEdit: boolean, start: ActStudioModeStart): ActStudioMode => {
  const [editing, setEditing] = useState(start.silent || start.editing);
  const [tool, setTool] = useState<StudioTool>(firstToolOf(start));
  const tools = start.evening ? EVENING_TOOLS : ALL_TOOLS;

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
