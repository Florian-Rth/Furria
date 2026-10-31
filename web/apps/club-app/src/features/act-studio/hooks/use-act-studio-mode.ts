import { useState } from 'react';
import type { StudioTool } from '../studio-copy';
import type { StudioModeStart } from '../studio-mode';
import { firstStudioToolOf, shownStudioToolOf, studioToolsOf } from '../studio-mode';

export interface ActStudioMode {
  canEdit: boolean;
  editing: boolean;
  tool: StudioTool;
  tools: readonly StudioTool[];
  toggle: () => void;
  choose: (tool: StudioTool) => void;
}

export const useActStudioMode = (canEdit: boolean, start: StudioModeStart): ActStudioMode => {
  const [editing, setEditing] = useState(start.silent || start.editing);
  const [tool, setTool] = useState<StudioTool>(firstStudioToolOf(start));

  return {
    canEdit,
    editing: canEdit && editing,
    tool: shownStudioToolOf(tool, start),
    tools: studioToolsOf(start),
    toggle: () => {
      setEditing((open) => !open);
    },
    choose: setTool,
  };
};
