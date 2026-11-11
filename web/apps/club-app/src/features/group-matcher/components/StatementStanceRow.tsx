import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkStatementList } from '@furria/ui/KkStatementList';
import type { FC } from 'react';
import { POSITION_LABELS, STATEMENT_MARKS } from '../group-matcher-labels';
import { useStatementStanceRow } from '../hooks/use-statement-stance-row';
import type { GroupStatement } from '../schemas';

interface StatementStanceRowProps {
  groupId: number;
  statement: GroupStatement;
}

export const StatementStanceRow: FC<StatementStanceRowProps> = ({ groupId, statement }) => {
  const row = useStatementStanceRow(groupId, statement);

  return (
    <KkStatementList.Row text={statement.text} mark={STATEMENT_MARKS[statement.state]}>
      <KkAnswerChoice
        label={statement.text}
        value={row.answer}
        onChange={row.onAnswer}
        labels={POSITION_LABELS}
      />
      <KkChoiceChips
        label={row.importanceLabel}
        choices={row.importanceChoices}
        value={row.importanceChoiceId}
        onChange={row.onImportance}
      />
    </KkStatementList.Row>
  );
};
