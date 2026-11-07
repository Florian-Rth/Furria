import { countTrackOf } from '@furria/studio/count-marks';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';
import { EJ_PAUSE, EJ_PLAY, EJ_STEP_BACK, EJ_STEP_FORWARD, EJ_TRANSPORT } from '../edit-jobs-copy';
import { EjPhoneReadout } from './EjPhoneReadout';
import { EjTransportExtras } from './EjTransportExtras';

interface EjPhoneTransportProps {
  screen: StudioScreen;
}

export const EjPhoneTransport: FC<EjPhoneTransportProps> = ({ screen }) => {
  const { practice, playback } = screen;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const playText = practice.playing ? EJ_PAUSE : EJ_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const counts = countTrackOf(playback.countMarks);

  return (
    <KkLaneBar label={EJ_TRANSPORT}>
      <KkLaneBar.Group label={EJ_TRANSPORT} grow>
        <KkEjButton
          text={EJ_STEP_BACK}
          glyph="back"
          textShown={false}
          disabled={stepLocked}
          onPress={back}
        />
        <KkEjButton
          text={playText}
          glyph={playGlyph}
          tone="accent"
          textShown={false}
          disabled={playLocked}
          onPress={practice.toggle}
        />
        <KkEjButton
          text={EJ_STEP_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
        <EjPhoneReadout player={playback.player} counts={counts} />
        <EjTransportExtras screen={screen} compact />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
