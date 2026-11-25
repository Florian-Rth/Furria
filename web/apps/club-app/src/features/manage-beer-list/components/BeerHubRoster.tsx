import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerRosterRow } from '../beer-hub';
import { rosterCentsOf } from '../beer-hub';
import { NO_PEOPLE, ROSTER_LABEL, rosterTotalOf } from '../beer-hub-copy';
import { BEER_HUB_HELP_SPOTS } from '../beer-hub-help-copy';
import { BeerRosterLine } from './BeerRosterLine';

interface BeerHubRosterProps {
  rows: readonly BeerRosterRow[];
}

export const BeerHubRoster: FC<BeerHubRosterProps> = ({ rows }) => {
  const facts = rosterTotalOf(rosterCentsOf(rows));
  const items = rows.map((row) => <BeerRosterLine key={row.person.personId} row={row} />);
  const empty =
    rows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_PEOPLE}
      </KkText>
    ) : null;

  return (
    <Stack
      component="section"
      aria-label={ROSTER_LABEL}
      data-kk-landing={BEER_HUB_HELP_SPOTS.roster}
    >
      <KkPourDay label={ROSTER_LABEL} facts={facts} />
      {empty}
      {items}
    </Stack>
  );
};
