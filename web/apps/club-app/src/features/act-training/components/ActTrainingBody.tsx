import { KkTrainingView } from '@furria/ui/KkTrainingView';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useActTraining } from '../hooks/use-act-training';
import { TRAINING_SCREEN_LABEL } from '../training-copy';

interface ActTrainingBodyProps {
  studio: Studio;
  training: StudioTraining | null;
  cast: readonly CastPerson[];
}

export const ActTrainingBody: FC<ActTrainingBodyProps> = ({ studio, training, cast }) => {
  const view = useActTraining(studio, training, cast);
  const gaps =
    view.gaps === null ? null : (
      <KkTrainingView.Gaps>
        <KkTrainingView.Notice text={view.gaps} />
      </KkTrainingView.Gaps>
    );

  return (
    <KkTrainingView label={TRAINING_SCREEN_LABEL}>
      <KkTrainingView.Head>
        <KkTrainingView.Heading title={view.title} tally={view.tally} />
      </KkTrainingView.Head>
      <KkTrainingView.Count>
        <KkTrainingView.Beat
          count={view.count}
          countLabel={view.countLabel}
          stepName={view.stepName}
          stepMeta={view.stepMeta}
        />
      </KkTrainingView.Count>
      {gaps}
      <KkTrainingView.Stage>
        <PracticeStageLayer studio={view.studio} playback={view.playback} />
      </KkTrainingView.Stage>
      <KkTrainingView.Controls>
        <KkTrainingView.Keys
          playing={view.playing}
          playLabel={view.playLabel}
          backLabel={view.backLabel}
          loopLabel={view.loopLabel}
          looping={view.looping}
          canPlay={view.canPlay}
          canLoop={view.canLoop}
          onToggle={view.toggle}
          onBack={view.back}
          onLoop={view.loop}
        />
      </KkTrainingView.Controls>
    </KkTrainingView>
  );
};
