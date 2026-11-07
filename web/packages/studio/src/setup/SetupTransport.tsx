import { countTrackOf } from '@furria/studio/count-marks';
import { JobPhoneReadout } from '@furria/studio/JobPhoneReadout';
import type { TimelineRange } from '@furria/studio/music-timeline';
import { SetupTransportGroup } from '@furria/studio/SetupTransportGroup';
import { SetupZoomTools } from '@furria/studio/SetupZoomTools';
import {
  SS_LOOP_SHORT,
  SS_LOOP_STEP,
  SS_STEP_BACK,
  SS_STEP_FORWARD,
  SS_TRANSPORT,
  SS_TRANSPORT_PRACTICE,
  SS_TRANSPORT_STEPS,
  tempoShortOf,
} from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface SetupTransportProps {
  screen: StudioScreen;
  centre: CentreScrub;
  wide: boolean;
  playSpan: TimelineRange | null;
}

const END_ROOM = 0.05;

export const SetupTransport: FC<SetupTransportProps> = ({ screen, centre, wide, playSpan }) => {
  const { practice, playback } = screen;
  const { player } = playback;
  const toggle = (): void => {
    const at = player.position();
    if (
      !practice.playing &&
      playSpan !== null &&
      (at < playSpan.start || at >= playSpan.end - END_ROOM)
    ) {
      player.seek(playSpan.start);
    }
    practice.toggle();
  };
  const step = practice.step;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const loop = (): void => {
    if (step !== null) {
      practice.loopStep(step.stepId);
    }
  };
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const looping = practice.loopKind === 'step';
  const noStep = step === null;
  const tempo = tempoShortOf(practice.percent);
  const counts = countTrackOf(playback.countMarks);
  const repeatAndTempo = (
    <>
      <KkLaneButton
        text={SS_LOOP_SHORT}
        label={SS_LOOP_STEP}
        glyph="loop"
        textShown={wide}
        pressed={looping}
        disabled={noStep}
        onPress={loop}
      />
      <KkLaneButton
        text={tempo}
        label={practice.rateLabel}
        pressed={practice.slowed}
        onPress={practice.slowDown}
      />
    </>
  );
  const practiceTools = wide ? (
    <SetupTransportGroup label={SS_TRANSPORT_PRACTICE}>{repeatAndTempo}</SetupTransportGroup>
  ) : (
    repeatAndTempo
  );
  const desk = wide ? (
    <>
      <JobPhoneReadout player={player} counts={counts} />
      <SetupZoomTools centre={centre} />
    </>
  ) : null;

  return (
    <Stack
      direction="row"
      role="toolbar"
      aria-label={SS_TRANSPORT}
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
    >
      <SetupTransportGroup label={SS_TRANSPORT_STEPS}>
        <KkLaneButton
          text={SS_STEP_BACK}
          glyph="back"
          textShown={false}
          disabled={stepLocked}
          onPress={back}
        />
        <KkLaneButton
          text={practice.playLabel}
          glyph={playGlyph}
          tone="ink"
          textShown={false}
          disabled={playLocked}
          onPress={toggle}
        />
        <KkLaneButton
          text={SS_STEP_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
      </SetupTransportGroup>
      {practiceTools}
      {desk}
    </Stack>
  );
};
