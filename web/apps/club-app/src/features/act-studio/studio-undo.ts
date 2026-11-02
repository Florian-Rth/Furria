import type { Keyframe, StudioFinalTrack, StudioVideo } from '@furria/studio/studio-schemas';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { FinalOffsetInput } from './studio-final';
import type { SongSettings } from './studio-music';
import { songSettingsOf } from './studio-music';
import type { SpotPerson, TrackChanges } from './studio-spots';
import type { PartSettings } from './studio-steps';
import { partSettingsOf } from './studio-steps';

export type FinalOffset = Omit<FinalOffsetInput, 'finalTrackId'>;

export interface PartBinding {
  partId: number;
  settings: PartSettings;
}

export type StudioWrite =
  | { kind: 'songAdd'; mediaItemId: number }
  | { kind: 'songRemove'; songId: number }
  | { kind: 'songRestore'; mediaItemId: number; settings: SongSettings; order: readonly number[] }
  | { kind: 'finalAdd'; mediaItemId: number }
  | { kind: 'finalRemove'; finalTrackId: number }
  | {
      kind: 'finalRestore';
      mediaItemId: number;
      firstBeatSeconds: number | null;
      tempoBpm: number | null;
      offsets: readonly FinalOffset[];
    }
  | { kind: 'finalAdopt'; finalTrackId: number }
  | { kind: 'videoAdd'; mediaItemId: number }
  | { kind: 'videoRemove'; videoId: number }
  | {
      kind: 'videoRestore';
      mediaItemId: number;
      name: string | null;
      startSeconds: number | null;
      parts: readonly PartBinding[];
    }
  | { kind: 'spotAdd' }
  | { kind: 'spotRemove'; spotId: number }
  | { kind: 'spotRestore'; person: SpotPerson | null; keyframes: readonly Keyframe[] }
  | { kind: 'spotAssign'; spotId: number; person: SpotPerson | null }
  | { kind: 'tracks'; changes: TrackChanges }
  | { kind: 'restore'; eventId: number | null; version: number }
  | { kind: 'eveningJoin'; eventId: number }
  | { kind: 'eveningLeave'; eventId: number }
  | { kind: 'eveningDancer'; eventId: number; person: PortraitPersonRef; dances: boolean }
  | { kind: 'eveningSpot'; eventId: number; spotId: number; person: SpotPerson | null }
  | { kind: 'eveningTracks'; eventId: number; changes: TrackChanges }
  | { kind: 'eveningCopyDrop'; eventId: number }
  | { kind: 'batch'; writes: readonly StudioWrite[] };

export type StudioWriteKind = StudioWrite['kind'];

const NONE: readonly number[] = [];
const PLACEHOLDER_ID = 0;

const firstOf = (created: readonly number[]): number | null => created[0] ?? null;

const removalOf = <TWrite extends StudioWrite>(
  created: readonly number[],
  build: (id: number) => TWrite,
): TWrite | null => {
  const id = firstOf(created);

  return id === null ? null : build(id);
};

const batchOf = (writes: readonly (StudioWrite | null)[]): StudioWrite | null => {
  const kept = writes.filter((write): write is StudioWrite => write !== null);

  if (kept.length === 0) {
    return null;
  }

  return kept.length === 1 ? (kept[0] ?? null) : { kind: 'batch', writes: kept };
};

const orderedSongIdsOf = (studio: Studio): number[] =>
  [...studio.songs].sort((left, right) => left.position - right.position).map((s) => s.songId);

const songRestoreOf = (studio: Studio, songId: number): StudioWrite | null => {
  const song = studio.songs.find((candidate) => candidate.songId === songId);

  return song === undefined
    ? null
    : {
        kind: 'songRestore',
        mediaItemId: song.mediaItemId,
        settings: songSettingsOf(song),
        order: orderedSongIdsOf(studio).map((id) => (id === songId ? PLACEHOLDER_ID : id)),
      };
};

const finalTrackOf = (studio: Studio, finalTrackId: number): StudioFinalTrack | null =>
  studio.finalTracks.find((candidate) => candidate.finalTrackId === finalTrackId) ?? null;

const videoOf = (studio: Studio, videoId: number): StudioVideo | null =>
  studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;

const videoRestoreOf = (studio: Studio, videoId: number): StudioWrite | null => {
  const video = videoOf(studio, videoId);

  return video === null
    ? null
    : {
        kind: 'videoRestore',
        mediaItemId: video.mediaItemId,
        name: video.name,
        startSeconds: video.startSeconds,
        parts: studio.parts
          .filter((part) => part.mainVideoId === videoId)
          .map((part) => ({ partId: part.partId, settings: partSettingsOf(part) })),
      };
};

const keyframesOf = (studio: Studio, spotId: number): readonly Keyframe[] =>
  studio.choreography?.tracks.find((track) => track.spotId === spotId)?.keyframes ?? [];

const tracksBefore = (studio: Studio, changes: TrackChanges): TrackChanges =>
  Object.fromEntries(
    Object.keys(changes).map((spotId) => [spotId, keyframesOf(studio, Number(spotId))]),
  );

const personOnSpot = (studio: Studio, spotId: number): SpotPerson | null =>
  studio.spots.find((spot) => spot.spotId === spotId)?.person ?? null;

