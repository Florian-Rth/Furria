import type { MusicSegment } from '@furria/studio/music-timeline';
import { segmentKeyOf } from '@furria/studio/music-timeline';
import { songMetaOf, songNameOf } from '@furria/studio/studio-copy';
import { songOfSegment } from '@furria/studio/studio-music';
import type { StudioSong } from '@furria/studio/studio-schemas';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { TimelineRegion } from '@furria/studio/Timeline';
import type { TimelineRows } from '@furria/studio/timeline-rows';
import { timelineRowsOf } from '@furria/studio/timeline-rows';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';

export interface ActStudioWave {
  centre: CentreScrub;
  regions: TimelineRegion[];
  rows: TimelineRows;
  readout: WaveReadout | null;
}

interface SongCut {
  song: StudioSong;
  segment: MusicSegment;
}

const songCutsOf = (songs: readonly StudioSong[], segments: readonly MusicSegment[]): SongCut[] =>
  segments.flatMap((segment) => {
    const song = songOfSegment(songs, segment);

    return song === null ? [] : [{ song, segment }];
  });

const useSongRegions = (screen: StudioWorkScreen): TimelineRegion[] => {
  const { playback, studio } = screen;
  const { player, segments } = playback;
  const cuts = songCutsOf(studio.songs, segments);
  const selectedIndex = usePlaybackSelection(player, (seconds) =>
    cuts.findIndex(
      (cut, index) =>
        seconds >= cut.segment.timelineStart &&
        (seconds < cut.segment.timelineEnd ||
          (index === cuts.length - 1 && seconds <= cut.segment.timelineEnd)),
    ),
  );

  return cuts.map((cut, index) => ({
    key: segmentKeyOf(cut.segment),
    range: { start: cut.segment.timelineStart, end: cut.segment.timelineEnd },
    number: index + 1,
    name: songNameOf(cut.song.fileName),
    meta: songMetaOf(cut.segment.timelineStart, cut.segment.timelineEnd, cut.song.tempoBpm),
    selected: index === selectedIndex,
  }));
};

export const useActStudioWave = (screen: StudioWorkScreen): ActStudioWave => {
  const { playback, practice } = screen;
  const { player, segments, length } = playback;
  const regions = useSongRegions(screen);
  const centre = useCentreScrub({
    player,
    length,
    countMarks: playback.countMarks,
    targets: [],
    editsRebuildPlayer: true,
  });

  return {
    centre,
    regions,
    rows: timelineRowsOf(
      screen.studio,
      playback.paths,
      playback.countMarks,
      practice.step?.stepId ?? null,
    ),
    readout: waveReadoutOf(centre.readout, segments),
  };
};
