import { KkEyebrow, KkFactRow, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KEY_SECTION_TITLES, toHoldingPeriodLabel, toPersonName } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

const HISTORY_GAP = 1;

interface KeyHistoryPanelProps {
  holdings: readonly KeyHolding[];
}

export const KeyHistoryPanel: FC<KeyHistoryPanelProps> = ({ holdings }) => {
  if (holdings.length === 0) {
    return null;
  }

  const rows = holdings.map((holding) => (
    <KkFactRow
      key={holding.keyHoldingId}
      title={toPersonName(holding)}
      span={toHoldingPeriodLabel(holding)}
      tone="neutral"
      dimmed
    />
  ));

  return (
    <Stack sx={{ gap: HISTORY_GAP, minWidth: 0 }}>
      <KkEyebrow tone="muted" size="small">
        {KEY_SECTION_TITLES.ended}
      </KkEyebrow>
      <KkPanel variant="list">{rows}</KkPanel>
    </Stack>
  );
};
