import { musicSegmentsOf } from '@furria/studio/music-timeline';
import type { FinalPlacements } from '@furria/studio/studio-final';
import {
  adoptedFinalTrackOf,
  finalPlacementsOf,
  finalPreviewOf,
  finalSecondsAt,
  mixSecondsAt,
  pendingFinalTrackOf,
} from '@furria/studio/studio-final';
import type { StudioFinalTrack } from '@furria/studio/studio-schemas';
import { musicKeyOf } from '@furria/studio/studio-videos';
import type { StudioFinalView } from '@furria/studio/studio-work-screen';
import type { ActStudioEdits } from '@furria/studio/use-act-studio-edits';
import type { ActStudioMode } from '@furria/studio/use-act-studio-mode';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import type { FinalTrackMutations } from '../api';
import { useFinalTrackMutations } from '../api';

const NO_PLACEMENTS: FinalPlacements = {};

export interface StudioFinal extends StudioFinalView {
  adopted: StudioFinalTrack | null;
  writes: FinalTrackMutations;
  togglePreview: (position: number) => void;
}

export interface StudioFinalStage {
  final: StudioFinal;
  studio: ActStudio;
}

const isPreviewable = (track: StudioFinalTrack | null, mode: ActStudioMode): boolean =>
  track !== null &&
  track.state === 'ready' &&
  track.durationSeconds !== null &&
  mode.editing &&
  mode.tool === 'music';

const useFinalAutoMatch = (
  pending: StudioFinalTrack | null,
  music: string,
  writes: FinalTrackMutations,
): void => {
  const tried = useRef(new Set<string>());
  const waiting =
    pending !== null && pending.state === 'ready' && pending.alignments.length === 0
      ? pending.finalTrackId
      : null;

  const match = useEffectEvent((finalTrackId: number): void => {
    writes.autoMatch.mutate(finalTrackId);
  });

  useEffect(() => {
    const attempt = `${waiting}@${music}`;
    if (waiting === null || tried.current.has(attempt)) {
      return;
    }
    tried.current.add(attempt);
    match(waiting);
  }, [waiting, music]);
};

export const useStudioFinal = (
  actId: number,
  worked: ActStudio,
  mode: ActStudioMode,
  edits: ActStudioEdits,
): StudioFinalStage => {
  const writes = useFinalTrackMutations(actId);
  const [previewing, setPreviewing] = useState(false);
  const pending = mode.canEdit ? pendingFinalTrackOf(worked) : null;
  const mix = musicSegmentsOf(worked);
  const previewable = isPreviewable(pending, mode);
  if (previewing && !previewable) {
    setPreviewing(false);
  }
  useFinalAutoMatch(pending, musicKeyOf(worked), writes);
  const placements = pending === null ? NO_PLACEMENTS : finalPlacementsOf(pending, mix);
  const shown = previewing && previewable && pending !== null;

  return {
    studio: shown ? finalPreviewOf(worked, pending, mix, placements) : worked,
    final: {
      pending,
      adopted: adoptedFinalTrackOf(worked),
      previewing: shown,
      placements,
      mix,
      writes,
      togglePreview: (position) => {
        if (pending === null || !previewable) {
          return;
        }
        const kept = shown
          ? mixSecondsAt(mix, placements, position)
          : finalSecondsAt(mix, placements, pending.durationSeconds ?? 0, position);
        edits.keepPosition(kept ?? 0);
        setPreviewing(!shown);
      },
    },
  };
};
