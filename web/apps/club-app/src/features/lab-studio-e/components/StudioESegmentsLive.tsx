import { KkStudioESegments } from '@furria/ui/KkStudioESegments';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioEPractice } from '../hooks/use-studio-e-practice';
import { useStudioESegments } from '../hooks/use-studio-e-segments';
import { STUDIO_E_SEGMENTS_LABEL } from '../studio-e-copy';
import { StudioESegmentFillLive } from './StudioESegmentFillLive';

interface StudioESegmentsLiveProps {
  playback: StudioPlayback;
  practice: StudioEPractice;
  onPress: (stepId: number) => void;
  onHold: (stepId: number) => void;
}

export const StudioESegmentsLive: FC<StudioESegmentsLiveProps> = ({
  playback,
  practice,
  onPress,
  onHold,
}) => {
  const groups = useStudioESegments(playback, practice).map((group) => {
    const segments = group.segments.map((segment) => {
      const press = (): void => {
        onPress(segment.stepId);
      };
      const hold = (): void => {
        onHold(segment.stepId);
      };

      return (
        <KkStudioESegments.Segment
          key={segment.stepId}
          grow={segment.grow}
          label={segment.label}
          current={segment.current}
          looped={segment.looped}
          onPress={press}
          onHold={hold}
        >
          <StudioESegmentFillLive
            player={playback.player}
            step={segment.step}
            current={segment.current}
          />
        </KkStudioESegments.Segment>
      );
    });
    const name =
      group.name !== null ? (
        <KkStudioESegments.Label text={group.name} current={group.current} />
      ) : null;

    return (
      <KkStudioESegments.Group key={group.key} grow={group.grow}>
        <KkStudioESegments.Track>{segments}</KkStudioESegments.Track>
        {name}
      </KkStudioESegments.Group>
    );
  });

  return <KkStudioESegments label={STUDIO_E_SEGMENTS_LABEL}>{groups}</KkStudioESegments>;
};
