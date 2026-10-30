import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import type { FC } from 'react';
import type { StudioITransport } from '../hooks/use-studio-i-transport';
import { STUDIO_I_NEXT, STUDIO_I_PREVIOUS, STUDIO_I_TRANSPORT } from '../studio-i-copy';

interface StudioITransportViewProps {
  transport: StudioITransport;
}

export const StudioITransportView: FC<StudioITransportViewProps> = ({ transport }) => (
  <KkPracticeTransport label={STUDIO_I_TRANSPORT}>
    <KkPracticeTransport.Status
      statusKey={transport.statusKey}
      text={transport.status}
      accent={transport.playing}
    />
    <KkPracticeTransport.Pill>
      <KkPracticeTransport.Skip
        direction="back"
        label={STUDIO_I_PREVIOUS}
        disabled={!transport.canBack}
        onSkip={transport.back}
      />
      <KkPracticeTransport.Play
        playing={transport.playing}
        label={transport.playLabel}
        disabled={!transport.canPlay}
        onToggle={transport.toggle}
      />
      <KkPracticeTransport.Skip
        direction="forward"
        label={STUDIO_I_NEXT}
        disabled={!transport.canForward}
        onSkip={transport.forward}
      />
      <KkPracticeTransport.Divider />
      <KkPracticeTransport.Rate
        text={transport.rateText}
        label={transport.rateLabel}
        slowed={transport.slowed}
        onPress={transport.slowDown}
      />
    </KkPracticeTransport.Pill>
  </KkPracticeTransport>
);
