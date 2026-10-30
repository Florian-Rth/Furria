import { useState } from 'react';
import type { StudioTool } from '../studio-copy';

export interface ActStudioMode {
  canEdit: boolean;
  editing: boolean;
  tool: StudioTool;
  toggle: () => void;
  choose: (tool: StudioTool) => void;
}

export const useActStudioMode = (canEdit: boolean, silent: boolean): ActStudioMode => {
  const [editing, setEditing] = useState(silent);
  const [tool, setTool] = useState<StudioTool>(silent ? 'music' : 'steps');

  return {
    canEdit,
    editing: canEdit && editing,
    tool,
    toggle: () => {
      setEditing((open) => !open);
    },
    choose: setTool,
  };
};
