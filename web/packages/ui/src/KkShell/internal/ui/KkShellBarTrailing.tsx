import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkScreenAction, KkScreenSearch } from '../../screen-declaration';
import { KkShellBarAction } from './KkShellBarAction';
import { KkShellBarHelp } from './KkShellBarHelp';
import { KkShellBarSearchOpener } from './KkShellBarSearchOpener';

const NO_ACTIONS = 0;

interface KkShellBarTrailingProps {
  search?: KkScreenSearch;
  actions?: readonly KkScreenAction[];
  helpLabel?: string;
  divided: boolean;
}

export const KkShellBarTrailing: FC<KkShellBarTrailingProps> = ({
  search,
  actions = [],
  helpLabel,
  divided,
}) => {
  if (search === undefined && helpLabel === undefined && actions.length === NO_ACTIONS) {
    return null;
  }

  const opener = search === undefined ? null : <KkShellBarSearchOpener search={search} />;
  const help = helpLabel === undefined ? null : <KkShellBarHelp label={helpLabel} />;
  const divider = divided ? (
    <Divider orientation="vertical" flexItem sx={{ my: 1.25, ml: 0.5 }} />
  ) : null;

  return (
    <Stack
      direction="row"
      data-kk-shell-bar-trailing
      sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}
    >
      {opener}
      {help}
      {actions.map((action) => (
        <KkShellBarAction key={action.id} action={action} />
      ))}
      {divider}
    </Stack>
  );
};
