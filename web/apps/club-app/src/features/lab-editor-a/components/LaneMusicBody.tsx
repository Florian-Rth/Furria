import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { ActStudioFinalDesk } from '@/features/act-studio/components/ActStudioFinalDesk';
import { ActStudioSongDesk } from '@/features/act-studio/components/ActStudioSongDesk';
import { ActStudioSongList } from '@/features/act-studio/components/ActStudioSongList';
import { ActStudioTakeList } from '@/features/act-studio/components/ActStudioTakeList';
import { ActStudioVideoDesk } from '@/features/act-studio/components/ActStudioVideoDesk';
import { ActStudioWaveLayer } from '@/features/act-studio/components/ActStudioWaveLayer';
import { useActStudioFinal } from '@/features/act-studio/hooks/use-act-studio-final';
import { useActStudioSongs } from '@/features/act-studio/hooks/use-act-studio-songs';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { Studio } from '@/features/acts/schemas';
import { useLaneKeys } from '../hooks/use-lane-keys';
import type { LanePage } from '../hooks/use-lane-page';
import {
  LANE_BACK,
  LANE_FORWARD,
  LANE_HISTORY_GROUP,
  LANE_MUSIC,
  LANE_MUSIC_PAGE,
  LANE_MUSIC_TABS,
  LANE_PAUSE,
  LANE_PLAY,
  LANE_REDO,
  LANE_TRANSPORT,
  LANE_UNDO,
  LANE_VIDEO,
} from '../lane-copy';
import { LaneReadoutLive } from './LaneReadoutLive';

interface LaneMusicBodyProps {
  page: LanePage;
  actId: number;
  studio: Studio;
  tool: 'music' | 'video';
  onTool: (tool: 'music' | 'video') => void;
}

export const LaneMusicBody: FC<LaneMusicBodyProps> = ({ page, actId, studio, tool, onTool }) => {
  const screen = useStudioScreen(actId, studio, page.viewerId, page.canEdit, page.cast, {
    evening: page.evening,
    startEditing: true,
  });
  if (screen.mode.tool !== tool && screen.mode.tools.includes(tool)) {
    screen.mode.choose(tool);
  }
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const takes = useActStudioTakes(screen);
  const history = useVisitHistory(actId, screen.studio);
  useLaneKeys(screen, null);
  const { practice, playback } = screen;
  const onMusic = tool === 'music';
  const onVideo = !onMusic;
  const music = (): void => {
    onTool('music');
  };
  const video = (): void => {
    onTool('video');
  };
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const band =
    screen.eveningBand === null ? null : <KkStudioView.BandNote text={screen.eveningBand} />;
  const list = onMusic ? (
    <ActStudioSongList screen={screen} songs={songs} finalList={finalList} />
  ) : (
    <ActStudioTakeList screen={screen} takes={takes} />
  );
  const playText = practice.playing ? LANE_PAUSE : LANE_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;

  return (
    <KkLanePhone label={LANE_MUSIC_PAGE}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <KkLaneBar label={LANE_MUSIC_PAGE}>
          <KkLaneBar.Group label={LANE_MUSIC_TABS} grow>
            <KkLaneButton text={LANE_MUSIC} glyph="music" pressed={onMusic} onPress={music} />
            <KkLaneButton text={LANE_VIDEO} glyph="video" pressed={onVideo} onPress={video} />
          </KkLaneBar.Group>
          <KkLaneBar.Group label={LANE_HISTORY_GROUP}>
            <KkLaneButton
              text={LANE_UNDO}
              glyph="undo"
              textShown={false}
              disabled={undoLocked}
              onPress={history.undo}
            />
            <KkLaneButton
              text={LANE_REDO}
              glyph="redo"
              textShown={false}
              disabled={redoLocked}
              onPress={history.redo}
            />
          </KkLaneBar.Group>
        </KkLaneBar>
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">
        <KkLanePhone.Split>
          <KkLaneDesk.Panel label={LANE_MUSIC} kind="region">
            <ActStudioWaveLayer screen={screen} />
          </KkLaneDesk.Panel>
          <KkLaneDesk.Panel label={LANE_MUSIC_PAGE} kind="region">
            <KkLaneInspector>{list}</KkLaneInspector>
          </KkLaneDesk.Panel>
        </KkLanePhone.Split>
      </KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <KkLaneBar label={LANE_TRANSPORT}>
          <KkLaneBar.Group label={LANE_TRANSPORT} grow>
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
          </KkLaneBar.Group>
        </KkLaneBar>
      </KkLanePhone.Area>
      <ActStudioSongDesk screen={screen} songs={songs} />
      <ActStudioFinalDesk screen={screen} finalList={finalList} />
      <ActStudioVideoDesk screen={screen} takes={takes} />
    </KkLanePhone>
  );
};
