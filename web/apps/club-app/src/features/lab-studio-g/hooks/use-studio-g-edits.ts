import { useState } from 'react';
import type { StagePoint } from '@/features/act-player/choreography-motion';
import type { Studio, StudioStep } from '@/features/acts/schemas';
import { withBordersOf, withVideoStartsOf } from '../studio-g-edits';

export interface StudioGEdits {
  studio: Studio;
  borders: ReadonlyMap<number, number>;
  videoStarts: ReadonlyMap<number, number>;
  moves: ReadonlyMap<string, StagePoint>;
  setBorder: (stepId: number, seconds: number | null) => void;
  setVideoStart: (videoId: number, seconds: number | null) => void;
  setMoves: (moves: ReadonlyMap<string, StagePoint>) => void;
  clearMoves: (keys: readonly string[]) => void;
}

const NO_NUMBERS: ReadonlyMap<number, number> = new Map();
const NO_MOVES: ReadonlyMap<string, StagePoint> = new Map();

const byStart = (left: StudioStep, right: StudioStep): number =>
  (left.startSeconds ?? Number.POSITIVE_INFINITY) -
  (right.startSeconds ?? Number.POSITIVE_INFINITY);

const withEntry = <K>(
  map: ReadonlyMap<K, number>,
  key: K,
  value: number | null,
): ReadonlyMap<K, number> => {
  const next = new Map(map);
  if (value === null) {
    next.delete(key);
  } else {
    next.set(key, value);
  }

  return next;
};

export const useStudioGEdits = (source: Studio): StudioGEdits => {
  const [borders, setBorders] = useState(NO_NUMBERS);
  const [videoStarts, setVideoStarts] = useState(NO_NUMBERS);
  const [moves, setMovesState] = useState(NO_MOVES);
  const ordered = [...source.steps].sort(byStart);

  return {
    studio: {
      ...source,
      steps: withBordersOf(ordered, borders),
      videos: withVideoStartsOf(source.videos, videoStarts),
    },
    borders,
    videoStarts,
    moves,
    setBorder: (stepId, seconds) => {
      setBorders((current) => withEntry(current, stepId, seconds));
    },
    setVideoStart: (videoId, seconds) => {
      setVideoStarts((current) => withEntry(current, videoId, seconds));
    },
    setMoves: (next) => {
      setMovesState((current) => new Map([...current, ...next]));
    },
    clearMoves: (keys) => {
      setMovesState((current) => {
        const next = new Map(current);
        for (const key of keys) {
          next.delete(key);
        }
        return next;
      });
    },
  };
};
