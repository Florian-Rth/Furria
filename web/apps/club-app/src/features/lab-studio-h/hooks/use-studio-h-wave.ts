import type { KkStudioHWaveHandleEdge, KkStudioHWaveTick } from '@furria/ui/KkStudioHWave';
import { useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { waveformOf } from '@/features/act-player/mix-waveform';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import type { StudioSong } from '@/features/acts/schemas';
import { cutHandleLabelOf, songMetaOf, songNameOf } from '../studio-h-copy';
import { trimmedCutOf } from '../studio-h-edits';
import type { StudioH } from './use-studio-h';

const BUCKETS = 260;

export interface StudioHWaveRegion {
  key: string;
  start: number;
  end: number;
  number: number;
  name: string;
  meta: string;
  selected: boolean;
}

export interface StudioHWaveHandle {
  key: KkStudioHWaveHandleEdge;
  edge: KkStudioHWaveHandleEdge;
  share: number;
  label: string;
  active: boolean;
  move: (share: number) => void;
  end: () => void;
}

export interface StudioHWave {
  bars: number[];
  regions: StudioHWaveRegion[];
  ticks: KkStudioHWaveTick[];
  handles: StudioHWaveHandle[];
  cut: { start: number; end: number } | null;
  scrub: (share: number) => void;
}

interface Trim {
  edge: KkStudioHWaveHandleEdge;
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

export const useStudioHWave = (h: StudioH): StudioHWave => {
  const { playback, studio, practice, edits } = h;
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

  const edgeOf = (cut: SongCut, edge: KkStudioHWaveHandleEdge): number =>
    edge === 'start' ? cut.segment.timelineStart : cut.segment.timelineEnd;

  const handles: StudioHWaveHandle[] =
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
                edits.setCut(
                  selected.song.songId,
                  trimmedCutOf(selected.song, selected.segment, edge, trim.seconds),
                  player.position(),
                );
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
