import type { KkStatusLevel } from '../../internal/status-paint';

export type KkAnswerRollTone = 'yes' | 'maybe' | 'no' | 'open';

export const ANSWER_ROLL_LEVELS: Record<KkAnswerRollTone, KkStatusLevel> = {
  yes: 'ok',
  maybe: 'attention',
  no: 'broken',
  open: 'unknown',
};
