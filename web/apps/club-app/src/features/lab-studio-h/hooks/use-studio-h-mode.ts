import { useState } from 'react';
import type { StudioTool } from '../studio-h-copy';

export interface StudioHMode {
  canEdit: boolean;
  editing: boolean;
  tool: StudioTool;
  toggle: () => void;
  choose: (tool: StudioTool) => void;
}

export const useStudioHMode = (canEdit: boolean): StudioHMode => {
  const [editing, setEditing] = useState(false);
  const [tool, setTool] = useState<StudioTool>('steps');

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
