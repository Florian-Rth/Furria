import { KkEyebrow, KkFactRow, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { KEY_SECTION_TITLES, toHoldingPeriodLabel, toPersonName } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

const HISTORY_GAP = 1;
const HOLDING_ROUTE = '/manage/keys/holdings/$keyHoldingId';

interface KeyHistoryPanelProps {
  holdings: readonly KeyHolding[];
  highlightedKey: string | null;
}

export const KeyHistoryPanel: FC<KeyHistoryPanelProps> = ({ holdings, highlightedKey }) => {
  if (holdings.length === 0) {
    return null;
  }

  const rows = holdings.map((holding) => {
    const landingKey = toLandingKey('keyHolding', holding.keyHoldingId);

    return (
      <KkFactRow
        key={holding.keyHoldingId}
        title={toPersonName(holding)}
        span={toHoldingPeriodLabel(holding)}
        tone="neutral"
        dimmed
        component={Link}
        to={HOLDING_ROUTE}
        params={{ keyHoldingId: String(holding.keyHoldingId) }}
        highlight={highlightedKey === landingKey}
        landing={landingKey}
      />
    );
  });

  return (
    <Stack sx={{ gap: HISTORY_GAP, minWidth: 0 }}>
      <KkEyebrow tone="muted">{KEY_SECTION_TITLES.ended}</KkEyebrow>
      <KkPanel variant="list">{rows}</KkPanel>
    </Stack>
  );
};
