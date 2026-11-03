import { apiStatusOf, refusalOf, refusalPayloadOf } from '@furria/api-client';
import type { SaveOutcome, ServerWrite, StudioSavePort } from '@furria/studio/save-port';
import type { Choreography } from '@furria/studio/studio-schemas';
import type { QueryClient } from '@tanstack/react-query';
import { requestActStudio } from '@/features/acts/requests';
import type { ActStudio } from '@/features/acts/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type { EveningChoreographyBody } from './requests';
import {
  requestChoreographySave,
  requestEveningChoreographySave,
  requestEveningSpot,
  requestFinalTrackBeat,
  requestFinalTrackOffset,
  requestPartAdd,
  requestPartRemoval,
  requestPartSettings,
  requestSongOrder,
  requestSongSettings,
  requestSpotAdd,
  requestSpotAssignment,
  requestSpotRemoval,
  requestStepMark,
  requestStepRemoval,
  requestStepStart,
  requestStepText,
  requestVideoName,
  requestVideoStart,
} from './requests';
import { choreographyConflictOf } from './studio-conflict';
import { eveningCopyOf, eveningViewOf } from './studio-evening';

const NOT_FOUND_STATUS = 404;
const DONE: SaveOutcome = { kind: 'done' };
const REJECTED: SaveOutcome = { kind: 'rejected' };

export const refusedSaveOf = (write: ServerWrite, error: Error): SaveOutcome | null => {
  const conflict = write.kind === 'tracks' ? choreographyConflictOf(refusalPayloadOf(error)) : null;
  if (conflict !== null) {
    return {
      kind: 'choreographyRefused',
      spotIds: conflict.overlaps.map((overlap) => overlap.spotId),
    };
  }

  return refusalOf(error) !== null || apiStatusOf(error) === NOT_FOUND_STATUS
    ? { kind: 'rejected' }
    : null;
};

const sent = async (request: Promise<void>): Promise<SaveOutcome> => {
  await request;

  return DONE;
};

const performed = async (
  actId: number,
  write: ServerWrite,
  accessToken: string,
): Promise<SaveOutcome> => {
  switch (write.kind) {
    case 'songOrder':
      return sent(requestSongOrder(actId, write.songIds, accessToken));
    case 'songSettings':
      return sent(requestSongSettings(actId, write.songId, write.settings, accessToken));
    case 'finalBeat':
      return sent(requestFinalTrackBeat(actId, write, accessToken));
    case 'finalOffset':
      return sent(requestFinalTrackOffset(actId, write, accessToken));
    case 'spotRemove':
      return sent(requestSpotRemoval(actId, write.spotId, accessToken));
    case 'spotAdd':
      return { kind: 'created', ids: [(await requestSpotAdd(actId, accessToken)).spotId] };
    case 'spotAssign':
      return sent(requestSpotAssignment(actId, write.spotId, write.personId, accessToken));
    case 'partRemove':
      return sent(requestPartRemoval(actId, write.partId, accessToken));
    case 'stepRemove':
      return sent(requestStepRemoval(actId, write.stepId, accessToken));
    case 'stepMove':
      return sent(requestStepStart(actId, write, accessToken));
    case 'stepMark':
      return {
        kind: 'created',
        ids: (await requestStepMark(actId, write.atSeconds, accessToken)).stepIds,
      };
    case 'stepText':
      return sent(requestStepText(actId, write, accessToken));
    case 'partAdd':
      return { kind: 'created', ids: [(await requestPartAdd(actId, write, accessToken)).partId] };
    case 'partSettings':
      return sent(
        requestPartSettings(
          actId,
          {
            partId: write.partId,
            settings: {
              name: write.name,
              firstStepId: write.firstStepId,
              mainVideoId: write.mainVideoId,
            },
          },
          accessToken,
        ),
      );
    case 'videoName':
      return sent(requestVideoName(actId, write, accessToken));
    case 'videoStart':
      return sent(requestVideoStart(actId, write, accessToken));
    case 'tracks': {
      const { version } = await requestChoreographySave(
        actId,
        write.baseVersion,
        trackBodyOf(write.tracks),
        accessToken,
      );

      return { kind: 'choreographySaved', version };
    }
  }
};

type TracksWrite = Extract<ServerWrite, { kind: 'tracks' }>;

const trackBodyOf = (tracks: TracksWrite['tracks']): Choreography['tracks'] =>
  tracks.map((track) => ({ spotId: track.spotId, keyframes: [...track.keyframes] }));

const savedOrRefused = async (
  write: ServerWrite,
  perform: (accessToken: string) => Promise<SaveOutcome>,
): Promise<SaveOutcome> => {
  try {
    return await withFreshAccessToken(perform);
  } catch (error) {
    const refused = error instanceof Error ? refusedSaveOf(write, error) : null;
    if (refused === null) {
      throw error;
    }

    return refused;
  }
};

const loadedStudio = async (actId: number, queryClient: QueryClient): Promise<ActStudio> => {
  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.actStudio(actId),
    queryFn: () => withFreshAccessToken((accessToken) => requestActStudio(actId, accessToken)),
    staleTime: 0,
  });
  if (response.studio === null) {
    throw new Error('The act has no studio.');
  }

  return response.studio;
};

export const studioSavePortOf = (
  actId: number,
  queryClient: QueryClient,
): StudioSavePort<ActStudio> => ({
  save: (write) => savedOrRefused(write, (accessToken) => performed(actId, write, accessToken)),
  load: () => loadedStudio(actId, queryClient),
});

export interface EveningSavePort extends StudioSavePort<ActStudio> {
  observe: (studio: ActStudio) => void;
  copied: () => boolean;
}

export const eveningTracksBodyOf = (
  write: TracksWrite,
  copied: boolean,
): EveningChoreographyBody => ({
  baseVersion: copied ? write.baseVersion : null,
  sessionVersion: copied ? null : write.baseVersion,
  tracks: trackBodyOf(write.tracks),
});

export const eveningSavePortOf = (
  actId: number,
  eventId: number,
  queryClient: QueryClient,
  studio: ActStudio,
): EveningSavePort => {
  let copied = eveningCopyOf(studio, eventId) !== null;

  const eveningPerformed = async (
    write: ServerWrite,
    accessToken: string,
  ): Promise<SaveOutcome> => {
    switch (write.kind) {
      case 'spotAssign':
        await requestEveningSpot(actId, eventId, write.spotId, write.personId, accessToken);
        return DONE;
      case 'tracks': {
        const { version } = await requestEveningChoreographySave(
          actId,
          eventId,
          eveningTracksBodyOf(write, copied),
          accessToken,
        );
        copied = true;

        return { kind: 'choreographySaved', version };
      }
      default:
        return REJECTED;
    }
  };

  return {
    copied: () => copied,
    observe: (fresh) => {
      copied = eveningCopyOf(fresh, eventId) !== null;
    },
    save: (write) => savedOrRefused(write, (accessToken) => eveningPerformed(write, accessToken)),
    load: async () => {
      const fresh = await loadedStudio(actId, queryClient);
      copied = eveningCopyOf(fresh, eventId) !== null;

      return eveningViewOf(fresh, eventId);
    },
  };
};
