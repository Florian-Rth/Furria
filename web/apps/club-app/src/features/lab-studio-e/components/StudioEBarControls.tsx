import { KkStudioETransport } from '@furria/ui/KkStudioETransport';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioEPractice } from '../hooks/use-studio-e-practice';
import {
  barStatusOf,
  STUDIO_E_BACK,
  STUDIO_E_FORWARD,
  STUDIO_E_TRANSPORT_LABEL,
} from '../studio-e-copy';
import { StudioESegmentsLive } from './StudioESegmentsLive';

interface StudioEBarControlsProps {
  playback: StudioPlayback;
  practice: StudioEPractice;
}

export const StudioEBarControls: FC<StudioEBarControlsProps> = ({ playback, practice }) => {
  const status = barStatusOf(practice.loopKind, practice.partName);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };

  return (
    <KkStudioETransport label={STUDIO_E_TRANSPORT_LABEL}>
      <StudioESegmentsLive
        playback={playback}
        practice={practice}
        onPress={practice.loopStep}
        onHold={practice.loopPart}
      />
      <KkStudioETransport.Status
        statusKey={practice.loopKind}
        text={status}
        accent={practice.loopKind !== 'off'}
      />
      <KkStudioETransport.Pill>
        <KkStudioETransport.Skip
          direction="back"
          label={STUDIO_E_BACK}
          disabled={!practice.canStep}
          onSkip={back}
        />
        <KkStudioETransport.Play
          playing={practice.playing}
          label={practice.playLabel}
          disabled={!practice.canPlay}
          onToggle={practice.toggle}
        />
        <KkStudioETransport.Skip
          direction="forward"
          label={STUDIO_E_FORWARD}
          disabled={!practice.canStep}
          onSkip={forward}
        />
        <KkStudioETransport.Divider />
        <KkStudioETransport.Rate
          text={practice.rateText}
          label={practice.rateLabel}
          slowed={practice.slowed}
          onPress={practice.slowDown}
        />
      </KkStudioETransport.Pill>
    </KkStudioETransport>
  );
};
