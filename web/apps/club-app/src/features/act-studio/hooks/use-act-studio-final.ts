import { useState } from 'react';
import { musicSegmentsOf } from '@/features/act-player/music-timeline';
import type { Studio, StudioFinalTrack } from '@/features/acts/schemas';
import {
  adoptedMetaOf,
  adoptTextOf,
  finalSourceMetaOf,
  finalTitleOf,
  finalTrackLabelOf,
  finalTrackMetaOf,
  outsideMusicTextOf,
  STUDIO_EDIT,
  STUDIO_FINAL_GRID_DESK,
  STUDIO_FINAL_LEAD,
  STUDIO_FINAL_REMOVE,
  STUDIO_FINAL_REMOVE_SURE,
  STUDIO_FINAL_TRYING,
  songEditLabelOf,
  songRowLabelOf,
} from '../studio-copy';
import type { FinalPlace } from '../studio-final';
import { matchesAnyMusic, sourceNameOf } from '../studio-final';
import { outsideMusicOf } from '../studio-music';
import type { ActStudioSongRow } from './use-act-studio-songs';
import { useFinalPlaces } from './use-final-places';
import type { StudioScreen } from './use-studio-screen';

export type FinalDeskKind = 'source' | 'grid';

export interface CurrentSource {
  place: FinalPlace;
  name: string;
}

export interface ActStudioFinalAdopt {
  text: string;
  disabled: boolean;
  press: () => void;
}

export interface ActStudioFinalRemoval {
  text: string;
  press: () => void;
}

export interface ActStudioFinal {
  track: ActStudioSongRow | null;
  removal: ActStudioFinalRemoval | null;
  sources: ActStudioSongRow[];
  current: CurrentSource | null;
  adopt: ActStudioFinalAdopt | null;
  canUpload: boolean;
  newer: boolean;
  desk: FinalDeskKind | null;
  closeDesk: () => void;
}

const missingTextOf = (studio: Studio): string | null =>
  outsideMusicTextOf(outsideMusicOf(studio, musicSegmentsOf(studio)));

const deskKindOf = (previewing: boolean): FinalDeskKind => (previewing ? 'source' : 'grid');

export const useActStudioFinal = (screen: StudioScreen): ActStudioFinal => {
  const { final, studio, playback, mode } = screen;
  const { player } = playback;
  const [desk, setDesk] = useState<FinalDeskKind | null>(null);
  const [deskSource, setDeskSource] = useState<number | null>(null);
  const [adopting, setAdopting] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const onMusic = mode.editing && mode.tool === 'music';
  const pending = final.pending;
  const matched = matchesAnyMusic(final.placements);
  const adopted = final.adopted;
  if (desk !== null && (!onMusic || desk !== deskKindOf(final.previewing))) {
    setDesk(null);
  }
  if (adopting !== null && (!final.previewing || pending?.finalTrackId !== adopting)) {
    setAdopting(null);
  }
  if (removing !== null && pending?.finalTrackId !== removing) {
    setRemoving(null);
  }
  if (deskSource !== null && desk !== 'source') {
    setDeskSource(null);
  }

  const { places, currentIndex } = useFinalPlaces(screen);
  const chosenIndex =
    deskSource === null
      ? currentIndex
      : places.findIndex((place) => place.segment.mediaItemId === deskSource);
  const chosen = places[chosenIndex];

  const openSource = (mediaItemId: number | null): void => {
    setDeskSource(mediaItemId);
    setDesk(onMusic ? 'source' : null);
  };
  const closeDesk = (): void => {
    setDesk(null);
    setDeskSource(null);
  };

  const pendingRowOf = (track: StudioFinalTrack): ActStudioSongRow => ({
    key: `final-${track.finalTrackId}`,
    lead: STUDIO_FINAL_LEAD,
    title: finalTitleOf(track.version),
    meta: finalTrackMetaOf(
      track.state,
      Object.keys(final.placements).length,
      final.mix.length,
      final.previewing,
    ),
    label: finalTrackLabelOf(final.previewing),
    badge: final.previewing ? STUDIO_FINAL_TRYING : null,
    badgeTone: 'gold',
    selected: final.previewing,
    press: () => {
      closeDesk();
      final.togglePreview(player.position());
    },
  });
  const adoptedRowOf = (track: StudioFinalTrack): ActStudioSongRow => ({
    key: `final-${track.finalTrackId}`,
    lead: STUDIO_FINAL_LEAD,
    title: finalTitleOf(track.version),
    meta: adoptedMetaOf(track.tempoBpm),
    label: STUDIO_FINAL_GRID_DESK,
    badge: STUDIO_EDIT,
    badgeTone: 'ink',
    selected: true,
    press: () => {
      setDesk(onMusic ? 'grid' : null);
    },
  });
  const trackRowOf = (): ActStudioSongRow | null => {
    if (pending !== null) {
      return pendingRowOf(pending);
    }

    return adopted !== null && studio.music.source === 'finalTrack' ? adoptedRowOf(adopted) : null;
  };
  const sourceRowOf = (place: FinalPlace, index: number): ActStudioSongRow => {
    const name = sourceNameOf(studio, place.segment.mediaItemId);
    const selected = index === chosenIndex;

    return {
      key: `source-${place.segment.mediaItemId}`,
      lead: String(index + 1),
      title: name,
      meta: finalSourceMetaOf(place.start, place.end),
      label: selected ? songEditLabelOf(name) : songRowLabelOf(name),
      badge: selected ? STUDIO_EDIT : null,
      badgeTone: 'ink',
      selected,
      press: () => {
        if (place.start === null) {
          openSource(place.segment.mediaItemId);
          return;
        }
        if (selected) {
          openSource(null);
          return;
        }
        setDeskSource(null);
        player.seek(place.start);
      },
    };
  };

  return {
    track: trackRowOf(),
    removal:
      pending === null
        ? null
        : {
            text:
              removing === pending.finalTrackId ? STUDIO_FINAL_REMOVE_SURE : STUDIO_FINAL_REMOVE,
            press: () => {
              if (removing !== pending.finalTrackId) {
                setRemoving(pending.finalTrackId);
                return;
              }
              setRemoving(null);
              closeDesk();
              if (final.previewing) {
                final.togglePreview(player.position());
              }
              final.writes.remove.mutate(pending.finalTrackId);
            },
          },
    sources: places.map(sourceRowOf),
    current:
      chosen === undefined
        ? null
        : { place: chosen, name: sourceNameOf(studio, chosen.segment.mediaItemId) },
    adopt:
      pending === null || !final.previewing
        ? null
        : {
            text: adoptTextOf(adopting === pending.finalTrackId, matched, missingTextOf(studio)),
            disabled: !matched || final.writes.adopt.isPending,
            press: () => {
              if (!matched) {
                return;
              }
              if (adopting !== pending.finalTrackId) {
                setAdopting(pending.finalTrackId);
                return;
              }
              setAdopting(null);
              closeDesk();
              screen.edits.keepPosition(player.position());
              final.writes.adopt.mutate(pending.finalTrackId);
            },
          },
    canUpload: pending === null,
    newer: adopted !== null,
    desk: desk === 'source' && chosen === undefined ? null : desk,
    closeDesk,
  };
};
