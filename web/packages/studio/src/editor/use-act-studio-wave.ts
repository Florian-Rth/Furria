import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { MusicSegment, TimelineRange } from '@furria/studio/music-timeline';
import {
  cutHandleLabelOf,
  finalShiftLabelOf,
  songMetaOf,
  songNameOf,
} from '@furria/studio/studio-copy';
import { nudgedCutOf, trimmedCutOf } from '@furria/studio/studio-edits';
import {
  offsetStartingAt,
  sourceNameOf,
  stretchOf,
  tunedOffsetOf,
  UNSTRETCHED,
} from '@furria/studio/studio-final';
import { songSettingsOf } from '@furria/studio/studio-music';
import type { StudioSong } from '@furria/studio/studio-schemas';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { TimelineHandle, TimelineRegion, TimelineSpan } from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import { useFinalPlaces } from '@furria/studio/use-final-places';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';
import { useState } from 'react';

const FINAL_NUDGE_SECONDS = 0.1;

type WaveEdge = 'start' | 'end';

interface WaveHandle extends TimelineHandle {
  move: (seconds: number) => void;
  end: (seconds: number) => void;
}

export interface ActStudioWave {
  centre: CentreScrub;
  regions: TimelineRegion[];
  handles: TimelineHandle[];
  ticks: TimelineSpan[];
  currentStepId: number | null;
  trim: TimelineRange | null;
  readout: WaveReadout | null;
}

interface Trim {
  edge: WaveEdge;
  seconds: number;
}

interface SongCut {
  song: StudioSong;
  segment: MusicSegment;
}

interface WaveEdits {
  regions: TimelineRegion[];
  handles: WaveHandle[];
  trim: TimelineRange | null;
  reset: () => void;
}

const songCutsOf = (songs: readonly StudioSong[], segments: readonly MusicSegment[]): SongCut[] =>
  [...songs]
    .sort((left, right) => left.position - right.position)
    .flatMap((song, index) => {
      const segment = segments[index];

      return segment === undefined ? [] : [{ song, segment }];
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
    key: `source-${place.segment.mediaItemId}`,
    range: { start, end },
    number,
    name: nameOf(place.segment.mediaItemId),
    meta: songMetaOf(start, end, null),
    selected: place === selected,
  }));
  const selectedStart = selected?.start ?? null;
  const selectedPlacement =
    selected === null ? undefined : final.placements[selected.segment.mediaItemId];
  const selectedStretch =
    selected === null ? UNSTRETCHED : stretchOf(final.placements, selected.segment.mediaItemId);
  const shown = shift ?? selectedStart;
  const handles: WaveHandle[] =
    selected === null ||
    selectedStart === null ||
    shown === null ||
    selectedPlacement === undefined ||
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

const useCutWave = (screen: StudioWorkScreen): WaveEdits => {
  const { playback, studio, edits } = screen;
  const { player, segments } = playback;
  const [trim, setTrim] = useState<Trim | null>(null);
  const cuts = studio.music.source === 'workingMix' ? songCutsOf(studio.songs, segments) : [];
  const selectedIndex = usePlaybackSelection(player, (seconds) =>
    cuts.findIndex(
      (cut, index) =>
        seconds >= cut.segment.timelineStart &&
        (seconds < cut.segment.timelineEnd ||
          (index === cuts.length - 1 && seconds <= cut.segment.timelineEnd)),
    ),
  );
  const selected = cuts[selectedIndex] ?? null;

  const edgeOf = (cut: SongCut, edge: WaveEdge): number =>
    edge === 'start' ? cut.segment.timelineStart : cut.segment.timelineEnd;

  const handles: WaveHandle[] =
    selected === null
      ? []
      : (['start', 'end'] as const).map((edge) => {
          const seconds = trim?.edge === edge ? trim.seconds : edgeOf(selected, edge);
          const settleCut = (cut: { start: number; end: number }): void => {
            edits.keepPosition(player.position());
            screen.document.change({
              kind: 'songSettings',
              songId: selected.song.songId,
              ...songSettingsOf(selected.song),
              startSeconds: cut.start,
              endSeconds: cut.end,
            });
          };

          return {
            key: edge,
            seconds,
            label: cutHandleLabelOf(edge, songNameOf(selected.song.fileName)),
            valueText: formatReadoutTime(seconds),
            move: (moved) => {
              setTrim({ edge, seconds: moved });
            },
            end: (moved) => {
              settleCut(trimmedCutOf(selected.song, selected.segment, edge, moved));
              setTrim(null);
            },
            onNudge: (direction) => {
              const cut = nudgedCutOf(selected.song, selected.segment, edge, direction);
              if (
                cut.start !== selected.song.startSeconds ||
                cut.end !== selected.song.endSeconds
              ) {
                settleCut(cut);
              }
            },
          };
        });

  return {
    regions: cuts.map((cut, index) => ({
      key: String(cut.song.songId),
      range: { start: cut.segment.timelineStart, end: cut.segment.timelineEnd },
      number: index + 1,
      name: songNameOf(cut.song.fileName),
      meta: songMetaOf(cut.segment.timelineStart, cut.segment.timelineEnd, cut.song.tempoBpm),
      selected: index === selectedIndex,
    })),
    handles,
    trim:
      trim === null || selected === null
        ? null
        : { start: edgeOf(selected, trim.edge), end: trim.seconds },
    reset: () => {
      setTrim(null);
    },
  };
};

export const useActStudioWave = (screen: StudioWorkScreen): ActStudioWave => {
  const { playback, practice } = screen;
  const { player, segments, length } = playback;
  const cutWave = useCutWave(screen);
  const finalWave = useFinalWave(screen);
  const wave = screen.final.previewing ? finalWave : cutWave;
  const reset = (): void => {
    cutWave.reset();
    finalWave.reset();
  };
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
    ticks: playback.steps.map((step) => ({
      key: step.stepId,
      range:
        step.startSeconds === null || step.endSeconds === null
          ? null
          : { start: step.startSeconds, end: step.endSeconds },
    })),
    currentStepId: practice.step?.stepId ?? null,
    trim: wave.trim,
    readout: waveReadoutOf(centre.readout, segments),
  };
};
