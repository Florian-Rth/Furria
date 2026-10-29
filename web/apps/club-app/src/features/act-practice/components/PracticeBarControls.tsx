import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Practice } from '../hooks/use-practice';
import {
  barStatusOf,
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_TRANSPORT_LABEL,
} from '../practice-copy';
import { PracticeSegmentsLive } from './PracticeSegmentsLive';

interface PracticeBarControlsProps {
  playback: StudioPlayback;
  practice: Practice;
}

export const PracticeBarControls: FC<PracticeBarControlsProps> = ({ playback, practice }) => {
  const status = barStatusOf(practice.loopKind, practice.partName);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };

  return (
    <KkPracticeTransport label={PRACTICE_TRANSPORT_LABEL}>
      <PracticeSegmentsLive
        playback={playback}
        practice={practice}
        onPress={practice.loopStep}
        onHold={practice.loopPart}
      />
      <KkPracticeTransport.Status
        statusKey={practice.loopKind}
        text={status}
        accent={practice.loopKind !== 'off'}
      />
      <KkPracticeTransport.Pill>
        <KkPracticeTransport.Skip
          direction="back"
          label={PRACTICE_BACK}
          disabled={!practice.canStep}
          onSkip={back}
        />
        <KkPracticeTransport.Play
          playing={practice.playing}
          label={practice.playLabel}
          disabled={!practice.canPlay}
          onToggle={practice.toggle}
        />
        <KkPracticeTransport.Skip
          direction="forward"
          label={PRACTICE_FORWARD}
          disabled={!practice.canStep}
          onSkip={forward}
        />
        <KkPracticeTransport.Divider />
        <KkPracticeTransport.Rate
          text={practice.rateText}
          label={practice.rateLabel}
          slowed={practice.slowed}
          onPress={practice.slowDown}
        />
      </KkPracticeTransport.Pill>
    </KkPracticeTransport>
  );
};
