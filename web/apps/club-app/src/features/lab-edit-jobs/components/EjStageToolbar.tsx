import type { SelectionAnchor } from '@furria/studio/studio-dots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkEjStageFloat } from '@furria/ui/KkEjStageFloat';
import { KkEjStageTools } from '@furria/ui/KkEjStageTools';
import { KkEjToolBar } from '@furria/ui/KkEjToolBar';
import type { FC } from 'react';
import { arrangeActionOf, selectAllActionOf } from '../arrange-actions';
import { allPickedOf, arrangeToolsOf } from '../edit-jobs';
import { EJ_STAGE_TOOLS } from '../edit-jobs-copy';
import type { EjArrange } from '../hooks/use-arrange';

interface EjStageToolbarProps {
  editor: ActStudioStage;
  arrange: EjArrange;
  anchor: SelectionAnchor;
}

export const EjStageToolbar: FC<EjStageToolbarProps> = ({ editor, arrange, anchor }) => {
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
