import { KkNote, KkPanelHeader, KkRule, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { toStateStats } from '@/lib/state-chips';
import type { AppStat } from '../person-app-state';

const STATS_TITLE = 'Das Register in Zahlen';

interface PersonsStatsProps {
  totals: Record<MembershipState, number>;
  appStats: readonly AppStat[];
  note: string;
}

export const PersonsStats: FC<PersonsStatsProps> = ({ totals, appStats, note }) => {
  const membershipItems = toStateStats(totals).map((stat) => (
    <KkStatRow.Item key={stat.state}>
      <KkStatRow.Value variant="h3" tone={stat.tone}>
        {stat.count}
      </KkStatRow.Value>
      <KkStatRow.Label>{stat.label}</KkStatRow.Label>
    </KkStatRow.Item>
  ));
  const appItems = appStats.map((stat) => (
    <KkStatRow.Item key={stat.key}>
      <KkStatRow.Value variant="h3" tone="accent">
        {stat.count}
      </KkStatRow.Value>
      <KkStatRow.Label>{stat.label}</KkStatRow.Label>
    </KkStatRow.Item>
  ));

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <KkPanelHeader title={STATS_TITLE} />
      <KkStatRow>
        {membershipItems}
        {appItems}
      </KkStatRow>
      <KkRule weight="hair" />
      <KkNote>{note}</KkNote>
    </Stack>
  );
};
