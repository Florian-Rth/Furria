import { arrangeActionOf, selectAllActionOf } from '@furria/studio/arrange-actions';
import { JOB_STAGE_TOOLS } from '@furria/studio/job-copy';
import { allPickedOf, arrangeToolsOf } from '@furria/studio/job-model';
import type { SelectionAnchor } from '@furria/studio/studio-dots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import { KkEditorToolBar } from '@furria/ui/KkEditorToolBar';
import { KkStageFloat } from '@furria/ui/KkStageFloat';
import { KkStageTools } from '@furria/ui/KkStageTools';
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
    <KkEditorToolBar.Tool
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      label={action.label}
      onPress={action.press}
    />
  ));

  return (
    <KkStageFloat x={anchor.x} y={anchor.y} side={anchor.side}>
      <KkStageTools label={JOB_STAGE_TOOLS}>
        <KkStageTools.Row>{tools}</KkStageTools.Row>
      </KkStageTools>
    </KkStageFloat>
  );
};
