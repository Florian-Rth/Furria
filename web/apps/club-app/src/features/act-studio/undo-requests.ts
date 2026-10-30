import type { EveningChoreography, Studio } from '@/features/acts/schemas';
import {
  requestChoreographyRestore,
  requestChoreographySave,
  requestEveningChoreographySave,
  requestEveningCopyDrop,
  requestEveningDancer,
  requestEveningJoin,
  requestEveningLeave,
  requestEveningSpot,
  requestFinalTrackAdd,
  requestFinalTrackAdoption,
  requestFinalTrackBeat,
  requestFinalTrackMatch,
  requestFinalTrackOffset,
  requestFinalTrackRemoval,
  requestPartAdd,
  requestPartRemoval,
  requestPartSettings,
  requestSongAdd,
  requestSongOrder,
  requestSongRemoval,
  requestSongSettings,
  requestSpotAdd,
  requestSpotAssignment,
  requestSpotRemoval,
  requestStepMark,
  requestStepRemoval,
  requestStepStart,
  requestStepText,
  requestVideoAdd,
  requestVideoAlignment,
  requestVideoName,
  requestVideoRemoval,
  requestVideoStart,
} from './requests';
import { changedTracksOf } from './studio-spots';
import type { FinalOffset, StepCopy, StudioWrite } from './studio-undo';
import { restoredOrderOf } from './studio-undo';

const NONE: number[] = [];

const inSequence = async <TItem>(
  items: readonly TItem[],
  perform: (item: TItem) => Promise<number[]>,
): Promise<number[]> => {
  const created: number[] = [];
  for (const item of items) {
    created.push(...(await perform(item)));
  }

  return created;
};

const offsetsWritten = (
  actId: number,
  finalTrackId: number,
  offsets: readonly FinalOffset[],
  accessToken: string,
): Promise<number[]> =>
  inSequence(offsets, async (offset) => {
    await requestFinalTrackOffset(actId, { finalTrackId, ...offset }, accessToken);
    return NONE;
  });

const stepRestored = async (
  actId: number,
  step: StepCopy,
  accessToken: string,
): Promise<number[]> => {
  const { stepIds } = await requestStepMark(actId, step.atSeconds, accessToken);
  const restoredId = stepIds.at(-1);
  if (restoredId !== undefined) {
    await requestStepText(
      actId,
      { stepId: restoredId, name: step.name, description: step.description },
      accessToken,
    );
  }

  return stepIds;
};

const eveningCopyOf = (studio: Studio, eventId: number): EveningChoreography | null =>
  studio.evenings.find((evening) => evening.eventId === eventId)?.appearance?.choreography ?? null;

