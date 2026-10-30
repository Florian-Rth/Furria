import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioGTransport } from '@furria/ui/KkStudioGTransport';
import type { FC } from 'react';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { useStudioGTransport } from '../hooks/use-studio-g-transport';
import { NEXT_STEP, PREVIOUS_STEP, TRANSPORT_LABEL } from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { StudioGClockLive } from './StudioGClockLive';

interface StudioGTransportProps {
  desk: StudioGDesk;
  practice: Practice;
}

export const StudioGTransport: FC<StudioGTransportProps> = ({ desk, practice }) => {
  const transport = useStudioGTransport(desk, practice);

  return (
    <KkStudioGTransport label={TRANSPORT_LABEL}>
      <StudioGClockLive player={desk.playback.player} marks={desk.playback.countMarks} />
      <KkPracticeTransport.Pill>
        <KkPracticeTransport.Skip
          direction="back"
          label={PREVIOUS_STEP}
          disabled={!practice.canStep}
          onSkip={transport.back}
        />
        <KkPracticeTransport.Play
          playing={practice.playing}
          label={practice.playLabel}
          disabled={!practice.canPlay}
          onToggle={practice.toggle}
        />
        <KkPracticeTransport.Skip
          direction="forward"
          label={NEXT_STEP}
          disabled={!practice.canStep}
          onSkip={transport.forward}
        />
      </KkPracticeTransport.Pill>
      <KkStudioGTransport.End>
        <KkStudioGTransport.Tool
          kind="loop"
          label={transport.loopLabel}
          pressed={transport.looping}
          onPress={transport.loop}
        />
      </KkStudioGTransport.End>
    </KkStudioGTransport>
  );
};
