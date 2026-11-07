import { SetupSaveState } from '@furria/studio/SetupSaveState';
import { SetupStageBar } from '@furria/studio/SetupStageBar';
import {
  SETUP_HEAD,
  SETUP_REDO,
  SETUP_STAGE_TEXT,
  SETUP_UNDO,
  setupHeadingOf,
} from '@furria/studio/step-setup-copy';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkEditorHead } from '@furria/ui/KkEditorHead';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSetupTitle } from '@furria/ui/KkSetupTitle';
import type { FC } from 'react';

interface SetupHeadProps {
  setup: StepSetup;
  title: string;
}

export const SetupHead: FC<SetupHeadProps> = ({ setup, title }) => {
  const { history } = setup.screen;
  const wide = setup.screen.editor === 'desk';
  const heading = setupHeadingOf(title, SETUP_STAGE_TEXT[setup.stage], wide);
  const undoLocked = !history.canUndo;
  const redo = history.canRedo ? (
    <KkIconButton label={SETUP_REDO} icon="redo" onClick={history.redo} />
  ) : null;

  return (
    <KkEditorHead label={SETUP_HEAD}>
      <KkEditorHead.Name>
        <KkSetupTitle title={heading} />
        <SetupStageBar setup={setup} />
      </KkEditorHead.Name>
      <SetupSaveState history={history} />
      <KkIconButton label={SETUP_UNDO} icon="undo" disabled={undoLocked} onClick={history.undo} />
      {redo}
    </KkEditorHead>
  );
};
