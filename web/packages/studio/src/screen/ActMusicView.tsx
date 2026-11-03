import { ActStudioFinalDesk } from '@furria/studio/ActStudioFinalDesk';
import { ActStudioSongDesk } from '@furria/studio/ActStudioSongDesk';
import { ActStudioSongList } from '@furria/studio/ActStudioSongList';
import { ActStudioTakeList } from '@furria/studio/ActStudioTakeList';
import { ActStudioVideoDesk } from '@furria/studio/ActStudioVideoDesk';
import { ActStudioWaveLayer } from '@furria/studio/ActStudioWaveLayer';
import { StepCardsTransport } from '@furria/studio/StepCardsTransport';
import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import {
  MUSIC_PAGE_LIST,
  MUSIC_PAGE_MUSIC,
  MUSIC_PAGE_TABS,
  MUSIC_PAGE_TITLE,
  MUSIC_PAGE_VIDEO,
  STEP_CARDS_HISTORY,
  STEP_CARDS_REDO,
  STEP_CARDS_UNDO,
} from '@furria/studio/step-cards-copy';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioFinal } from '@furria/studio/use-act-studio-final';
import { useActStudioSongs } from '@furria/studio/use-act-studio-songs';
import { useActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import type { FC } from 'react';

interface ActMusicViewProps {
  screen: StudioScreen;
  onTool: (tool: StudioMusicTool) => void;
}

export const ActMusicView: FC<ActMusicViewProps> = ({ screen, onTool }) => {
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const takes = useActStudioTakes(screen);
  const { history } = screen;
  const deskOpen = songs.deskOpen || takes.deskOpen || finalList.desk !== null;
  useStudioKeys(scrubKeyActionsOf(screen, null), !deskOpen);
  const choose = (tool: StudioMusicTool): void => {
    screen.mode.choose(tool);
    onTool(tool);
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
            <StudioSaveButton history={history} textShown={false} />
          </KkLaneBar.Group>
        </KkLaneBar>
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">
        <KkLanePhone.Split>
          <KkLaneDesk.Panel label={MUSIC_PAGE_MUSIC}>
            <ActStudioWaveLayer screen={screen} />
          </KkLaneDesk.Panel>
          <KkLaneDesk.Panel label={MUSIC_PAGE_LIST}>
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
