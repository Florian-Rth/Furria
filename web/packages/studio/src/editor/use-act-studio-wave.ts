import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { MusicSegment, TimelineRange } from '@furria/studio/music-timeline';
import { segmentKeyOf } from '@furria/studio/music-timeline';
import { finalShiftLabelOf, songMetaOf, songNameOf } from '@furria/studio/studio-copy';
import {
  offsetStartingAt,
  segmentPlacementOf,
  sourceNameOf,
  stretchOf,
  tunedOffsetOf,
  UNSTRETCHED,
} from '@furria/studio/studio-final';
import { songOfSegment } from '@furria/studio/studio-music';
import type { StudioSong } from '@furria/studio/studio-schemas';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { TimelineHandle, TimelineRegion } from '@furria/studio/Timeline';
import type { TimelineRows } from '@furria/studio/timeline-rows';
import { timelineRowsOf } from '@furria/studio/timeline-rows';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import { useFinalPlaces } from '@furria/studio/use-final-places';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';
import { useState } from 'react';

const FINAL_NUDGE_SECONDS = 0.1;

interface WaveHandle extends TimelineHandle {
  move: (seconds: number) => void;
  end: (seconds: number) => void;
}

export interface ActStudioWave {
  centre: CentreScrub;
  regions: TimelineRegion[];
  handles: TimelineHandle[];
  rows: TimelineRows;
  trim: TimelineRange | null;
  readout: WaveReadout | null;
}

interface SongCut {
  song: StudioSong;
  segment: MusicSegment;
}

interface WaveShape {
  regions: TimelineRegion[];
  handles: WaveHandle[];
  trim: TimelineRange | null;
}

interface WaveEdits extends WaveShape {
  reset: () => void;
}

const songCutsOf = (songs: readonly StudioSong[], segments: readonly MusicSegment[]): SongCut[] =>
  segments.flatMap((segment) => {
    const song = songOfSegment(songs, segment);

    return song === null ? [] : [{ song, segment }];
  });

const useFinalWave = (screen: StudioWorkScreen): WaveEdits => {
  const { final, playback, studio } = screen;
  const { player } = playback;
  const [shift, setShift] = useState<number | null>(null);
  const pending = final.pending;
  const { places, currentIndex: selectedIndex } = useFinalPlaces(screen);
  const selected = places[selectedIndex] ?? null;
  const found = places.flatMap((place, index) =>
    place.start === null || place.end === null
      ? []
      : [{ place, start: place.start, end: place.end, number: index + 1 }],
  );
  const nameOf = (mediaItemId: number): string => sourceNameOf(studio, mediaItemId);

  const regions: TimelineRegion[] = found.map(({ place, start, end, number }) => ({
    key: `source-${segmentKeyOf(place.segment)}`,
    range: { start, end },
    number,
    name: nameOf(place.segment.mediaItemId),
    meta: songMetaOf(start, end, null),
    selected: place === selected,
  }));
  const selectedStart = selected?.start ?? null;
  const selectedPlacement =
    selected === null ? null : segmentPlacementOf(final.placements, selected.segment);
  const selectedStretch =
    selected === null ? UNSTRETCHED : stretchOf(final.placements, selected.segment);
  const shown = shift ?? selectedStart;
  const handles: WaveHandle[] =
    selected === null ||
    selectedStart === null ||
    shown === null ||
    selectedPlacement === null ||
    pending === null
      ? []
      : [
          {
            key: 'start',
            seconds: shown,
            label: finalShiftLabelOf(nameOf(selected.segment.mediaItemId)),
            valueText: formatReadoutTime(shown),
            move: setShift,
            end: (moved) => {
              screen.edits.keepPosition(player.position());
              screen.document.change({
                kind: 'finalOffset',
                finalTrackId: pending.finalTrackId,
                sourceMediaItemId: selected.segment.mediaItemId,
                fromSeconds: selected.segment.sourceStart,
                untilSeconds: selected.segment.sourceEnd,
                offsetSeconds: offsetStartingAt(selected.segment, moved, selectedStretch),
                stretch: selectedStretch,
              });
              setShift(null);
            },
            onNudge: (direction) => {
              screen.edits.keepPosition(player.position());
              screen.document.change({
                kind: 'finalOffset',
                finalTrackId: pending.finalTrackId,
                sourceMediaItemId: selected.segment.mediaItemId,
                fromSeconds: selected.segment.sourceStart,
                untilSeconds: selected.segment.sourceEnd,
                offsetSeconds: tunedOffsetOf(
                  selectedPlacement.offsetSeconds,
                  direction * FINAL_NUDGE_SECONDS,
                ),
                stretch: selectedPlacement.stretch,
              });
            },
          },
        ];

  return {
    regions,
    handles,
    trim: shift === null || selectedStart === null ? null : { start: selectedStart, end: shift },
    reset: () => {
      setShift(null);
    },
  };
};

const useCutWave = (screen: StudioWorkScreen): WaveShape => {
  const { playback, studio } = screen;
  const { player, segments } = playback;
  const cuts = studio.music.source === 'workingMix' ? songCutsOf(studio.songs, segments) : [];
  const songNumberOf = (song: StudioSong): number =>
    [...studio.songs]
      .sort((left, right) => left.position - right.position)
      .findIndex((candidate) => candidate.songId === song.songId) + 1;
  const selectedIndex = usePlaybackSelection(player, (seconds) =>
    cuts.findIndex(
      (cut, index) =>
        seconds >= cut.segment.timelineStart &&
        (seconds < cut.segment.timelineEnd ||
          (index === cuts.length - 1 && seconds <= cut.segment.timelineEnd)),
    ),
  );

  return {
    regions: cuts.map((cut, index) => ({
      key: segmentKeyOf(cut.segment),
      range: { start: cut.segment.timelineStart, end: cut.segment.timelineEnd },
      number: songNumberOf(cut.song),
      name: songNameOf(cut.song.fileName),
      meta: songMetaOf(cut.segment.timelineStart, cut.segment.timelineEnd, cut.song.tempoBpm),
      selected: index === selectedIndex,
    })),
    handles: [],
    trim: null,
  };
};

export const useActStudioWave = (screen: StudioWorkScreen): ActStudioWave => {
  const { playback, practice } = screen;
  const { player, segments, length } = playback;
  const cutWave = useCutWave(screen);
  const finalWave = useFinalWave(screen);
  const wave = screen.final.previewing ? finalWave : cutWave;
  const reset = finalWave.reset;
  const handleOf = (key: string): WaveHandle | undefined =>
    wave.handles.find((handle) => handle.key === key);
  const centre = useCentreScrub({
    player,
    length,
    countMarks: playback.countMarks,
    targets: wave.handles,
    editsRebuildPlayer: true,
    onTargetMove: (key, seconds) => {
      handleOf(key)?.move(seconds);
    },
    onTargetEnd: (key, seconds) => {
      handleOf(key)?.end(seconds);
      reset();
    },
    onTargetCancel: reset,
  });

  return {
    centre,
    regions: wave.regions,
    handles: wave.handles,
    rows: timelineRowsOf(
      screen.studio,
      playback.paths,
      playback.countMarks,
      practice.step?.stepId ?? null,
    ),
    trim: wave.trim,
    readout: waveReadoutOf(centre.readout, segments),
  };
};
