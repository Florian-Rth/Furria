import { KkNote, KkPanelHeader, KkRule, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { toStateStats } from '@/lib/state-chips';
import { toStatsFootnote } from '../members-labels';

const STATS_TITLE = 'Der Verein in Zahlen';

interface MembersStatsProps {
  totals: Record<MembershipState, number>;
}

export const MembersStats: FC<MembersStatsProps> = ({ totals }) => {
  const stats = toStateStats(totals);
  const footnote = toStatsFootnote(totals.none);

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
      <KkNote>{footnote}</KkNote>
    </Stack>
  );
};
