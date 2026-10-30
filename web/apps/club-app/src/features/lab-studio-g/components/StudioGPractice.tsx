import { KkPracticeDescription } from '@furria/ui/KkPracticeDescription';
import { KkPracticeStepName } from '@furria/ui/KkPracticeStepName';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { PracticeBarControls } from '@/features/act-practice/components/PracticeBarControls';
import { PracticeCountLive } from '@/features/act-practice/components/PracticeCountLive';
import { PracticeHero } from '@/features/act-practice/components/PracticeHero';
import { PracticeSide } from '@/features/act-practice/components/PracticeSide';
import { PracticeSteps } from '@/features/act-practice/components/PracticeSteps';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import type { PracticeSteps as PracticeStepsModel } from '@/features/act-practice/hooks/use-practice-steps';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { PRACTICE_LABEL, PRACTICE_STEPS_OPEN } from '@/features/act-practice/practice-copy';
import type { Studio } from '@/features/acts/schemas';

interface StudioGPracticeProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  steps: PracticeStepsModel;
}

export const StudioGPractice: FC<StudioGPracticeProps> = ({
  studio,
  playback,
  practice,
  video,
  steps,
}) => (
  <KkPracticeView label={PRACTICE_LABEL}>
    <KkPracticeView.Head>
      <KkPracticeSteps.Trigger
        label={PRACTICE_STEPS_OPEN}
        expanded={steps.open}
        onOpen={steps.show}
      >
        <KkPracticeView.Titles>
          <KkPracticeStepName stepKey={practice.stepKey} name={practice.stepName} />
          <KkPracticeDescription stepKey={practice.stepKey} text={practice.note} />
        </KkPracticeView.Titles>
      </KkPracticeSteps.Trigger>
      <PracticeCountLive player={playback.player} segments={playback.segments} />
    </KkPracticeView.Head>
    <KkPracticeView.Hero>
      <PracticeHero studio={studio} playback={playback} practice={practice} video={video} />
    </KkPracticeView.Hero>
    <KkPracticeView.Side>
      <PracticeSide studio={studio} playback={playback} practice={practice} video={video} />
    </KkPracticeView.Side>
    <KkPracticeView.Controls>
      <PracticeBarControls playback={playback} practice={practice} />
    </KkPracticeView.Controls>
    <PracticeSteps steps={steps} />
  </KkPracticeView>
);