export const performStudioWrite = async (
  actId: number,
  write: StudioWrite,
  studio: Studio,
  accessToken: string,
): Promise<number[]> => {
  switch (write.kind) {
    case 'songAdd':
      return [(await requestSongAdd(actId, write.mediaItemId, accessToken)).songId];
    case 'songRemove':
      await requestSongRemoval(actId, write.songId, accessToken);
      return NONE;
    case 'songRestore': {
      const { songId } = await requestSongAdd(actId, write.mediaItemId, accessToken);
      await requestSongSettings(actId, songId, write.settings, accessToken);
      await requestSongOrder(actId, restoredOrderOf(write.order, songId), accessToken);
      return [songId];
    }
    case 'songOrder':
      await requestSongOrder(actId, write.songIds, accessToken);
      return NONE;
    case 'songSettings':
      await requestSongSettings(actId, write.songId, write.settings, accessToken);
      return NONE;
    case 'finalAdd':
      return [(await requestFinalTrackAdd(actId, write.mediaItemId, accessToken)).finalTrackId];
    case 'finalRemove':
      await requestFinalTrackRemoval(actId, write.finalTrackId, accessToken);
      return NONE;
    case 'finalRestore': {
      const { finalTrackId } = await requestFinalTrackAdd(actId, write.mediaItemId, accessToken);
      await requestFinalTrackBeat(
        actId,
        { finalTrackId, firstBeatSeconds: write.firstBeatSeconds, tempoBpm: write.tempoBpm },
        accessToken,
      );
      await offsetsWritten(actId, finalTrackId, write.offsets, accessToken);
      return [finalTrackId];
    }
    case 'finalBeat':
      await requestFinalTrackBeat(actId, write, accessToken);
      return NONE;
    case 'finalOffsets':
      return offsetsWritten(actId, write.finalTrackId, write.offsets, accessToken);
    case 'finalMatch':
      await requestFinalTrackMatch(actId, write.finalTrackId, accessToken);
      return NONE;
    case 'finalAdopt':
      await requestFinalTrackAdoption(actId, write.finalTrackId, accessToken);
      return NONE;
    case 'stepsMark':
      return (await requestStepMark(actId, write.atSeconds, accessToken)).stepIds;
    case 'stepsRemove':
      return inSequence(write.stepIds, async (stepId) => {
        await requestStepRemoval(actId, stepId, accessToken);
        return NONE;
      });
    case 'stepsRestore':
      return inSequence(write.steps, (step) => stepRestored(actId, step, accessToken));
    case 'stepText':
      await requestStepText(actId, write, accessToken);
      return NONE;
    case 'stepStart':
      await requestStepStart(actId, write, accessToken);
      return NONE;
    case 'partAdd':
      return [(await requestPartAdd(actId, write, accessToken)).partId];
    case 'partRemove':
      await requestPartRemoval(actId, write.partId, accessToken);
      return NONE;
    case 'partRestore': {
      const { partId } = await requestPartAdd(
        actId,
        { firstStepId: write.settings.firstStepId, name: write.settings.name },
        accessToken,
      );
      if (write.settings.mainVideoId !== null) {
        await requestPartSettings(actId, { partId, settings: write.settings }, accessToken);
      }
      return [partId];
    }
    case 'partSettings':
      await requestPartSettings(actId, write, accessToken);
      return NONE;
    case 'videoAdd':
      return [(await requestVideoAdd(actId, write.mediaItemId, accessToken)).videoId];
    case 'videoRemove':
      await requestVideoRemoval(actId, write.videoId, accessToken);
      return NONE;
    case 'videoRestore': {
      const { videoId } = await requestVideoAdd(actId, write.mediaItemId, accessToken);
      if (write.name !== null) {
        await requestVideoName(actId, { videoId, name: write.name }, accessToken);
      }
      if (write.startSeconds !== null) {
        await requestVideoStart(actId, { videoId, startSeconds: write.startSeconds }, accessToken);
      }
      await inSequence(write.parts, async ({ partId, settings }) => {
        await requestPartSettings(
          actId,
          { partId, settings: { ...settings, mainVideoId: videoId } },
          accessToken,
        );
        return NONE;
      });
      return [videoId];
    }
    case 'videoName':
      await requestVideoName(actId, write, accessToken);
      return NONE;
    case 'videoStart':
      await requestVideoStart(actId, write, accessToken);
      return NONE;
    case 'videoAlign':
      await requestVideoAlignment(actId, write.videoId, accessToken);
      return NONE;
    case 'spotAdd':
      return [(await requestSpotAdd(actId, accessToken)).spotId];
    case 'spotRemove':
      await requestSpotRemoval(actId, write.spotId, accessToken);
      return NONE;
    case 'spotRestore': {
      const { spotId } = await requestSpotAdd(actId, accessToken);
      if (write.person !== null) {
        await requestSpotAssignment(actId, spotId, write.person.personId, accessToken);
      }
      if (write.keyframes.length > 0) {
        await requestChoreographySave(
          actId,
          studio.choreography?.version ?? null,
          [{ spotId, keyframes: [...write.keyframes] }],
          accessToken,
        );
      }
      return [spotId];
    }
    case 'spotAssign':
      await requestSpotAssignment(actId, write.spotId, write.person?.personId ?? null, accessToken);
      return NONE;
    case 'tracks':
      await requestChoreographySave(
        actId,
        studio.choreography?.version ?? null,
        changedTracksOf(write.changes),
        accessToken,
      );
      return NONE;
    case 'restore':
      await requestChoreographyRestore(actId, write.eventId, write.version, accessToken);
      return NONE;
    case 'eveningJoin':
      await requestEveningJoin(actId, write.eventId, accessToken);
      return NONE;
    case 'eveningLeave':
      await requestEveningLeave(actId, write.eventId, accessToken);
      return NONE;
    case 'eveningDancer':
      await requestEveningDancer(
        actId,
        write.eventId,
        write.person.personId,
        write.dances,
        accessToken,
      );
      return NONE;
    case 'eveningSpot':
      await requestEveningSpot(
        actId,
        write.eventId,
        write.spotId,
        write.person?.personId ?? null,
        accessToken,
      );
      return NONE;
    case 'eveningTracks': {
      const copy = eveningCopyOf(studio, write.eventId);
      await requestEveningChoreographySave(
        actId,
        write.eventId,
        {
          baseVersion: copy?.version ?? null,
          sessionVersion: copy?.copiedFromVersion ?? null,
          tracks: changedTracksOf(write.changes),
        },
        accessToken,
      );
      return NONE;
    }
    case 'eveningCopyDrop':
      await requestEveningCopyDrop(actId, write.eventId, accessToken);
      return NONE;
    case 'batch':
      return inSequence(write.writes, (part) =>
        performStudioWrite(actId, part, studio, accessToken),
      );
  }
};
