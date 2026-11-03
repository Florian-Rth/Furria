import {
  DESK_BACK,
  DESK_BAR_LABEL,
  DESK_DONE,
  DESK_DONE_LABEL,
  DESK_FIT,
  DESK_FORWARD,
  DESK_HISTORY_GROUP,
  DESK_MUSIC_PAGE,
  DESK_PAUSE,
  DESK_PLAY,
  DESK_REDO,
  DESK_TRANSPORT,
  DESK_UNDO,
  DESK_ZOOM,
  DESK_ZOOM_IN,
  DESK_ZOOM_OUT,
} from '@furria/studio/desk-copy';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';
import { StudioSaveButton } from '@/features/act-studio/components/StudioSaveButton';
import { StudioSetupChip } from '@/features/act-studio/components/StudioSetupChip';
import { useStudioMusicRoute } from '@/features/act-studio/hooks/use-studio-music-route';
import type { StudioSetup } from '@/features/act-studio/hooks/use-studio-setup';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { ActDesk } from '../hooks/use-act-desk';
import { DeskReadoutLive } from './DeskReadoutLive';

interface DeskTopBarProps {
  desk: ActDesk;
  centre: CentreScrub;
  setup: StudioSetup;
}

export const DeskTopBar: FC<DeskTopBarProps> = ({ desk, centre, setup }) => {
  const { screen } = desk;
  const { practice, playback, mode } = screen;
  const history = useVisitHistory(screen.actId, screen.studio);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const zoomIn = (): void => {
    centre.zoomBy(1);
  };
  const zoomOut = (): void => {
    centre.zoomBy(-1);
  };
  const openMusic = useStudioMusicRoute(screen.actId);
  const music = (): void => {
    openMusic('music');
  };
  const musicButton =
    screen.evening === null ? (
      <KkLaneButton text={DESK_MUSIC_PAGE} glyph="music" onPress={music} />
    ) : null;
  const playText = practice.playing ? DESK_PAUSE : DESK_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const zoomInLocked = !centre.canZoomIn;
  const zoomOutLocked = !centre.canZoomOut;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const setupOpen = desk.tab === 'setup';

  return (
    <KkLaneBar label={DESK_BAR_LABEL}>
      <KkLaneBar.Group label={DESK_TRANSPORT}>
        <KkLaneButton
          text={DESK_BACK}
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
          text={DESK_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
        <DeskReadoutLive player={playback.player} marks={playback.countMarks} />
        <KkLaneButton
          text={practice.rateText}
          label={practice.rateLabel}
          pressed={practice.slowed}
          onPress={practice.slowDown}
        />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={DESK_ZOOM} grow>
        <KkLaneButton
          text={DESK_ZOOM_OUT}
          glyph="zoomOut"
          textShown={false}
          disabled={zoomOutLocked}
          onPress={zoomOut}
        />
        <KkLaneButton
          text={DESK_ZOOM_IN}
          glyph="zoomIn"
          textShown={false}
          disabled={zoomInLocked}
          onPress={zoomIn}
        />
        <KkLaneButton
          text={DESK_FIT}
          glyph="fit"
          textShown={false}
          pressed={centre.fitted}
          onPress={centre.fit}
        />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={DESK_HISTORY_GROUP}>
        <KkLaneButton text={DESK_UNDO} glyph="undo" disabled={undoLocked} onPress={history.undo} />
        <KkLaneButton
          text={DESK_REDO}
          glyph="redo"
          textShown={false}
          disabled={redoLocked}
          onPress={history.redo}
        />
        <StudioSaveButton history={history} />
        {musicButton}
        <StudioSetupChip setup={setup} expanded={setupOpen} onToggle={desk.toggleSetup} />
        <KkLaneButton
          text={DESK_DONE}
          glyph="check"
          tone="accent"
          label={DESK_DONE_LABEL}
          onPress={mode.toggle}
        />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
