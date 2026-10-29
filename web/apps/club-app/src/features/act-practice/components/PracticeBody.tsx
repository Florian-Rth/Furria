import { KkPracticeDescription } from '@furria/ui/KkPracticeDescription';
import { KkPracticeStepName } from '@furria/ui/KkPracticeStepName';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import type { FC } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { usePractice } from '../hooks/use-practice';
import { usePracticeMemory } from '../hooks/use-practice-memory';
import { usePracticeSteps } from '../hooks/use-practice-steps';
import { usePracticeVideo } from '../hooks/use-practice-video';
import { PRACTICE_LABEL, PRACTICE_STEPS_OPEN } from '../practice-copy';
import { PracticeBarControls } from './PracticeBarControls';
import { PracticeCountLive } from './PracticeCountLive';
import { PracticeHero } from './PracticeHero';
import { PracticeSide } from './PracticeSide';
import { PracticeSteps } from './PracticeSteps';

interface PracticeBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
}

export const PracticeBody: FC<PracticeBodyProps> = ({ actId, studio, viewerId }) => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const steps = usePracticeSteps(studio, playback, practice);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);

  return (
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
};
