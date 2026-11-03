import type { StudioTool } from '@furria/studio/studio-copy';
import type { StudioModeStart } from '@furria/studio/studio-mode';
import { firstStudioToolOf, shownStudioToolOf, studioToolsOf } from '@furria/studio/studio-mode';
import { useState } from 'react';

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
