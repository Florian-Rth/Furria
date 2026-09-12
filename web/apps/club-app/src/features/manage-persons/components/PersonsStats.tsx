import { KkNote, KkPanelHeader, KkRule, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { toStateStats } from '@/lib/state-chips';

const STATS_TITLE = 'Das Register in Zahlen';
const STATS_NOTE =
  'Gezählt wird jede Person im Register — auch ohne Mitgliedschaft und ohne Gruppe.';

interface PersonsStatsProps {
  totals: Record<MembershipState, number>;
}

export const PersonsStats: FC<PersonsStatsProps> = ({ totals }) => {
  const stats = toStateStats(totals);

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <KkPanelHeader title={STATS_TITLE} />
      <KkStatRow>
        {stats.map((stat) => (
          <KkStatRow.Item key={stat.state}>
            <KkStatRow.Value variant="h3" tone={stat.tone}>
              {stat.count}
            </KkStatRow.Value>
            <KkStatRow.Label>{stat.label}</KkStatRow.Label>
          </KkStatRow.Item>
        ))}
      </KkStatRow>
      <KkRule weight="hair" />
      <KkNote>{STATS_NOTE}</KkNote>
    </Stack>
  );
};
