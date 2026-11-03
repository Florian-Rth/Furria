import { ScoreStepPane } from '@furria/studio/ScoreStepPane';
import { CLOSE_LABEL, STEP_PANE_LABEL } from '@furria/studio/score-copy';
import type { ScoreHub } from '@furria/studio/score-hub';
import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';

interface ScoreStepDrawerProps {
  score: ScoreHub;
}

export const ScoreStepDrawer: FC<ScoreStepDrawerProps> = ({ score }) => {
  const open = score.drawerStep !== null;
  const step =
    score.drawerStep === null ? null : (
      <ScoreStepPane
        score={score}
        view={score.drawerStep}
        framed={false}
        onClose={score.closeStep}
      />
    );

  return (
    <KkBottomDrawer
      open={open}
      label={STEP_PANE_LABEL}
      closeLabel={CLOSE_LABEL}
      onClose={score.closeStep}
    >
      {step}
    </KkBottomDrawer>
  );
};
