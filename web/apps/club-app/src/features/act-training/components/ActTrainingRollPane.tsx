import { KkButton } from '@furria/ui/KkButton';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { CLOSE_LABEL } from '@/features/acts/acts-copy';
import type { TrainingRollPaneState } from '../hooks/use-training-roll-pane';
import {
  ROLL_GRID_LABEL,
  ROLL_GRID_TITLE,
  ROLL_PANE_LABEL,
  TRAINING_START,
} from '../training-copy';
import { ActTrainingRollTrail } from './ActTrainingRollTrail';

interface ActTrainingRollPaneProps {
  pane: TrainingRollPaneState;
  framed: boolean;
  onClose: () => void;
}

export const ActTrainingRollPane: FC<ActTrainingRollPaneProps> = ({ pane, framed, onClose }) => {
  const close = framed ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
  ) : undefined;
  const open = pane.openLine === null ? null : <KkNote>{pane.openLine}</KkNote>;
  const foot = pane.canStart ? (
    <KkStepPane.Foot>
      <KkButton variant="contained" fullWidth onClick={pane.start}>
        {TRAINING_START}
      </KkButton>
    </KkStepPane.Foot>
  ) : null;

  return (
    <KkStepPane label={ROLL_PANE_LABEL} framed={framed}>
      <KkStepPane.Head
        icon="calendar"
        title={pane.title}
        context={pane.when}
        state={pane.state}
        stateLabel={pane.stateLabel}
        actions={close}
      />
      <KkStepPane.Body>
        {open}
        <KkPanelSection title={ROLL_GRID_TITLE}>
          <KkCastGrid
            label={ROLL_GRID_LABEL}
            tiles={pane.tiles}
            readOnly={pane.readOnly}
            onToggle={pane.toggle}
          />
        </KkPanelSection>
        <ActTrainingRollTrail lines={pane.trail} />
      </KkStepPane.Body>
      {foot}
    </KkStepPane>
  );
};
