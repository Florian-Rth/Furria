import { KkEightsBar } from '@furria/ui/KkEightsBar';
import { KkEightsChip } from '@furria/ui/KkEightsChip';
import { KkEightsFrame } from '@furria/ui/KkEightsFrame';
import { KkEightsStrip } from '@furria/ui/KkEightsStrip';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioView } from '@furria/ui/KkStudioView';
import { useKkEightsWide } from '@furria/ui/use-kk-eights-wide';
import type { FC } from 'react';
import { ActStudioFinalDesk } from '@/features/act-studio/components/ActStudioFinalDesk';
import { ActStudioSongDesk } from '@/features/act-studio/components/ActStudioSongDesk';
import { ActStudioSongList } from '@/features/act-studio/components/ActStudioSongList';
import { ActStudioTakeList } from '@/features/act-studio/components/ActStudioTakeList';
import { ActStudioVideoDesk } from '@/features/act-studio/components/ActStudioVideoDesk';
import { ActStudioVideoStrip } from '@/features/act-studio/components/ActStudioVideoStrip';
import { ActStudioWaveLayer } from '@/features/act-studio/components/ActStudioWaveLayer';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  EIGHTS_BAR_LABEL,
  EIGHTS_MUSIC_TAB,
  EIGHTS_MUSIC_TABS,
  EIGHTS_REDO,
  EIGHTS_TRANSPORT,
  EIGHTS_UNDO,
  EIGHTS_VIDEO_TAB,
} from '../eights-copy';
import { useEightsMusic } from '../hooks/use-eights-music';
import type { EightsMusicTab } from '../hooks/use-eights-routes';
import { EightsClockLive } from './EightsClockLive';

interface EightsMusicBodyProps {
  actId: number;
  title: string;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  evening: StudioEvening | null;
  tab: EightsMusicTab | undefined;
}

export const EightsMusicBody: FC<EightsMusicBodyProps> = ({
  actId,
  title,
  studio,
  viewerId,
  canEdit,
  cast,
  evening,
  tab,
}) => {
  const music = useEightsMusic({ actId, studio, viewerId, canEdit, cast, evening, tab });
  const wide = useKkEightsWide();
  const { screen, songs, finalList, takes, history } = music;
  const { practice, playback } = screen;
  const onMusic = music.tab === 'music';
  const band =
    screen.eveningBand === null ? null : (
      <KkStudioView.Band>
        <KkStudioView.BandNote text={screen.eveningBand} />
      </KkStudioView.Band>
    );
  const list = onMusic ? (
    <ActStudioSongList screen={screen} songs={songs} finalList={finalList} />
  ) : (
    <ActStudioTakeList screen={screen} takes={takes} />
  );
  const placement = onMusic ? null : <ActStudioVideoStrip screen={screen} takes={takes} />;
  const listBox = <KkEightsFrame.Scroll>{list}</KkEightsFrame.Scroll>;
  const side = wide ? <KkEightsFrame.Area area="side">{listBox}</KkEightsFrame.Area> : null;
  const inline = wide ? null : listBox;

  return (
    <KkEightsFrame label={title}>
      <KkEightsFrame.Heading text={title} />
      {band}
      <KkEightsFrame.Area area="bar">
        <KkEightsBar label={EIGHTS_BAR_LABEL}>
          <KkEightsStrip.Tools label={EIGHTS_MUSIC_TABS} wrap={false}>
            <KkEightsChip
              glyph="music"
              text={EIGHTS_MUSIC_TAB}
              pressed={onMusic}
              onPress={music.showMusic}
            />
            <KkEightsChip
              glyph="video"
              text={EIGHTS_VIDEO_TAB}
              pressed={!onMusic}
              onPress={music.showVideo}
            />
          </KkEightsStrip.Tools>
          <KkEightsBar.Gap />
          <KkEightsBar.Tool
            glyph="undo"
            text={EIGHTS_UNDO}
            textHidden={!wide}
            disabled={!history.canUndo}
            onPress={history.undo}
          />
          <KkEightsBar.Tool
            glyph="redo"
            text={EIGHTS_REDO}
            textHidden
            disabled={!history.canRedo}
            onPress={history.redo}
          />
        </KkEightsBar>
      </KkEightsFrame.Area>
      <KkEightsFrame.Area area="main">
        <KkEightsFrame.Wave>
          <ActStudioWaveLayer screen={screen} />
        </KkEightsFrame.Wave>
        {placement}
        {inline}
      </KkEightsFrame.Area>
      {side}
      <KkEightsFrame.Area area="foot">
        <KkPracticeTransport label={EIGHTS_TRANSPORT}>
          <KkPracticeTransport.Pill>
            <KkPracticeTransport.Play
              playing={practice.playing}
              label={practice.playLabel}
              disabled={!practice.canPlay}
              onToggle={practice.toggle}
            />
            <KkPracticeTransport.Divider />
            <EightsClockLive playback={playback} />
          </KkPracticeTransport.Pill>
        </KkPracticeTransport>
      </KkEightsFrame.Area>
      <ActStudioSongDesk screen={screen} songs={songs} />
      <ActStudioFinalDesk screen={screen} finalList={finalList} />
      <ActStudioVideoDesk screen={screen} takes={takes} />
    </KkEightsFrame>
  );
};
