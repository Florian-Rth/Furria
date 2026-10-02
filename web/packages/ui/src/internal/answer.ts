import type { KkTone } from './tone';

export const KK_ANSWERS = ['yes', 'maybe', 'no'] as const;

export type KkAnswer = (typeof KK_ANSWERS)[number];

export const answerTones: Record<KkAnswer, KkTone> = {
  yes: 'green',
  maybe: 'gold',
  no: 'neutral',
};
