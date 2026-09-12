import { KkSearchField } from '@furria/ui';
import type { FC } from 'react';

const SEARCH_NAME = 'role-search';
const SEARCH_LABEL = 'Rolle suchen';
const SEARCH_PLACEHOLDER = 'Name oder Aufgabe';
const CLEAR_LABEL = 'Suche leeren';

interface RolesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export const RolesToolbar: FC<RolesToolbarProps> = ({ query, onQueryChange }) => (
  <KkSearchField
    name={SEARCH_NAME}
    label={SEARCH_LABEL}
    clearLabel={CLEAR_LABEL}
    value={query}
    onChange={onQueryChange}
    placeholder={SEARCH_PLACEHOLDER}
  />
);
