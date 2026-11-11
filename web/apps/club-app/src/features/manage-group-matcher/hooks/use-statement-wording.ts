import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import type { PoolStatement } from '../schemas';
import type { StatementTextField } from './use-statement-text-field';
import { useStatementTextField } from './use-statement-text-field';

export interface StatementWordingControl {
  field: StatementTextField;
  isChanged: boolean;
  isSaving: boolean;
  isDeleteOpen: boolean;
  save: () => void;
  askDelete: () => void;
  keep: () => void;
  confirmDelete: () => void;
}

export const useStatementWording = (statement: PoolStatement): StatementWordingControl => {
  const { operations } = useGroupMatcherHubContext();
  const field = useStatementTextField(statement.text);

  const save = (): void => {
    const text = field.validate();

    if (text !== null) {
      field.change(text);
      operations.reword(statement.statementId, text);
    }
  };

  return {
    field,
    isChanged: field.text.trim() !== statement.text,
    isSaving: operations.isRewording,
    isDeleteOpen: operations.deleteTarget === statement.statementId,
    save,
    askDelete: () => {
      operations.askDelete(statement.statementId);
    },
    keep: operations.keepStatement,
    confirmDelete: operations.confirmDelete,
  };
};
