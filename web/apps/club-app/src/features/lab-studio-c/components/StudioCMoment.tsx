import { KkStudioCMoment } from '@furria/ui/KkStudioCMoment';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep, stepAt, stepRangeOf } from '@/features/act-player/music-timeline';
import {
  STUDIO_C_NO_STEP,
  STUDIO_C_NO_STEP_META,
  stepMetaOf,
  stepPositionOf,
} from '../studio-c-copy';
import { rangeLabelOf } from '../studio-c-timeline';
import { StudioCCount } from './StudioCCount';

interface StudioCMomentProps {
  playback: StudioPlayback;
}

export const StudioCMoment: FC<StudioCMomentProps> = ({ playback }) => {
  const { player, steps, parts, segments } = playback;
  const stepId = usePlaybackSelection(player, (seconds) => stepAt(steps, seconds)?.stepId ?? null);
  const index = steps.findIndex((step) => step.stepId === stepId);
  const step = steps[index];
  const count = <StudioCCount player={player} segments={segments} />;

  if (step === undefined) {
    return (
      <KkStudioCMoment>
        {count}
        <KkStudioCMoment.Step
          position=""
          name={STUDIO_C_NO_STEP}
          meta={STUDIO_C_NO_STEP_META}
          description={null}
          quiet
        />
      </KkStudioCMoment>
    );
  }

  const part = partOfStep(parts, step.stepId);
  const meta = stepMetaOf(part?.name ?? null, rangeLabelOf(stepRangeOf(step)));

  return (
    <KkStudioCMoment>
      {count}
      <KkStudioCMoment.Step
        position={stepPositionOf(index, steps.length)}
        name={step.name}
        meta={meta}
        description={step.description}
      />
    </KkStudioCMoment>
  );
};
