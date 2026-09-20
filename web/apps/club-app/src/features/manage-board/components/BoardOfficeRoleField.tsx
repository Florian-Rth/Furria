import { KkFieldRow, KkSelectField } from '@furria/ui';
import type { FC } from 'react';
import { useImpliedRole } from '../hooks/use-implied-role';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  IMPLIED_ROLE_LABEL,
  IMPLIED_ROLE_READ_ONLY_HINT,
  toImpliedRoleStatement,
} from '../manage-board-labels';

const FIELD_NAME = 'impliedRole';

interface BoardOfficeRoleFieldProps {
  entry: BoardOfficeEntry;
}

export const BoardOfficeRoleField: FC<BoardOfficeRoleFieldProps> = ({ entry }) => {
  const implied = useImpliedRole(entry);

  if (!implied.canChange) {
    return (
      <KkFieldRow
        label={IMPLIED_ROLE_LABEL}
        value={toImpliedRoleStatement(entry.impliedRoleName)}
        hint={IMPLIED_ROLE_READ_ONLY_HINT}
      />
    );
  }

  return (
    <KkSelectField
      name={FIELD_NAME}
      label={IMPLIED_ROLE_LABEL}
      value={implied.value}
      options={implied.choices}
      onChange={implied.change}
      presentation="select"
      disabled={implied.isSaving}
    />
  );
};
