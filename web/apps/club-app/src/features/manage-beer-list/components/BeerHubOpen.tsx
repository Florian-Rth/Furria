import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import { BeerHubFilters } from './BeerHubFilters';
import { BeerHubHead } from './BeerHubHead';
import { BeerHubRoster } from './BeerHubRoster';
import { BeerJournal } from './BeerJournal';

interface BeerHubOpenProps {
  open: BeerOpenHub;
}

export const BeerHubOpen: FC<BeerHubOpenProps> = ({ open }) => {
  const hub = useBeerHubContext();
  const showsRoster = !hub.isWide && open.openRoster.length > 0;
  const roster = showsRoster ? <BeerHubRoster rows={open.openRoster} /> : null;

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <BeerHubHead summary={open.summary} />
      {roster}
      <BeerHubFilters />
      <BeerJournal days={open.days} />
    </Stack>
  );
};
