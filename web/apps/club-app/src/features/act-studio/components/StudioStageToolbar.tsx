import { Stage } from '@furria/studio/Stage';
import { KkButton } from '@furria/ui/KkButton';
import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import {
  STUDIO_SELECTION_BAR,
  STUDIO_SELECTION_CLEAR,
  STUDIO_SELECTION_MIRROR,
  STUDIO_SELECTION_ROW,
  STUDIO_SELECTION_SPREAD,
} from '../studio-copy';
import type { SelectionAnchor } from '../studio-dots';

interface StudioStageToolbarProps {
  editor: ActStudioStage;
  anchor: SelectionAnchor;
}

export const StudioStageToolbar: FC<StudioStageToolbarProps> = ({ editor, anchor }) => {
  const row = (): void => {
    editor.align('across');
  };
  const spread = (): void => {
    editor.distribute('across');
  };
  const clear = (): void => {
    editor.tap(null);
  };
  const arranging = editor.formation ? (
    <>
      <KkButton variant="text" size="small" disabled={!editor.canMirror} onClick={editor.mirror}>
        {STUDIO_SELECTION_MIRROR}
      </KkButton>
      <KkButton variant="text" size="small" disabled={!editor.canAlign} onClick={row}>
        {STUDIO_SELECTION_ROW}
      </KkButton>
      <KkButton variant="text" size="small" disabled={!editor.canDistribute} onClick={spread}>
        {STUDIO_SELECTION_SPREAD}
      </KkButton>
    </>
  ) : null;

  return (
    <Stage.Float x={anchor.x} y={anchor.y} side={anchor.side}>
      <KkStageInk.Bar label={STUDIO_SELECTION_BAR}>
        {arranging}
        <KkButton variant="text" size="small" onClick={clear}>
          {STUDIO_SELECTION_CLEAR}
        </KkButton>
      </KkStageInk.Bar>
    </Stage.Float>
  );
};
