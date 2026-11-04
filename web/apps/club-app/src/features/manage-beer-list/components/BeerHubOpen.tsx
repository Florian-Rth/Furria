import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import { BeerHubFilters } from './BeerHubFilters';
import { BeerHubHead } from './BeerHubHead';
import { BeerHubRoster } from './BeerHubRoster';
import { BeerJournal } from './BeerJournal';

const ROSTER_FOCUSES = new Set(['open', 'overdue', 'people']);

interface BeerHubOpenProps {
  open: BeerOpenHub;
}

export const BeerHubOpen: FC<BeerHubOpenProps> = ({ open }) => {
  const hub = useBeerHubContext();
  const roster =
    !hub.isWide && ROSTER_FOCUSES.has(hub.focus) ? <BeerHubRoster rows={open.focusRoster} /> : null;

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <BeerHubHead summary={open.summary} />
      {roster}
      <BeerHubFilters roster={open.roster} />
      <BeerJournal days={open.days} />
    </Stack>
  );
};
