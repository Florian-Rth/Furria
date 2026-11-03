import { ScoreStepPane } from '@furria/studio/ScoreStepPane';
import { CLOSE_LABEL, STEP_PANE_LABEL } from '@furria/studio/score-copy';
import type { ScoreStepTools } from '@furria/studio/score-step-tools';
import type { ScoreStepView } from '@furria/studio/score-views';
import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';

interface ScoreStepDrawerProps {
  view: ScoreStepView | null;
  tools: ScoreStepTools;
  onClose: () => void;
}

export const ScoreStepDrawer: FC<ScoreStepDrawerProps> = ({ view, tools, onClose }) => {
  const open = view !== null;
  const step =
    view === null ? null : (
      <ScoreStepPane view={view} tools={tools} wide={false} framed={false} onClose={onClose} />
    );

  return (
    <KkBottomDrawer open={open} label={STEP_PANE_LABEL} closeLabel={CLOSE_LABEL} onClose={onClose}>
      {step}
    </KkBottomDrawer>
  );
};
