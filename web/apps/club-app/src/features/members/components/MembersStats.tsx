import { KkNote, KkPanelHeader, KkRule, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';

const STATS_TITLE = 'Der Verein in Zahlen';
const STATS_NOTE = 'Gezählt wird, wer heute mit dem FCC verbunden ist.';
const ACTIVE_LABEL = 'aktiv';
const PAUSED_LABEL = 'ruht';
const WITHOUT_MEMBERSHIP_LABEL = 'ohne Mitgliedschaft';

interface MembersStatsProps {
  totals: Record<MembershipState, number>;
}

export const MembersStats: FC<MembersStatsProps> = ({ totals }) => (
  <Stack sx={{ gap: 2, minWidth: 0 }}>
    <KkPanelHeader title={STATS_TITLE} />
    <KkStatRow>
      <KkStatRow.Item>
        <KkStatRow.Value variant="h3" tone="accent">
          {totals.active}
        </KkStatRow.Value>
        <KkStatRow.Label>{ACTIVE_LABEL}</KkStatRow.Label>
      </KkStatRow.Item>
      <KkStatRow.Item>
        <KkStatRow.Value variant="h3">{totals.paused}</KkStatRow.Value>
        <KkStatRow.Label>{PAUSED_LABEL}</KkStatRow.Label>
      </KkStatRow.Item>
      <KkStatRow.Item>
        <KkStatRow.Value variant="h3">{totals.none}</KkStatRow.Value>
        <KkStatRow.Label>{WITHOUT_MEMBERSHIP_LABEL}</KkStatRow.Label>
      </KkStatRow.Item>
    </KkStatRow>
    <KkRule weight="hair" />
    <KkNote>{STATS_NOTE}</KkNote>
  </Stack>
);
