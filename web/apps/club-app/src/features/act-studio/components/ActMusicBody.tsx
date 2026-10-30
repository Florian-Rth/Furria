import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { ActMusicPage } from '../hooks/use-act-music-page';
import { useActStudioFinal } from '../hooks/use-act-studio-final';
import { useActStudioSongs } from '../hooks/use-act-studio-songs';
import { useActStudioTakes } from '../hooks/use-act-studio-takes';
import { useStepCardKeys } from '../hooks/use-step-card-keys';
import { useStudioScreen } from '../hooks/use-studio-screen';
import { useVisitHistory } from '../hooks/use-visit-history';
import type { StudioMusicTool } from '../schemas';
import {
  MUSIC_PAGE_LIST,
  MUSIC_PAGE_MUSIC,
  MUSIC_PAGE_TABS,
  MUSIC_PAGE_TITLE,
  MUSIC_PAGE_VIDEO,
  STEP_CARDS_HISTORY,
  STEP_CARDS_REDO,
  STEP_CARDS_UNDO,
} from '../step-cards-copy';
import { ActStudioFinalDesk } from './ActStudioFinalDesk';
import { ActStudioSongDesk } from './ActStudioSongDesk';
import { ActStudioSongList } from './ActStudioSongList';
import { ActStudioTakeList } from './ActStudioTakeList';
import { ActStudioVideoDesk } from './ActStudioVideoDesk';
import { ActStudioWaveLayer } from './ActStudioWaveLayer';
import { StepCardsTransport } from './StepCardsTransport';

interface ActMusicBodyProps {
  page: ActMusicPage;
  actId: number;
  studio: Studio;
}

export const ActMusicBody: FC<ActMusicBodyProps> = ({ page, actId, studio }) => {
  const screen = useStudioScreen(actId, studio, page.viewerId, page.canEdit, page.cast, {
    evening: null,
    startEditing: true,
    startHall: null,
    startTool: page.tool,
  });
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const takes = useActStudioTakes(screen);
  const history = useVisitHistory(actId, screen.studio);
  const deskOpen = songs.deskOpen || takes.deskOpen || finalList.desk !== null;
  useStepCardKeys(screen, !deskOpen);
  const choose = (tool: StudioMusicTool): void => {
    screen.mode.choose(tool);
    page.chooseTool(tool);
  };
  const music = (): void => {
    choose('music');
  };
  const video = (): void => {
    choose('video');
  };
  const onMusic = screen.mode.tool === 'music';
  const onVideo = screen.mode.tool === 'video';
  const list = onVideo ? (
    <ActStudioTakeList screen={screen} takes={takes} />
  ) : (
    <ActStudioSongList screen={screen} songs={songs} finalList={finalList} />
  );
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;

  return (
    <KkLanePhone label={MUSIC_PAGE_TITLE} narrow>
      <KkLanePhone.Area area="head">
        <KkLaneBar label={MUSIC_PAGE_TITLE}>
          <KkLaneBar.Group label={MUSIC_PAGE_TABS} grow>
            <KkLaneButton text={MUSIC_PAGE_MUSIC} glyph="music" pressed={onMusic} onPress={music} />
            <KkLaneButton text={MUSIC_PAGE_VIDEO} glyph="video" pressed={onVideo} onPress={video} />
          </KkLaneBar.Group>
          <KkLaneBar.Group label={STEP_CARDS_HISTORY}>
            <KkLaneButton
              text={STEP_CARDS_UNDO}
              glyph="undo"
              textShown={false}
              disabled={undoLocked}
              onPress={history.undo}
            />
            <KkLaneButton
              text={STEP_CARDS_REDO}
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
          <KkLaneDesk.Panel label={MUSIC_PAGE_MUSIC} kind="region">
            <ActStudioWaveLayer screen={screen} />
          </KkLaneDesk.Panel>
          <KkLaneDesk.Panel label={MUSIC_PAGE_LIST} kind="region">
            <KkLaneInspector>{list}</KkLaneInspector>
          </KkLaneDesk.Panel>
        </KkLanePhone.Split>
      </KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <StepCardsTransport screen={screen} />
      </KkLanePhone.Area>
      <ActStudioSongDesk screen={screen} songs={songs} />
      <ActStudioFinalDesk screen={screen} finalList={finalList} />
      <ActStudioVideoDesk screen={screen} takes={takes} />
    </KkLanePhone>
  );
};
