import { KkFocusLayout } from '@furria/ui/KkFocusLayout';
import { KkFocusTop } from '@furria/ui/KkFocusTop';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { ActStudioFinalDesk } from '@/features/act-studio/components/ActStudioFinalDesk';
import { ActStudioSongDesk } from '@/features/act-studio/components/ActStudioSongDesk';
import { ActStudioSongList } from '@/features/act-studio/components/ActStudioSongList';
import { ActStudioTakeList } from '@/features/act-studio/components/ActStudioTakeList';
import { ActStudioVideoDesk } from '@/features/act-studio/components/ActStudioVideoDesk';
import { ActStudioWaveLayer } from '@/features/act-studio/components/ActStudioWaveLayer';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  FOCUS_LANE_MUSIC,
  FOCUS_LANE_VIDEO,
  FOCUS_MUSIC_PAGE,
  FOCUS_PAUSE,
  FOCUS_PLAY,
  FOCUS_REDO,
  FOCUS_TOOLBAR,
  FOCUS_TRANSPORT,
  FOCUS_UNDO,
  FOCUS_VIEW,
} from '../focus-copy';
import { useFocusMusic } from '../hooks/use-focus-music';
import type { FocusMusicTool } from '../schemas';
import { FocusMusicClock } from './FocusMusicClock';

interface FocusMusicBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  cast: readonly CastPerson[];
  canEdit: boolean;
  tool: FocusMusicTool;
  choose: (tool: FocusMusicTool) => void;
}

export const FocusMusicBody: FC<FocusMusicBodyProps> = (props) => {
  const music = useFocusMusic(props);
  const { screen, songs, finalList, takes, history } = music;
  const playing = screen.playback.state.playing;
  const playLabel = playing ? FOCUS_PAUSE : FOCUS_PLAY;
  const cannotPlay = !screen.practice.canPlay;
  const cannotUndo = !history.canUndo;
  const cannotRedo = !history.canRedo;
  const onMusic = props.tool === 'music';
  const onVideo = props.tool === 'video';
  const list = onMusic ? (
    <ActStudioSongList screen={screen} songs={songs} finalList={finalList} />
  ) : (
    <ActStudioTakeList screen={screen} takes={takes} />
  );

  return (
    <KkFocusLayout label={FOCUS_MUSIC_PAGE} kind="page">
      <KkFocusLayout.Top>
        <KkFocusTop label={FOCUS_TOOLBAR}>
          <KkFocusTop.Group label={FOCUS_TRANSPORT}>
            <KkFocusTop.Play
              playing={playing}
              label={playLabel}
              disabled={cannotPlay}
              onPress={screen.playback.controls.toggle}
            />
            <FocusMusicClock screen={screen} />
          </KkFocusTop.Group>
          <KkFocusTop.Group label={FOCUS_VIEW} divided>
            <KkFocusTop.Button
              glyph="music"
              text={FOCUS_LANE_MUSIC}
              pressed={onMusic}
              onPress={music.showMusic}
            />
            <KkFocusTop.Button
              glyph="video"
              text={FOCUS_LANE_VIDEO}
              pressed={onVideo}
              onPress={music.showVideo}
            />
          </KkFocusTop.Group>
          <KkFocusTop.Spacer />
          <KkFocusTop.Button
            glyph="undo"
            text={FOCUS_UNDO}
            quietText
            disabled={cannotUndo}
            onPress={history.undo}
          />
          <KkFocusTop.Button
            glyph="redo"
            text={FOCUS_REDO}
            quietText
            disabled={cannotRedo}
            onPress={history.redo}
          />
        </KkFocusTop>
      </KkFocusLayout.Top>
      <KkFocusLayout.Stage>
        <ActStudioWaveLayer screen={screen} />
      </KkFocusLayout.Stage>
      <KkFocusLayout.Strip>
        <Box sx={{ height: '100%', overflowY: 'auto', overscrollBehavior: 'contain' }}>{list}</Box>
      </KkFocusLayout.Strip>
      <ActStudioSongDesk screen={screen} songs={songs} />
      <ActStudioFinalDesk screen={screen} finalList={finalList} />
      <ActStudioVideoDesk screen={screen} takes={takes} />
    </KkFocusLayout>
  );
};
