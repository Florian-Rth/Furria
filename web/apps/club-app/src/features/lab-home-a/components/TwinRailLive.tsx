import { KkPracticeSegments } from '@furria/ui/KkPracticeSegments';
import type { FC } from 'react';
import { shownStepNameOf } from '@/features/act-player/step-names';
import { PracticeSegmentFillLive } from '@/features/act-practice/components/PracticeSegmentFillLive';
import { usePracticeSegments } from '@/features/act-practice/hooks/use-practice-segments';
import { PRACTICE_SEGMENTS_LABEL } from '@/features/act-practice/practice-copy';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { railLabelOf } from '../twin-copy';

interface TwinRailLiveProps {
  screen: TwinScreen;
}

export const TwinRailLive: FC<TwinRailLiveProps> = ({ screen }) => {
  const { playback, practice } = screen;
  const groups = usePracticeSegments(playback, practice).map((group) => {
    const segments = group.segments.map((segment) => {
      const jump = (): void => {
        practice.jumpTo(segment.stepId);
      };
      const loopStep = (): void => {
        practice.loopStep(segment.stepId);
      };
      const label = railLabelOf(shownStepNameOf(segment.step.name, segment.number));

      return (
        <KkPracticeSegments.Segment
          key={segment.stepId}
          grow={segment.grow}
          number={segment.number}
          label={label}
          current={segment.current}
          looped={segment.looped}
          onPress={jump}
          onHold={loopStep}
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
        practice.loopPart(part.firstStepId);
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
