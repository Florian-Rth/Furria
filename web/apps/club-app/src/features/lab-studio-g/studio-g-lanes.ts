import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioSong, StudioStep, StudioVideo } from '@/features/acts/schemas';

const EXTENSION = /\.[a-z0-9]{2,4}$/i;
const SAME_MOMENT_SECONDS = 0.01;

export interface SongBlock {
  mediaItemId: number;
  number: number;
  name: string;
  start: number;
  end: number;
}

export interface PartBlock {
  partId: number;
  name: string;
  start: number;
  end: number;
}

export interface StepBlock {
  stepId: number;
  number: number;
  name: string;
  start: number;
  end: number;
  opensPart: boolean;
  movable: boolean;
}

export interface VideoBlock {
  videoId: number;
  name: string | null;
  start: number;
  end: number;
  main: boolean;
  outdated: boolean;
}

export interface KeyframeTick {
  seconds: number;
  spotIds: number[];
}

export interface MoveBar {
  start: number;
  end: number;
}

export const songNameOf = (fileName: string): string => fileName.replace(EXTENSION, '');

export const songBlocksOf = (
  segments: readonly MusicSegment[],
  songs: readonly StudioSong[],
): SongBlock[] =>
  segments.flatMap((segment, index) => {
    const song = songs.find((candidate) => candidate.mediaItemId === segment.mediaItemId);

    return song === undefined
      ? []
      : [
          {
            mediaItemId: song.mediaItemId,
            number: index + 1,
            name: songNameOf(song.fileName),
            start: segment.timelineStart,
            end: segment.timelineEnd,
          },
        ];
  });

export const partBlocksOf = (
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): PartBlock[] =>
  parts.flatMap((part) => {
    const owned = steps.filter((step) => part.stepIds.includes(step.stepId));
    const first = owned[0];
    const last = owned.at(-1);

    return first === undefined || last === undefined
      ? []
      : [
          {
            partId: part.partId,
            name: part.name,
            start: first.startSeconds ?? 0,
            end: last.endSeconds ?? last.startSeconds ?? 0,
          },
        ];
  });

export const stepBlocksOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
): StepBlock[] =>
  steps.map((step, index) => {
    const previous = steps[index - 1];
    const part = partOfStep(parts, step.stepId);
    const previousPart = previous === undefined ? null : partOfStep(parts, previous.stepId);

    return {
      stepId: step.stepId,
      number: index + 1,
      name: step.name,
      start: step.startSeconds ?? 0,
      end: step.endSeconds ?? step.startSeconds ?? 0,
      opensPart: index > 0 && part?.partId !== previousPart?.partId,
      movable: previous !== undefined,
    };
  });

export const videoBlocksOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
): VideoBlock[] =>
  videos.flatMap((video) =>
    video.startSeconds === null ||
    video.durationSeconds === null ||
    video.placement !== 'onTimeline'
      ? []
      : [
          {
            videoId: video.videoId,
            name: video.name,
            start: video.startSeconds,
            end: video.startSeconds + video.durationSeconds,
            main: parts.some((part) => part.mainVideoId === video.videoId),
            outdated: video.outdated,
          },
        ],
  );

const shownPathsOf = (paths: readonly SpotPath[], spotIds: readonly number[]): SpotPath[] =>
  spotIds.length === 0 ? [...paths] : paths.filter((path) => spotIds.includes(path.spotId));

export const keyframeTicksOf = (
  paths: readonly SpotPath[],
  spotIds: readonly number[],
): KeyframeTick[] => {
  const ticks: KeyframeTick[] = [];

  for (const path of shownPathsOf(paths, spotIds)) {
    for (const keyframe of path.keyframes) {
      const tick = ticks.find(
        (candidate) => Math.abs(candidate.seconds - keyframe.seconds) < SAME_MOMENT_SECONDS,
      );
      if (tick === undefined) {
        ticks.push({ seconds: keyframe.seconds, spotIds: [path.spotId] });
      } else if (!tick.spotIds.includes(path.spotId)) {
        tick.spotIds.push(path.spotId);
      }
    }
  }

  return ticks.sort((left, right) => left.seconds - right.seconds);
};

const isMove = (path: SpotPath, index: number): boolean => {
  const from = path.keyframes[index];
  const to = path.keyframes[index + 1];

  return (
    from !== undefined &&
    to !== undefined &&
    (to.bend !== null ||
      from.position.rightMetres !== to.position.rightMetres ||
      from.position.backMetres !== to.position.backMetres)
  );
};

export const moveBarsOf = (paths: readonly SpotPath[], spotIds: readonly number[]): MoveBar[] => {
  const raw: MoveBar[] = [];

  for (const path of shownPathsOf(paths, spotIds)) {
    path.keyframes.forEach((keyframe, index) => {
      const next = path.keyframes[index + 1];
      if (next !== undefined && isMove(path, index)) {
        raw.push({ start: keyframe.seconds, end: next.seconds });
      }
    });
  }

  const merged: MoveBar[] = [];
  for (const bar of raw.sort((left, right) => left.start - right.start)) {
    const last = merged.at(-1);
    if (last !== undefined && bar.start <= last.end + SAME_MOMENT_SECONDS) {
      last.end = Math.max(last.end, bar.end);
    } else {
      merged.push({ ...bar });
    }
  }

  return merged;
};
