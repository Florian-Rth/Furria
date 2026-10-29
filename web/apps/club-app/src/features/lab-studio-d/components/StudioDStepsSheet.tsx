import { KkStudioDSheet } from '@furria/ui/KkStudioDSheet';
import type { FC } from 'react';
import { Fragment } from 'react';
import {
  STUDIO_D_CLOSE,
  STUDIO_D_LOOSE,
  STUDIO_D_NO_STEPS,
  STUDIO_D_STEPS,
} from '../studio-d-copy';
import type { StudioDStepGroup } from '../studio-d-practice';
import { clockOf } from '../studio-d-practice';

interface StudioDStepsSheetProps {
  open: boolean;
  groups: readonly StudioDStepGroup[];
  currentStepId: number | null;
  onClose: () => void;
  onPractise: (stepId: number) => void;
}

export const StudioDStepsSheet: FC<StudioDStepsSheetProps> = ({
  open,
  groups,
  currentStepId,
  onClose,
  onPractise,
}) => {
  const empty =
    groups.length === 0 ? <KkStudioDSheet.Group>{STUDIO_D_NO_STEPS}</KkStudioDSheet.Group> : null;
  const rows = groups.map((group) => {
    const steps = group.steps.map((entry) => {
      const clock = clockOf(entry.startSeconds);
      const current = entry.stepId === currentStepId;
      const practise = (): void => {
        onPractise(entry.stepId);
        onClose();
      };

      return (
        <KkStudioDSheet.Step
          key={entry.stepId}
          name={entry.name}
          clock={clock}
          description={entry.description}
          current={current}
          onSelect={practise}
        />
      );
    });

    const heading = group.name ?? STUDIO_D_LOOSE;

    return (
      <Fragment key={group.key}>
        <KkStudioDSheet.Group>{heading}</KkStudioDSheet.Group>
        {steps}
      </Fragment>
    );
  });

  return (
    <KkStudioDSheet
      open={open}
      title={STUDIO_D_STEPS}
      closeLabel={STUDIO_D_CLOSE}
      onClose={onClose}
    >
      {empty}
      {rows}
    </KkStudioDSheet>
  );
};
