import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { useClubHubQuery } from '../api';
import { toClubStatEntries } from '../club-labels';

export const ClubStats: FC = () => {
  const clubHub = useClubHubQuery();
  const stats = clubHub.data?.stats;

  if (stats === undefined) {
    return null;
  }

  const entries = toClubStatEntries(stats);

  if (entries.length === 0) {
    return null;
  }

  return (
    <KkStatRow>
      {entries.map((entry) => (
        <KkStatRow.Item key={entry.id}>
          <KkStatRow.Value variant="h2" tone={entry.tone}>
            {entry.count}
          </KkStatRow.Value>
          <KkStatRow.Label>{entry.label}</KkStatRow.Label>
        </KkStatRow.Item>
      ))}
    </KkStatRow>
  );
};
