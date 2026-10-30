import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { DANCE_HERE, EVENING_PLACED_NOTE, EVENING_PRACTISE } from '../act-evenings-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';

interface ActEveningPaneFootProps {
  pane: ActEveningPaneState;
}

export const ActEveningPaneFoot: FC<ActEveningPaneFootProps> = ({ pane }) => {
  const placed = pane.placed ? <KkMeta>{EVENING_PLACED_NOTE}</KkMeta> : null;
  const join = pane.joined ? null : (
    <KkButton variant="outlined" fullWidth disabled={pane.busy} onClick={pane.join}>
      {DANCE_HERE}
    </KkButton>
  );
  const leave =
    pane.joined && !pane.placed ? (
      <KkButton variant="text" tone="danger" disabled={pane.busy} onClick={pane.leave}>
        {pane.leaveText}
      </KkButton>
    ) : null;

  return (
    <KkStepPane.Foot>
      {placed}
      {join}
      <KkButton variant="contained" fullWidth onClick={pane.practise}>
        {EVENING_PRACTISE}
      </KkButton>
      {leave}
    </KkStepPane.Foot>
  );
};
