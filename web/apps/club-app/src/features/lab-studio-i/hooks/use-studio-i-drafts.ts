import { useState } from 'react';
import type { StagePoint } from '@/features/act-player/choreography-motion';
import type { StudioStep } from '@/features/acts/schemas';
import type { FormationDraft } from '../studio-i-formation';
import { draftKeyOf } from '../studio-i-formation';
import type { StepSpan } from '../studio-i-spans';
import { spansOf } from '../studio-i-spans';

export interface StudioIDrafts {
  spans: readonly StepSpan[];
  original: readonly StepSpan[];
  names: ReadonlyMap<number, string>;
  notes: ReadonlyMap<number, string>;
  formation: FormationDraft;
  shifts: ReadonlyMap<number, number>;
  setSpans: (spans: readonly StepSpan[]) => void;
  rename: (stepId: number, name: string) => void;
  describe: (stepId: number, note: string) => void;
  place: (stepId: number, spotId: number, point: StagePoint) => void;
  startMove: (stepId: number, spotId: number, seconds: number) => void;
  resetSpot: (stepId: number, spotId: number) => void;
  shift: (videoId: number, seconds: number) => void;
}

const withEntry = <K, V>(map: ReadonlyMap<K, V>, key: K, value: V): Map<K, V> =>
  new Map(map).set(key, value);

const withoutEntry = <K, V>(map: ReadonlyMap<K, V>, key: K): Map<K, V> => {
  const next = new Map(map);
  next.delete(key);
  return next;
};

export const useStudioIDrafts = (steps: readonly StudioStep[]): StudioIDrafts => {
  const [original] = useState(() => spansOf(steps));
  const [spans, setSpans] = useState<readonly StepSpan[]>(original);
  const [names, setNames] = useState<ReadonlyMap<number, string>>(new Map());
  const [notes, setNotes] = useState<ReadonlyMap<number, string>>(new Map());
  const [places, setPlaces] = useState<ReadonlyMap<string, StagePoint>>(new Map());
  const [starts, setStarts] = useState<ReadonlyMap<string, number>>(new Map());
  const [shifts, setShifts] = useState<ReadonlyMap<number, number>>(new Map());

  return {
    spans,
    original,
    names,
    notes,
    formation: { places, starts },
    shifts,
    setSpans,
    rename: (stepId, name) => {
      setNames((known) => withEntry(known, stepId, name));
    },
    describe: (stepId, note) => {
      setNotes((known) => withEntry(known, stepId, note));
    },
    place: (stepId, spotId, point) => {
      setPlaces((known) => withEntry(known, draftKeyOf(stepId, spotId), point));
    },
    startMove: (stepId, spotId, seconds) => {
      setStarts((known) => withEntry(known, draftKeyOf(stepId, spotId), seconds));
    },
    resetSpot: (stepId, spotId) => {
      setPlaces((known) => withoutEntry(known, draftKeyOf(stepId, spotId)));
      setStarts((known) => withoutEntry(known, draftKeyOf(stepId, spotId)));
    },
    shift: (videoId, seconds) => {
      setShifts((known) => withEntry(known, videoId, seconds));
    },
  };
};
