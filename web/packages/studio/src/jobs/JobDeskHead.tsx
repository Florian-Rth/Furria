import { countTrackOf } from '@furria/studio/count-marks';
import { DeskReadoutLive } from '@furria/studio/DeskReadoutLive';
import { JobTransportExtras } from '@furria/studio/JobTransportExtras';
import {
  JOB_DONE,
  JOB_DONE_LABEL,
  JOB_HEAD,
  JOB_HISTORY,
  JOB_HISTORY_GROUP,
  JOB_MUSIC_PAGE,
  JOB_PAUSE,
  JOB_PLAY,
  JOB_REDO,
  JOB_STEP_BACK,
  JOB_STEP_FORWARD,
  JOB_TRANSPORT,
  JOB_UNDO,
} from '@furria/studio/job-copy';
import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import { StudioSetupChip } from '@furria/studio/StudioSetupChip';
import type { JobDesk } from '@furria/studio/use-job-desk';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobDeskHeadProps {
  jobDesk: JobDesk;
}

export const JobDeskHead: FC<JobDeskHeadProps> = ({ jobDesk }) => {
  const { screen } = jobDesk;
  const { practice, playback, history, mode } = screen;
  const counts = countTrackOf(playback.countMarks);
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
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const historyText = JOB_HISTORY;
  const historyOpen = jobDesk.pane === 'history';
  const setupOpen = jobDesk.pane === 'setup';
  const music =
    screen.evening === null ? (
      <KkPillButton text={JOB_MUSIC_PAGE} glyph="music" onPress={jobDesk.openMusic} />
    ) : null;

  return (
    <KkLaneBar label={JOB_HEAD}>
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
        <DeskReadoutLive player={playback.player} counts={counts} />
        <JobTransportExtras screen={screen} compact={false} />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={JOB_HISTORY_GROUP}>
        <KkPillButton
          text={JOB_UNDO}
          glyph="undo"
          textShown={false}
          disabled={undoLocked}
          onPress={history.undo}
        />
        <KkPillButton
          text={JOB_REDO}
          glyph="redo"
          textShown={false}
          disabled={redoLocked}
          onPress={history.redo}
        />
        <StudioSaveButton history={history} />
        <KkPillButton
          text={historyText}
          glyph="history"
          pressed={historyOpen}
          onPress={jobDesk.toggleHistory}
        />
        <StudioSetupChip
          setup={jobDesk.setup}
          expanded={setupOpen}
          onToggle={jobDesk.toggleSetup}
        />
        {music}
        <KkPillButton
          text={JOB_DONE}
          glyph="check"
          tone="accent"
          label={JOB_DONE_LABEL}
          onPress={mode.toggle}
        />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
