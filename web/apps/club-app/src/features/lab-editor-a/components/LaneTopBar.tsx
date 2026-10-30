import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import type { FC } from 'react';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneRoutes } from '../hooks/use-lane-routes';
import type { LaneZoom } from '../hooks/use-lane-zoom';
import {
  LANE_BACK,
  LANE_BAR_LABEL,
  LANE_FIT,
  LANE_FORWARD,
  LANE_HISTORY_GROUP,
  LANE_MUSIC_PAGE,
  LANE_PAUSE,
  LANE_PLAY,
  LANE_REDO,
  LANE_TRANSPORT,
  LANE_UNDO,
  LANE_ZOOM,
  LANE_ZOOM_IN,
  LANE_ZOOM_OUT,
  progressLabelOf,
  progressTextOf,
} from '../lane-copy';
import { LaneReadoutLive } from './LaneReadoutLive';

interface LaneTopBarProps {
  lane: LaneEditor;
  zoom: LaneZoom;
}

export const LaneTopBar: FC<LaneTopBarProps> = ({ lane, zoom }) => {
  const { screen, setup } = lane;
  const { practice, playback } = screen;
  const history = useVisitHistory(screen.actId, screen.studio);
  const routes = useLaneRoutes(screen.actId, screen.evening);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const zoomIn = (): void => {
    zoom.zoom(1);
  };
  const zoomOut = (): void => {
    zoom.zoom(-1);
  };
  const music = (): void => {
    routes.openMusic('music');
  };
  const playText = practice.playing ? LANE_PAUSE : LANE_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const progressText = progressTextOf(setup.done, setup.total);
  const progressLabel = progressLabelOf(setup.done, setup.total);
  const zoomInLocked = !zoom.canIn;
  const zoomOutLocked = !zoom.canOut;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;

  return (
    <KkLaneBar label={LANE_BAR_LABEL}>
      <KkLaneBar.Group label={LANE_TRANSPORT}>
        <KkLaneButton
          text={LANE_BACK}
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
          text={LANE_FORWARD}
          glyph="forward"
          textShown={false}
          disabled={stepLocked}
          onPress={forward}
        />
        <LaneReadoutLive player={playback.player} marks={playback.countMarks} />
        <KkLaneButton
          text={practice.rateText}
          label={practice.rateLabel}
          pressed={practice.slowed}
          onPress={practice.slowDown}
        />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={LANE_ZOOM} grow>
        <KkLaneButton
          text={LANE_ZOOM_OUT}
          glyph="zoomOut"
          textShown={false}
          disabled={zoomOutLocked}
          onPress={zoomOut}
        />
        <KkLaneButton
          text={LANE_ZOOM_IN}
          glyph="zoomIn"
          textShown={false}
          disabled={zoomInLocked}
          onPress={zoomIn}
        />
        <KkLaneButton
          text={LANE_FIT}
          glyph="fit"
          textShown={false}
          pressed={zoom.fitted}
          onPress={zoom.fit}
        />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={LANE_HISTORY_GROUP}>
        <KkLaneButton text={LANE_UNDO} glyph="undo" disabled={undoLocked} onPress={history.undo} />
        <KkLaneButton
          text={LANE_REDO}
          glyph="redo"
          textShown={false}
          disabled={redoLocked}
          onPress={history.redo}
        />
        <KkLaneButton text={LANE_MUSIC_PAGE} glyph="music" onPress={music} />
        <KkLaneProgress
          done={setup.done}
          total={setup.total}
          text={progressText}
          label={progressLabel}
          expanded={lane.setupShown}
          onPress={lane.toggleSetup}
        />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
