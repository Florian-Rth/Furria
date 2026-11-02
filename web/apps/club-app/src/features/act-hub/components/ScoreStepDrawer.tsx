import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import { CLOSE_LABEL, STEP_PANE_LABEL } from '../score-copy';
import { ScoreStepPane } from './ScoreStepPane';

interface ScoreStepDrawerProps {
  score: ActHub;
}

export const ScoreStepDrawer: FC<ScoreStepDrawerProps> = ({ score }) => {
  const step =
    score.drawerStep === null ? null : (
      <ScoreStepPane
        score={score}
        view={score.drawerStep}
        framed={false}
        onClose={score.route.closeStep}
      />
    );

  return (
    <KkBottomDrawer
      open={score.drawerStep !== null}
      label={STEP_PANE_LABEL}
      closeLabel={CLOSE_LABEL}
      onClose={score.route.closeStep}
    >
      {step}
    </KkBottomDrawer>
  );
};
