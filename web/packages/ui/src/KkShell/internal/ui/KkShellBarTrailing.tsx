import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkScreenAction, KkScreenSearch } from '../../screen-declaration';
import { KkShellBarAction } from './KkShellBarAction';
import { KkShellBarSearchOpener } from './KkShellBarSearchOpener';

const NO_ACTIONS = 0;

interface KkShellBarTrailingProps {
  search?: KkScreenSearch;
  actions?: readonly KkScreenAction[];
}

export const KkShellBarTrailing: FC<KkShellBarTrailingProps> = ({ search, actions = [] }) => {
  if (search === undefined && actions.length === NO_ACTIONS) {
    return null;
  }

  const opener = search === undefined ? null : <KkShellBarSearchOpener search={search} />;

  return (
    <Stack
      direction="row"
      data-kk-shell-bar-trailing
      sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}
    >
      {opener}
      {actions.map((action) => (
        <KkShellBarAction key={action.id} action={action} />
      ))}
    </Stack>
  );
};
