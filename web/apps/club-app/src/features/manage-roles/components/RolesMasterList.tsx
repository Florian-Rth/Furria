import { KkButton, KkIcon, KkMeta, KkPanel, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRoleSearch } from '../hooks/use-role-search';
import { toNoRoleSearchResultLine } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';
import { RolesMasterRow } from './RolesMasterRow';

const SEARCH_NAME = 'role-search';
const SEARCH_LABEL = 'Rolle suchen';
const SEARCH_PLACEHOLDER = 'Name oder Aufgabe';
const CLEAR_LABEL = 'Suche leeren';
const CREATE_LABEL = 'Rolle anlegen';

interface RolesMasterListProps {
  roles: readonly RoleSummary[];
  selectedRoleId: number | null;
  onSelect: (roleId: number) => void;
  onCreate: () => void;
}

export const RolesMasterList: FC<RolesMasterListProps> = ({
  roles,
  selectedRoleId,
  onSelect,
  onCreate,
}) => {
  const search = useRoleSearch(roles);

  const rows = search.entries.map((entry) => (
    <RolesMasterRow
      key={entry.roleId}
      entry={entry}
      selected={entry.roleId === selectedRoleId}
      onSelect={onSelect}
    />
  ));

  const body =
    rows.length === 0 ? (
      <KkMeta italic>{toNoRoleSearchResultLine(search.term ?? '')}</KkMeta>
    ) : (
      <KkPanel variant="list" sx={{ p: 0.75 }}>
        <Stack sx={{ gap: 0.25, minWidth: 0 }}>{rows}</Stack>
      </KkPanel>
    );

  return (
    <Stack sx={{ gap: 1.75, minWidth: 0 }}>
      <KkSearchField
        name={SEARCH_NAME}
        label={SEARCH_LABEL}
        clearLabel={CLEAR_LABEL}
        value={search.query}
        onChange={search.setQuery}
        placeholder={SEARCH_PLACEHOLDER}
      />
      {body}
      <KkButton
        variant="outlined"
        startIcon={<KkIcon name="add" size="small" />}
        onClick={onCreate}
        sx={{ alignSelf: 'flex-start' }}
      >
        {CREATE_LABEL}
      </KkButton>
    </Stack>
  );
};
