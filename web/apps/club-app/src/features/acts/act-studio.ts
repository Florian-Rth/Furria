import type { CastPerson } from '@/features/running-order/schemas';
import type { CoEditor, Studio } from './schemas';

export interface StudioOverview {
  hasMusic: boolean;
  lengthSeconds: number;
  playsFinalTrack: boolean;
  songs: number;
  steps: number;
  stepsAdrift: number;
  parts: number;
  spots: number;
  spotsOpen: number;
  ownSpot: number | null;
  videos: number;
  videosOutdated: number;
}

export const studioOverviewOf = (studio: Studio, viewerId: number | null): StudioOverview => ({
  hasMusic: studio.songs.length > 0 || studio.finalTracks.some((track) => track.adopted),
  lengthSeconds: studio.music.lengthSeconds,
  playsFinalTrack: studio.music.source === 'finalTrack',
  songs: studio.songs.length,
  steps: studio.steps.length,
  stepsAdrift: studio.steps.filter((step) => step.placement !== 'onTimeline').length,
  parts: studio.parts.length,
  spots: studio.spots.length,
  spotsOpen: studio.spots.filter((spot) => spot.person === null).length,
  ownSpot:
    viewerId === null
      ? null
      : (studio.spots.find((spot) => spot.person?.personId === viewerId)?.number ?? null),
  videos: studio.videos.length,
  videosOutdated: studio.videos.filter((video) => video.outdated).length,
});

export const coEditorCandidatesOf = (
  cast: readonly CastPerson[],
  coEditors: readonly CoEditor[],
): CastPerson[] => {
  const granted = new Set(coEditors.map((coEditor) => coEditor.personId));

  return cast.filter((person) => !person.absent && !granted.has(person.personId));
};

export const canChangeCoEditors = (
  canGrant: boolean,
  act: { closed: boolean; archived: boolean },
): boolean => canGrant && !act.closed && !act.archived;
