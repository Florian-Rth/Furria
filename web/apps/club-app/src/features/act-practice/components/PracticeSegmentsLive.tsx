import { KkPracticeSegments } from '@furria/ui/KkPracticeSegments';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Practice } from '../hooks/use-practice';
import { usePracticeSegments } from '../hooks/use-practice-segments';
import { PRACTICE_SEGMENTS_LABEL } from '../practice-copy';
import { PracticeSegmentFillLive } from './PracticeSegmentFillLive';

interface PracticeSegmentsLiveProps {
  playback: StudioPlayback;
  practice: Practice;
  onLoopStep: (stepId: number) => void;
  onLoopPart: (stepId: number) => void;
}

export const PracticeSegmentsLive: FC<PracticeSegmentsLiveProps> = ({
  playback,
  practice,
  onLoopStep,
  onLoopPart,
}) => {
  const groups = usePracticeSegments(playback, practice).map((group) => {
    const segments = group.segments.map((segment) => {
      const press = (): void => {
        onLoopStep(segment.stepId);
      };
      const hold = (): void => {
        onLoopPart(segment.stepId);
      };

      return (
        <KkPracticeSegments.Segment
          key={segment.stepId}
          grow={segment.grow}
          number={segment.number}
          label={segment.label}
          current={segment.current}
          looped={segment.looped}
          onPress={press}
          onHold={hold}
        >
          <PracticeSegmentFillLive
            player={playback.player}
            step={segment.step}
            current={segment.current}
          />
        </KkPracticeSegments.Segment>
      );
    });
    const { part } = group;
    const loopPart = (): void => {
      if (part !== null) {
        onLoopPart(part.firstStepId);
      }
    };
    const partKey =
      part === null ? null : (
        <KkPracticeSegments.Part
          name={part.name}
          label={part.label}
          current={group.current}
          looped={part.looped}
          onPress={loopPart}
        />
      );

    return (
      <KkPracticeSegments.Group key={group.key} grow={group.grow}>
        {partKey}
        {segments}
      </KkPracticeSegments.Group>
    );
  });

  return <KkPracticeSegments label={PRACTICE_SEGMENTS_LABEL}>{groups}</KkPracticeSegments>;
};
