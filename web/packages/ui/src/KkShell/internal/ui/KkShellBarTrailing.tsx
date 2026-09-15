import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkScreenAction, KkScreenSearch } from '../../screen-declaration';
import { KkShellBarAction } from './KkShellBarAction';

const SEARCH_ACTION_ID = 'kk-shell-search';

const toSearchAction = (search: KkScreenSearch): KkScreenAction => ({
  id: SEARCH_ACTION_ID,
  label: search.openLabel,
  icon: 'search',
  onSelect: search.onOpen,
});

interface KkShellBarTrailingProps {
  search?: KkScreenSearch;
  actions?: readonly KkScreenAction[];
}

export const KkShellBarTrailing: FC<KkShellBarTrailingProps> = ({ search, actions = [] }) => {
  const trailing = search === undefined ? actions : [toSearchAction(search), ...actions];

  if (trailing.length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      data-kk-shell-bar-trailing
      sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}
    >
      {trailing.map((action) => (
        <KkShellBarAction key={action.id} action={action} />
      ))}
    </Stack>
  );
};
