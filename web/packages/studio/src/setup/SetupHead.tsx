import { SetupSaveState } from '@furria/studio/SetupSaveState';
import { SetupStageBar } from '@furria/studio/SetupStageBar';
import {
  SS_HEAD,
  SS_REDO,
  SS_STAGE_TEXT,
  SS_UNDO,
  setupHeadingOf,
} from '@furria/studio/step-setup-copy';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkEjPhoneHead } from '@furria/ui/KkEjPhoneHead';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSsStageTitle } from '@furria/ui/KkSsStageTitle';
import type { FC } from 'react';

interface SetupHeadProps {
  setup: StepSetup;
  title: string;
}

export const SetupHead: FC<SetupHeadProps> = ({ setup, title }) => {
  const { history } = setup.screen;
  const wide = setup.screen.editor === 'desk';
  const heading = setupHeadingOf(title, SS_STAGE_TEXT[setup.stage], wide);
  const undoLocked = !history.canUndo;
  const redo = history.canRedo ? (
    <KkIconButton label={SS_REDO} icon="redo" onClick={history.redo} />
  ) : null;

  return (
    <KkEjPhoneHead label={SS_HEAD}>
      <KkEjPhoneHead.Name>
        <KkSsStageTitle title={heading} />
        <SetupStageBar setup={setup} />
      </KkEjPhoneHead.Name>
      <SetupSaveState history={history} />
      <KkIconButton label={SS_UNDO} icon="undo" disabled={undoLocked} onClick={history.undo} />
      {redo}
    </KkEjPhoneHead>
  );
};
