import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { useTakeStanceMutation } from '../api';
import { IMPORTANCE_LABELS, IMPORTANCE_QUESTION } from '../group-matcher-labels';
import {
  ANSWER_OF_POSITION,
  POSITION_OF_ANSWER,
  stanceWithImportance,
  stanceWithPosition,
} from '../group-matcher-page';
import type { GroupStatement, Importance } from '../schemas';
import { IMPORTANCES } from '../schemas';

const IMPORTANCE_CHOICES: readonly KkChoiceChip[] = IMPORTANCES.map((importance) => ({
  id: String(importance),
  label: IMPORTANCE_LABELS[importance],
}));

const toImportance = (id: string): Importance | null =>
  IMPORTANCES.find((importance) => String(importance) === id) ?? null;

export interface StatementStanceRowControl {
  answer: KkAnswer | null;
  onAnswer: (answer: KkAnswer) => void;
  importanceLabel: string;
  importanceChoiceId: string | null;
  importanceChoices: readonly KkChoiceChip[];
  onImportance: (id: string) => void;
}

export const useStatementStanceRow = (
  groupId: number,
  statement: GroupStatement,
): StatementStanceRowControl => {
  const takeStance = useTakeStanceMutation(groupId);
  const answer = statement.position === null ? null : ANSWER_OF_POSITION[statement.position];
  const importanceChoices = IMPORTANCE_CHOICES.map((choice) => ({
    ...choice,
    disabled: statement.position === null,
  }));

  const onAnswer = (picked: KkAnswer): void => {
    takeStance.mutate(stanceWithPosition(statement, POSITION_OF_ANSWER[picked]));
  };

  const onImportance = (id: string): void => {
    const importance = toImportance(id);
    const stance = importance === null ? null : stanceWithImportance(statement, importance);

    if (stance !== null) {
      takeStance.mutate(stance);
    }
  };

  return {
    answer,
    onAnswer,
    importanceLabel: `${IMPORTANCE_QUESTION} ${statement.text}`,
    importanceChoiceId: statement.importance === null ? null : String(statement.importance),
    importanceChoices,
    onImportance,
  };
};
