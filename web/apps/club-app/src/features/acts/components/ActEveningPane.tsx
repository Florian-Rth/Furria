import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { CLOSE_LABEL } from '../acts-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';
import { ActEveningCastSection } from './ActEveningCastSection';
import { ActEveningFormationSection } from './ActEveningFormationSection';
import { ActEveningPaneFoot } from './ActEveningPaneFoot';

interface ActEveningPaneProps {
  pane: ActEveningPaneState;
  framed: boolean;
  onClose: () => void;
}

export const ActEveningPane: FC<ActEveningPaneProps> = ({ pane, framed, onClose }) => {
  const close = framed ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
  ) : undefined;
  const changes = pane.changesLine === null ? null : <KkNote>{pane.changesLine}</KkNote>;

  return (
    <KkStepPane label={pane.label} framed={framed}>
      <KkStepPane.Head
        icon="calendar"
        title={pane.title}
        context={pane.day}
        state={pane.state}
        stateLabel={pane.stateLabel}
        actions={close}
      />
      <KkStepPane.Body>
        {changes}
        <ActEveningCastSection pane={pane} />
        <ActEveningFormationSection pane={pane} />
      </KkStepPane.Body>
      <ActEveningPaneFoot pane={pane} />
    </KkStepPane>
  );
};
