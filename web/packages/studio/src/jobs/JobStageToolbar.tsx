import { arrangeActionOf, selectAllActionOf } from '@furria/studio/arrange-actions';
import { allPickedOf, arrangeToolsOf } from '@furria/studio/edit-jobs';
import { EJ_STAGE_TOOLS } from '@furria/studio/edit-jobs-copy';
import type { SelectionAnchor } from '@furria/studio/studio-dots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import { KkEjStageFloat } from '@furria/ui/KkEjStageFloat';
import { KkEjStageTools } from '@furria/ui/KkEjStageTools';
import { KkEjToolBar } from '@furria/ui/KkEjToolBar';
import type { FC } from 'react';

interface JobStageToolbarProps {
  editor: ActStudioStage;
  arrange: JobArrange;
  anchor: SelectionAnchor;
}

export const JobStageToolbar: FC<JobStageToolbarProps> = ({ editor, arrange, anchor }) => {
  const chosen = editor.selected.length;
  const arranging = editor.formation
    ? arrangeToolsOf(chosen).map((tool) => arrangeActionOf(tool, editor, arrange))
    : [];
  const selecting = allPickedOf(chosen, arrange.placed) ? [] : [selectAllActionOf(arrange)];
  const actions = [...arranging, ...selecting];

  if (actions.length === 0) {
    return null;
  }

  const tools = actions.map((action) => (
    <KkEjToolBar.Tool
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      label={action.label}
      onPress={action.press}
    />
  ));

  return (
    <KkEjStageFloat x={anchor.x} y={anchor.y} side={anchor.side}>
      <KkEjStageTools label={EJ_STAGE_TOOLS}>
        <KkEjStageTools.Row>{tools}</KkEjStageTools.Row>
      </KkEjStageTools>
    </KkEjStageFloat>
  );
};
