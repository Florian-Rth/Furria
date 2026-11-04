import { KkButton } from '@furria/ui/KkButton';
import { KkChip } from '@furria/ui/KkChip';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HANDOVER_LEAD, HANDOVER_SOON } from '../pour-hub-copy';

const HANDOVER_START = 'Übergabe starten';

export const PourHandoverTab: FC = () => (
  <Stack sx={{ gap: 1.5, alignItems: 'flex-start' }}>
    <KkChip tone="neutral">{HANDOVER_SOON}</KkChip>
    <KkText variant="body2" tone="secondary">
      {HANDOVER_LEAD}
    </KkText>
    <KkButton variant="outlined" disabled>
      {HANDOVER_START}
    </KkButton>
  </Stack>
);
