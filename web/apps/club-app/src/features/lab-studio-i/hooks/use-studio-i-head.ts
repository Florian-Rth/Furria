import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import {
  musicEyebrowOf,
  pageEyebrowOf,
  STUDIO_I_MUSIC_PAGE,
  stepNumberLabelOf,
} from '../studio-i-copy';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

export interface StudioIStepHead {
  kind: 'step';
  number: string;
  numberLabel: string;
  eyebrow: string;
  name: string;
  note: string;
  rename: (name: string) => void;
  describe: (note: string) => void;
}

export interface StudioIMusicHead {
  kind: 'music';
  eyebrow: string;
  title: string;
}

export type StudioIHead = StudioIStepHead | StudioIMusicHead;

export const useStudioIHead = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioIHead => {
  const span = edit.span;

  if (span === null) {
    return {
      kind: 'music',
      eyebrow: musicEyebrowOf(playback.length, studio.songs.length),
      title: STUDIO_I_MUSIC_PAGE,
    };
  }

  const step = studio.steps.find((candidate) => candidate.stepId === span.stepId);
  const part = partOfStep(playback.parts, span.stepId);
  const number = edit.index + 1;

  return {
    kind: 'step',
    number: String(number),
    numberLabel: stepNumberLabelOf(number),
    eyebrow: pageEyebrowOf(part?.name ?? null, number, drafts.spans.length),
    name: drafts.names.get(span.stepId) ?? step?.name ?? '',
    note: drafts.notes.get(span.stepId) ?? step?.description ?? '',
    rename: (name) => {
      drafts.rename(span.stepId, name);
    },
    describe: (note) => {
      drafts.describe(span.stepId, note);
    },
  };
};
