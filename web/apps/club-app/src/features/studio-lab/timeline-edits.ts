import type { MusicSegment } from '@furria/studio/music-timeline';
import type { ActStudio } from '@/features/acts/schemas';

export interface BorderEdge {
  kind: 'border';
  key: string;
  seconds: number;
  endingStepId: number | null;
  startingStepId: number | null;
}

export interface CutEdge {
  kind: 'cut';
  key: string;
  seconds: number;
  songId: number;
}

export type TimelineEdge = BorderEdge | CutEdge;

export const MIN_STEP_SECONDS = 0.5;
export const MIN_SONG_SECONDS = 2;
const JOINED_SECONDS = 0.05;

interface TimedStep {
  stepId: number;
  start: number;
  end: number;
}

const timedStepsOf = (studio: ActStudio): TimedStep[] =>
  studio.steps
    .filter((step) => step.placement === 'onTimeline')
    .flatMap((step) =>
      step.startSeconds === null || step.endSeconds === null
        ? []
        : [{ stepId: step.stepId, start: step.startSeconds, end: step.endSeconds }],
    )
    .sort((left, right) => left.start - right.start);

const bordersOf = (steps: readonly TimedStep[]): BorderEdge[] => {
  const borders: BorderEdge[] = [];
  steps.forEach((step, index) => {
    const previous = steps[index - 1];
    const joined = previous !== undefined && Math.abs(previous.end - step.start) < JOINED_SECONDS;
    if (!joined) {
      borders.push({
        kind: 'border',
        key: `start-${step.stepId}`,
        seconds: step.start,
        endingStepId: null,
        startingStepId: step.stepId,
      });
    }
    const next = steps[index + 1];
    const joinsNext = next !== undefined && Math.abs(step.end - next.start) < JOINED_SECONDS;
    borders.push({
      kind: 'border',
      key: joinsNext ? `join-${step.stepId}-${next.stepId}` : `end-${step.stepId}`,
      seconds: step.end,
      endingStepId: step.stepId,
      startingStepId: joinsNext ? next.stepId : null,
    });
  });

  return borders;
};

const orderedSongsOf = (studio: ActStudio): ActStudio['songs'] =>
  [...studio.songs].sort((left, right) => left.position - right.position);

const cutsOf = (studio: ActStudio, segments: readonly MusicSegment[]): CutEdge[] =>
  studio.music.source === 'finalTrack'
    ? []
    : orderedSongsOf(studio).flatMap((song, index) => {
        const segment = segments[index];

        return segment === undefined
          ? []
          : [
              {
                kind: 'cut',
                key: `cut-${song.songId}`,
                seconds: segment.timelineEnd,
                songId: song.songId,
              },
            ];
      });

export const timelineEdgesOf = (
  studio: ActStudio,
  segments: readonly MusicSegment[],
): TimelineEdge[] => [...cutsOf(studio, segments), ...bordersOf(timedStepsOf(studio))];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

const withBorderAt = (
  studio: ActStudio,
  edge: BorderEdge,
  seconds: number,
  length: number,
): ActStudio => {
  const ending = studio.steps.find((step) => step.stepId === edge.endingStepId);
  const starting = studio.steps.find((step) => step.stepId === edge.startingStepId);
  const lower =
    ending?.startSeconds === null || ending === undefined
      ? 0
      : ending.startSeconds + MIN_STEP_SECONDS;
  const upper =
    starting?.endSeconds === null || starting === undefined
      ? length
      : starting.endSeconds - MIN_STEP_SECONDS;
  const at = clamp(seconds, lower, upper);

  return {
    ...studio,
    steps: studio.steps.map((step) => {
      if (step.stepId === edge.endingStepId) {
        return { ...step, endSeconds: at };
      }
      if (step.stepId === edge.startingStepId) {
        return { ...step, startSeconds: at };
      }

      return step;
    }),
  };
};

const shifted = (seconds: number | null, from: number, delta: number): number | null =>
  seconds === null || seconds < from - JOINED_SECONDS ? seconds : seconds + delta;

const withCutAt = (
  studio: ActStudio,
  edge: CutEdge,
  seconds: number,
  segments: readonly MusicSegment[],
): ActStudio => {
  const songs = orderedSongsOf(studio);
  const index = songs.findIndex((song) => song.songId === edge.songId);
  const song = songs[index];
  const segment = segments[index];
  if (song === undefined || segment === undefined) {
    return studio;
  }
  const longest = song.durationSeconds ?? song.endSeconds;
  const endSeconds = clamp(
    song.startSeconds + (seconds - segment.timelineStart),
    song.startSeconds + MIN_SONG_SECONDS,
    longest,
  );
  const delta = endSeconds - song.endSeconds;

  return {
    ...studio,
    songs: studio.songs.map((candidate) =>
      candidate.songId === song.songId ? { ...candidate, endSeconds } : candidate,
    ),
    steps: studio.steps.map((step) => ({
      ...step,
      startSeconds: shifted(step.startSeconds, segment.timelineEnd, delta),
      endSeconds: shifted(step.endSeconds, segment.timelineEnd, delta),
    })),
  };
};

export const withEdgeAt = (
  studio: ActStudio,
  edge: TimelineEdge,
  seconds: number,
  segments: readonly MusicSegment[],
): ActStudio =>
  edge.kind === 'cut'
    ? withCutAt(studio, edge, seconds, segments)
    : withBorderAt(studio, edge, seconds, segments.at(-1)?.timelineEnd ?? 0);
