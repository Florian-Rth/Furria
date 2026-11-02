import { KkButton } from '@furria/ui/KkButton';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { StageSelectionActions } from '../hooks/use-stage-playground';
import {
  CLEAR_SELECTION,
  LINE_UP_SELECTION,
  MIRROR_SELECTION,
  SELECTION_TOOLBAR,
} from '../studio-lab-copy';

interface StageSelectionToolbarProps {
  selection: StageSelectionActions;
}

export const StageSelectionToolbar: FC<StageSelectionToolbarProps> = ({ selection }) => {
  if (selection.toolbar === null) {
    return null;
  }

  return (
    <KkTouchLab.Float x={selection.toolbar.x} y={selection.toolbar.y} label={SELECTION_TOOLBAR}>
      <KkButton variant="text" size="small" onClick={selection.mirror}>
        {MIRROR_SELECTION}
      </KkButton>
      <KkButton variant="text" size="small" onClick={selection.lineUp}>
        {LINE_UP_SELECTION}
      </KkButton>
      <KkButton variant="text" size="small" onClick={selection.clear}>
        {CLEAR_SELECTION}
      </KkButton>
    </KkTouchLab.Float>
  );
};
