import { countTrackOf } from '@furria/studio/count-marks';
import { JobPhoneReadout } from '@furria/studio/JobPhoneReadout';
import { JobTransportExtras } from '@furria/studio/JobTransportExtras';
import {
  JOB_PAUSE,
  JOB_PLAY,
  JOB_STEP_BACK,
  JOB_STEP_FORWARD,
  JOB_TRANSPORT,
} from '@furria/studio/job-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobPhoneTransportProps {
  screen: StudioScreen;
}

export const JobPhoneTransport: FC<JobPhoneTransportProps> = ({ screen }) => {
  const { practice, playback } = screen;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const playText = practice.playing ? JOB_PAUSE : JOB_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const counts = countTrackOf(playback.countMarks);

  return (
    <KkLaneBar label={JOB_TRANSPORT}>
      <KkLaneBar.Group label={JOB_TRANSPORT} grow>
        <KkPillButton
          text={JOB_STEP_BACK}
          glyph="back"
          textShown={false}
          disabled={stepLocked}
          onPress={back}
        />
        <KkPillButton
          text={playText}
          glyph={playGlyph}
          tone="accent"
          textShown={false}
          disabled={playLocked}
          onPress={practice.toggle}
        />
        <KkPillButton
          text={JOB_STEP_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
        <JobPhoneReadout player={playback.player} counts={counts} />
        <JobTransportExtras screen={screen} compact />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
