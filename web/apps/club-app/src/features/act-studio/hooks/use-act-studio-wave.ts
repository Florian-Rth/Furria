import type {
  KkStudioWaveBeat,
  KkStudioWaveHandleEdge,
  KkStudioWaveTick,
} from '@furria/ui/KkStudioWave';
import { useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { waveformOf } from '@/features/act-player/mix-waveform';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import type { StudioSong } from '@/features/acts/schemas';
import { cutHandleLabelOf, songMetaOf, songNameOf } from '../studio-copy';
import { trimmedCutOf } from '../studio-edits';
import { songSettingsOf } from '../studio-music';
import type { StudioScreen } from './use-studio-screen';

const BUCKETS = 260;

export interface ActStudioWaveRegion {
  key: string;
  start: number;
  end: number;
  number: number;
  name: string;
  meta: string;
  selected: boolean;
}

export interface ActStudioWaveHandle {
  key: KkStudioWaveHandleEdge;
  edge: KkStudioWaveHandleEdge;
  share: number;
  label: string;
  active: boolean;
  move: (share: number) => void;
  end: () => void;
}

export interface ActStudioWave {
  bars: number[];
  regions: ActStudioWaveRegion[];
  ticks: KkStudioWaveTick[];
  beats: KkStudioWaveBeat[];
  handles: ActStudioWaveHandle[];
  cut: { start: number; end: number } | null;
  scrub: (share: number) => void;
}

interface Trim {
  edge: KkStudioWaveHandleEdge;
  seconds: number;
}

interface SongCut {
  song: StudioSong;
  segment: MusicSegment;
}

const songCutsOf = (songs: readonly StudioSong[], segments: readonly MusicSegment[]): SongCut[] =>
  [...songs]
    .sort((left, right) => left.position - right.position)
    .flatMap((song, index) => {
      const segment = segments[index];

      return segment === undefined ? [] : [{ song, segment }];
    });

export const useActStudioWave = (screen: StudioScreen): ActStudioWave => {
  const { playback, studio, practice, edits, music } = screen;
  const { player, segments, length } = playback;
  const [trim, setTrim] = useState<Trim | null>(null);
  const cuts = studio.music.source === 'workingMix' ? songCutsOf(studio.songs, segments) : [];
  const shareOf = (seconds: number): number => (length <= 0 ? 0 : seconds / length);
  const selectedIndex = usePlaybackSelection(player, (seconds) =>
    cuts.findIndex(
      (cut) => seconds >= cut.segment.timelineStart && seconds < cut.segment.timelineEnd,
    ),
  );
  const selected = cuts[selectedIndex] ?? null;
  const currentId = practice.step?.stepId ?? null;

  const edgeOf = (cut: SongCut, edge: KkStudioWaveHandleEdge): number =>
    edge === 'start' ? cut.segment.timelineStart : cut.segment.timelineEnd;

  const handles: ActStudioWaveHandle[] =
    selected === null
      ? []
      : (['start', 'end'] as const).map((edge) => {
          const active = trim?.edge === edge;
          const seconds = active ? trim.seconds : edgeOf(selected, edge);

          return {
            key: edge,
            edge,
            share: shareOf(seconds),
            label: cutHandleLabelOf(edge, songNameOf(selected.song.fileName)),
            active,
            move: (share) => {
              setTrim({ edge, seconds: share * length });
            },
            end: () => {
              if (trim !== null) {
                const cut = trimmedCutOf(selected.song, selected.segment, edge, trim.seconds);
                edits.keepPosition(player.position());
                music.settle.mutate({
                  songId: selected.song.songId,
                  settings: {
                    ...songSettingsOf(selected.song),
                    startSeconds: cut.start,
                    endSeconds: cut.end,
                  },
                });
              }
              setTrim(null);
            },
          };
        });

  return {
    bars: waveformOf(segments, playback.peaksByItem, BUCKETS),
    regions: cuts.map((cut, index) => ({
      key: String(cut.song.songId),
      start: shareOf(cut.segment.timelineStart),
      end: shareOf(cut.segment.timelineEnd),
      number: index + 1,
      name: songNameOf(cut.song.fileName),
      meta: songMetaOf(cut.segment.timelineStart, cut.segment.timelineEnd, cut.song.tempoBpm),
      selected: index === selectedIndex,
    })),
    beats: playback.countMarks
      .filter((mark) => mark.count === 1)
      .map((mark) => ({ share: shareOf(mark.seconds) })),
    ticks: playback.steps.map((step, index) => ({
      key: String(step.stepId),
      share: shareOf(step.startSeconds ?? 0),
      text: String(index + 1),
      current: step.stepId === currentId,
    })),
    handles,
    cut:
      trim === null || selected === null
        ? null
        : { start: shareOf(edgeOf(selected, trim.edge)), end: shareOf(trim.seconds) },
    scrub: (share) => {
      player.seek(share * length);
    },
  };
};
