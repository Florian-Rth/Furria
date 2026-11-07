import { KkEjPhoneHead } from '@furria/ui/KkEjPhoneHead';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSsStageTitle } from '@furria/ui/KkSsStageTitle';
import type { FC } from 'react';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_HEAD, SS_REDO, SS_STAGE_TEXT, SS_UNDO, setupHeadingOf } from '../setup-copy';
import { SsSaveState } from './SsSaveState';
import { SsStageBar } from './SsStageBar';

interface SsHeadProps {
  setup: StepSetup;
  title: string;
}

export const SsHead: FC<SsHeadProps> = ({ setup, title }) => {
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
        <SsStageBar setup={setup} />
      </KkEjPhoneHead.Name>
      <SsSaveState history={history} />
      <KkIconButton label={SS_UNDO} icon="undo" disabled={undoLocked} onClick={history.undo} />
      {redo}
    </KkEjPhoneHead>
  );
};