const spotAssignBefore = (
  studio: Studio,
  spotId: number,
  person: SpotPerson | null,
): StudioWrite | null => {
  const formerSpot =
    person === null
      ? null
      : (studio.spots.find(
          (spot) => spot.spotId !== spotId && spot.person?.personId === person.personId,
        ) ?? null);

  return batchOf([
    { kind: 'spotAssign', spotId, person: personOnSpot(studio, spotId) },
    formerSpot === null ? null : { kind: 'spotAssign', spotId: formerSpot.spotId, person },
  ]);
};

const eveningOf = (studio: Studio, eventId: number): StudioEvening | null =>
  studio.evenings.find((evening) => evening.eventId === eventId) ?? null;

const eveningSpotBefore = (studio: Studio, eventId: number, spotId: number): StudioWrite | null => {
  const change = eveningOf(studio, eventId)?.appearance?.spotChanges.find(
    (candidate) => candidate.spotId === spotId,
  );
  const person = change === undefined ? personOnSpot(studio, spotId) : change.person;

  return { kind: 'eveningSpot', eventId, spotId, person };
};

const eveningTracksBefore = (
  studio: Studio,
  eventId: number,
  changes: TrackChanges,
): StudioWrite | null => {
  const copy = eveningOf(studio, eventId)?.appearance?.choreography ?? null;
  if (copy === null) {
    return { kind: 'eveningCopyDrop', eventId };
  }

  return {
    kind: 'eveningTracks',
    eventId,
    changes: Object.fromEntries(
      Object.keys(changes).map((spotId) => [
        spotId,
        copy.tracks.find((track) => track.spotId === Number(spotId))?.keyframes ?? [],
      ]),
    ),
  };
};

const choreographyVersionOf = (studio: Studio, eventId: number | null): number | null =>
  eventId === null
    ? (studio.choreography?.version ?? null)
    : (eveningOf(studio, eventId)?.appearance?.choreography?.version ?? null);

const restoreBefore = (studio: Studio, eventId: number | null): StudioWrite | null => {
  const version = choreographyVersionOf(studio, eventId);

  return version === null ? null : { kind: 'restore', eventId, version };
};

const leavesNothingBehind = (studio: Studio, eventId: number): boolean => {
  const appearance = eveningOf(studio, eventId)?.appearance ?? null;

  return (
    appearance === null ||
    (appearance.added.length === 0 &&
      appearance.removedPersonIds.length === 0 &&
      appearance.spotChanges.length === 0 &&
      appearance.choreography === null)
  );
};

const batchInverseOf = (studio: Studio, writes: readonly StudioWrite[]): StudioWrite | null => {
  const inverses = [...writes].reverse().map((write) => inverseOf(studio, write, NONE));

  return inverses.some((inverse) => inverse === null) ? null : batchOf(inverses);
};

export const inverseOf = (
  studio: Studio,
  write: StudioWrite,
  created: readonly number[],
): StudioWrite | null => {
  switch (write.kind) {
    case 'songAdd':
    case 'songRestore':
      return removalOf(created, (songId) => ({ kind: 'songRemove', songId }));
    case 'songRemove':
      return songRestoreOf(studio, write.songId);
    case 'finalAdd':
    case 'finalRestore':
      return removalOf(created, (finalTrackId) => ({ kind: 'finalRemove', finalTrackId }));
    case 'finalRemove': {
      const track = finalTrackOf(studio, write.finalTrackId);

      return track === null || track.adopted
        ? null
        : {
            kind: 'finalRestore',
            mediaItemId: track.mediaItemId,
            firstBeatSeconds: track.firstBeatSeconds,
            tempoBpm: track.tempoBpm,
            offsets: track.alignments,
          };
    }
    case 'finalAdopt':
    case 'eveningCopyDrop':
      return null;
    case 'videoAdd':
    case 'videoRestore':
      return removalOf(created, (videoId) => ({ kind: 'videoRemove', videoId }));
    case 'videoRemove':
      return videoRestoreOf(studio, write.videoId);
    case 'spotAdd':
    case 'spotRestore':
      return removalOf(created, (spotId) => ({ kind: 'spotRemove', spotId }));
    case 'spotRemove':
      return studio.spots.some((spot) => spot.spotId === write.spotId)
        ? {
            kind: 'spotRestore',
            person: personOnSpot(studio, write.spotId),
            keyframes: keyframesOf(studio, write.spotId),
          }
        : null;
    case 'spotAssign':
      return spotAssignBefore(studio, write.spotId, write.person);
    case 'tracks':
      return { kind: 'tracks', changes: tracksBefore(studio, write.changes) };
    case 'restore':
      return restoreBefore(studio, write.eventId);
    case 'eveningJoin':
      return { kind: 'eveningLeave', eventId: write.eventId };
    case 'eveningLeave':
      return leavesNothingBehind(studio, write.eventId)
        ? { kind: 'eveningJoin', eventId: write.eventId }
        : null;
    case 'eveningDancer':
      return { ...write, dances: !write.dances };
    case 'eveningSpot':
      return eveningSpotBefore(studio, write.eventId, write.spotId);
    case 'eveningTracks':
      return eveningTracksBefore(studio, write.eventId, write.changes);
    case 'batch':
      return batchInverseOf(studio, write.writes);
  }
};

export const restoredOrderOf = (order: readonly number[], restoredId: number): number[] =>
  order.map((id) => (id === PLACEHOLDER_ID ? restoredId : id));

export const leadKindOf = (write: StudioWrite): StudioWriteKind =>
  write.kind === 'batch' ? (write.writes[0]?.kind ?? write.kind) : write.kind;
