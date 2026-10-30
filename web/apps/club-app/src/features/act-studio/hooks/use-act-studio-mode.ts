import { useState } from 'react';
import type { StudioTool } from '../studio-copy';
import type { StudioModeStart } from '../studio-mode';
import { firstStudioToolOf, onDeskOf, shownStudioToolOf, studioToolsOf } from '../studio-mode';

export interface ActStudioMode {
  canEdit: boolean;
  editing: boolean;
  onDesk: boolean;
  tool: StudioTool;
  tools: readonly StudioTool[];
  toggle: () => void;
  choose: (tool: StudioTool) => void;
}

export const useActStudioMode = (canEdit: boolean, start: StudioModeStart): ActStudioMode => {
  const [editing, setEditing] = useState(start.silent || start.editing);
  const [tool, setTool] = useState<StudioTool>(firstStudioToolOf(start));
  const shownEditing = canEdit && editing;
  const shownTool = shownStudioToolOf(tool, start);

  return {
    canEdit,
    editing: shownEditing,
    onDesk: onDeskOf(start.desk, shownEditing, shownTool),
    tool: shownTool,
    tools: studioToolsOf(start),
    toggle: () => {
      setEditing((open) => !open);
    },
    choose: setTool,
  };
};
