import { KkAnswerRollRoot } from './internal/layout/KkAnswerRollRoot';
import { KkAnswerRollGroup } from './internal/ui/KkAnswerRollGroup';
import { KkAnswerRollMeta } from './internal/ui/KkAnswerRollMeta';

export type { KkAnswerRollTone } from './internal/answer-roll-tone';

export const KkAnswerRoll = Object.assign(KkAnswerRollRoot, {
  Meta: KkAnswerRollMeta,
  Group: KkAnswerRollGroup,
});
