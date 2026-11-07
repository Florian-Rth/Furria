import { countTrackOf } from '@furria/studio/count-marks';
import { DeskReadoutLive } from '@furria/studio/DeskReadoutLive';
import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import { StudioSetupChip } from '@furria/studio/StudioSetupChip';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';
import {
  EJ_DONE,
  EJ_DONE_LABEL,
  EJ_HEAD,
  EJ_HISTORY,
  EJ_HISTORY_GROUP,
  EJ_MUSIC_PAGE,
  EJ_PAUSE,
  EJ_PLAY,
  EJ_REDO,
  EJ_STEP_BACK,
  EJ_STEP_FORWARD,
  EJ_TRANSPORT,
  EJ_UNDO,
} from '../edit-jobs-copy';
import type { EjDesk } from '../hooks/use-ej-desk';
import { EjTransportExtras } from './EjTransportExtras';

interface EjDeskHeadProps {
  ej: EjDesk;
}

export const EjDeskHead: FC<EjDeskHeadProps> = ({ ej }) => {
  const { screen } = ej;
  const { practice, playback, history, mode } = screen;
  const counts = countTrackOf(playback.countMarks);
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
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const historyText = EJ_HISTORY;
  const historyOpen = ej.pane === 'history';
  const setupOpen = ej.pane === 'setup';
  const music =
    screen.evening === null ? (
      <KkEjButton text={EJ_MUSIC_PAGE} glyph="music" onPress={ej.openMusic} />
    ) : null;

  return (
    <KkLaneBar label={EJ_HEAD}>
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
        <DeskReadoutLive player={playback.player} counts={counts} />
        <EjTransportExtras screen={screen} compact={false} />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={EJ_HISTORY_GROUP}>
        <KkEjButton
          text={EJ_UNDO}
          glyph="undo"
          textShown={false}
          disabled={undoLocked}
          onPress={history.undo}
        />
        <KkEjButton
          text={EJ_REDO}
          glyph="redo"
          textShown={false}
          disabled={redoLocked}
          onPress={history.redo}
        />
        <StudioSaveButton history={history} />
        <KkEjButton
          text={historyText}
          glyph="history"
          pressed={historyOpen}
          onPress={ej.toggleHistory}
        />
        <StudioSetupChip setup={ej.setup} expanded={setupOpen} onToggle={ej.toggleSetup} />
        {music}
        <KkEjButton
          text={EJ_DONE}
          glyph="check"
          tone="accent"
          label={EJ_DONE_LABEL}
          onPress={mode.toggle}
        />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
