import { useState } from 'react';
import { partOfStep } from '@/features/act-player/music-timeline';
import { markSecondsOf } from '@/features/act-studio/studio-steps';
import {
  EIGHTS_NO_STEP,
  EIGHTS_NO_STEP_META,
  stepLeadOf,
  stripEyebrowOf,
  stripMetaOf,
} from '../eights-copy';
import type { EightsStudio } from './use-eights-studio';

const COUNTS_PER_EIGHT = 8;

export interface EightsStrip {
  eyebrow: string;
  number: string | null;
  title: string;
  meta: string;
  name: string;
  hasStep: boolean;
  editable: boolean;
  setName: (name: string) => void;
  commitName: () => void;
  mark: () => void;
  remove: () => void;
}

interface NameDraft {
  stepId: number;
  text: string;
}

export const useEightsStrip = (studio: EightsStudio): EightsStrip => {
  const { screen, editor } = studio;
  const { playback, practice, manual, evening, mode } = screen;
  const { steps, parts, countMarks, player } = playback;
  const [draft, setDraft] = useState<NameDraft | null>(null);
  const step = practice.step;
  const editable = mode.editing && evening === null;

  if (step === null) {
    return {
      eyebrow: stripEyebrowOf(null),
      number: null,
      title: EIGHTS_NO_STEP,
      meta: EIGHTS_NO_STEP_META,
      name: '',
      hasStep: false,
      editable,
      setName: () => undefined,
      commitName: () => undefined,
      mark: () => {
        manual.mark.mutate(markSecondsOf(playback, player.position()));
      },
      remove: () => undefined,
    };
  }

  const start = step.startSeconds ?? 0;
  const end = step.endSeconds ?? start;
  const counts = countMarks.filter((mark) => mark.seconds >= start && mark.seconds < end).length;

  return {
    eyebrow: stripEyebrowOf(partOfStep(parts, step.stepId)?.name ?? null),
    number: stepLeadOf(steps.findIndex((candidate) => candidate.stepId === step.stepId) + 1),
    title: step.name,
    meta: stripMetaOf(Math.round(counts / COUNTS_PER_EIGHT), start, end, editor.selectionText),
    name: draft?.stepId === step.stepId ? draft.text : step.name,
    hasStep: true,
    editable,
    setName: (text) => {
      setDraft({ stepId: step.stepId, text });
    },
    commitName: () => {
      const text = draft?.stepId === step.stepId ? draft.text.trim() : '';
      setDraft(null);
      if (text !== '' && text !== step.name) {
        manual.describe.mutate({ stepId: step.stepId, name: text, description: step.description });
      }
    },
    mark: () => {
      manual.mark.mutate(markSecondsOf(playback, player.position()));
    },
    remove: () => {
      manual.remove.mutate(step.stepId);
    },
  };
};
