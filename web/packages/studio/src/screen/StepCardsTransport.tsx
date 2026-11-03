import { countTrackOf } from '@furria/studio/count-marks';
import { StepCardsReadoutLive } from '@furria/studio/StepCardsReadoutLive';
import {
  STEP_CARDS_BACK,
  STEP_CARDS_FORWARD,
  STEP_CARDS_PAUSE,
  STEP_CARDS_PLAY,
  STEP_CARDS_TRANSPORT,
} from '@furria/studio/step-cards-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';

interface StepCardsTransportProps {
  screen: StudioScreen;
}

export const StepCardsTransport: FC<StepCardsTransportProps> = ({ screen }) => {
  const { practice, playback } = screen;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const playText = practice.playing ? STEP_CARDS_PAUSE : STEP_CARDS_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const counts = countTrackOf(playback.countMarks);

  return (
    <KkLaneBar label={STEP_CARDS_TRANSPORT}>
      <KkLaneBar.Group label={STEP_CARDS_TRANSPORT} grow>
        <KkLaneButton
          text={STEP_CARDS_BACK}
          glyph="back"
          textShown={false}
          disabled={stepLocked}
          onPress={back}
        />
        <KkLaneButton
          text={playText}
          glyph={playGlyph}
          tone="accent"
          textShown={false}
          disabled={playLocked}
          onPress={practice.toggle}
        />
        <KkLaneButton
          text={STEP_CARDS_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
        <StepCardsReadoutLive player={playback.player} counts={counts} />
      </KkLaneBar.Group>
      <KkLaneButton
        text={practice.rateText}
        label={practice.rateLabel}
        pressed={practice.slowed}
        onPress={practice.slowDown}
      />
    </KkLaneBar>
  );
};
