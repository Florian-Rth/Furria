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
  onPress: (stepId: number) => void;
  onHold: (stepId: number) => void;
}

export const PracticeSegmentsLive: FC<PracticeSegmentsLiveProps> = ({
  playback,
  practice,
  onPress,
  onHold,
}) => {
  const groups = usePracticeSegments(playback, practice).map((group) => {
    const segments = group.segments.map((segment) => {
      const press = (): void => {
        onPress(segment.stepId);
      };
      const hold = (): void => {
        onHold(segment.stepId);
      };

      return (
        <KkPracticeSegments.Segment
          key={segment.stepId}
          grow={segment.grow}
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
    const name =
      group.name !== null ? (
        <KkPracticeSegments.Label text={group.name} current={group.current} />
      ) : null;

    return (
      <KkPracticeSegments.Group key={group.key} grow={group.grow}>
        <KkPracticeSegments.Track>{segments}</KkPracticeSegments.Track>
        {name}
      </KkPracticeSegments.Group>
    );
  });

  return <KkPracticeSegments label={PRACTICE_SEGMENTS_LABEL}>{groups}</KkPracticeSegments>;
};
