import { KkNote, KkPanelHeader, KkRule, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';

const STATS_TITLE = 'Das Register in Zahlen';
const STATS_NOTE =
  'Gezählt wird jede Person im Register — auch ohne Mitgliedschaft und ohne Gruppe.';
const ACTIVE_LABEL = 'aktiv';
const ENDED_LABEL = 'beendet';
const WITHOUT_MEMBERSHIP_LABEL = 'kein Mitglied';

interface PersonsStatsProps {
  totals: Record<MembershipState, number>;
}

export const PersonsStats: FC<PersonsStatsProps> = ({ totals }) => (
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
        <KkStatRow.Value variant="h3">{totals.ended}</KkStatRow.Value>
        <KkStatRow.Label>{ENDED_LABEL}</KkStatRow.Label>
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
